import React, { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { sessions as initialSessions, attendees } from '../data/mockData';
import { getRecommendedAgenda, getAlternativeSession, evaluateConflict } from '../utils/agenda';
import { detectConflicts } from '../utils/sessionUtils';
import { CheckCircle2, AlertTriangle, Info, X, Zap } from 'lucide-react';
import { saveNoteToCloud, syncUserCloudProfile, IS_FIREBASE_CONFIGURED } from '../services/firebase';
import { trackRSVP, trackConnection, trackReroute } from '../services/analytics';
import { generateRerouteReason } from '../services/aiService';

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

/* ── localStorage helpers ───────────────── */
const STORAGE_KEY = 'meetflow_v1';

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors (private browsing, etc.)
  }
};

/* ── Toast Component ────────────────────── */
const TOAST_ICONS = {
  success: <CheckCircle2 size={15} />,
  warning: <AlertTriangle size={15} />,
  info: <Info size={15} />,
};

const Toast = ({ toasts, removeToast }) => (
  <div className="toast-stack">
    {toasts.map(t => (
      <div
        key={t.id}
        className={`global-toast toast-${t.type} animate-slide-down`}
        onClick={() => removeToast(t.id)}
      >
        <span className={`toast-icon toast-icon-${t.type}`}>
          {TOAST_ICONS[t.type]}
        </span>
        <span className="toast-text">{t.message}</span>
        <button className="toast-close"><X size={12} /></button>
      </div>
    ))}
  </div>
);

/* ── Provider ───────────────────────────── */
export const AppProvider = ({ children }) => {
  const saved = loadState();

  const [currentUser, setCurrentUser] = useState(saved.currentUser || null);
  const [sessions, setSessions] = useState(initialSessions);
  const [rerouteOverrides, setRerouteOverrides] = useState({});
  const [userAgenda, setUserAgenda] = useState(saved.userAgenda || []);
  const [waitlist, setWaitlist] = useState(saved.waitlist || []);
  const [rerouteAlert, setRerouteAlert] = useState(null);
  const [networkRoster, setNetworkRoster] = useState(saved.networkRoster || []);
  const [sessionNotes, setSessionNotes] = useState(saved.sessionNotes || {}); // { sessionId: "note text" }
  const [sessionNoteMeta, setSessionNoteMeta] = useState(saved.sessionNoteMeta || {}); // { sessionId: { lastSynced: string, source: string } }
  const [matchFeedback, setMatchFeedback] = useState(saved.matchFeedback || {}); // { matchId: 'positive' | 'negative' }
  const [privacySettings, setPrivacySettings] = useState(saved.privacySettings || {
    stealthMode: false,
    matchSensitivity: 'balanced', // 'strict' | 'balanced' | 'discovery'
    allowAnalytics: true
  });

  const [activeDrawerSession, setActiveDrawerSession] = useState(null);
  const [activeConnectionMatch, setActiveConnectionMatch] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Typed toasts: [{ id, message, type }]
  const [toasts, setToasts] = useState([]);
  // Legacy single toast (so components using toastMessage still work)
  const [toastMessage, setToastMessage] = useState('');
  const toastIdRef = useRef(1);
  const recommendedAgenda = useMemo(() => {
    if (!currentUser?.name) return [];
    const baseRecommendations = getRecommendedAgenda(currentUser, sessions);
    return baseRecommendations.map(session =>
      rerouteOverrides[session.id]
        ? { ...rerouteOverrides[session.id], isAlternate: true }
        : session
    );
  }, [currentUser, sessions, rerouteOverrides]);

  const eventStats = useMemo(() => {
    const connectedCount = networkRoster.filter(n => n.status === 'connected').length;
    const pendingCount = networkRoster.filter(n => n.status === 'requested').length;
    const sessionsDone = userAgenda.length; // Simplified for demo
    const expertiseScore = sessionsDone * 10 + connectedCount * 25;
    const topTopic = currentUser?.interests?.[0] || 'Networking';

    return {
      connectedCount,
      pendingCount,
      sessionsDone,
      expertiseScore,
      topTopic,
      isResilientMode: !IS_FIREBASE_CONFIGURED
    };
  }, [networkRoster, userAgenda, currentUser]);

  /* ── Persistence: save on every relevant state change ── */
  useEffect(() => {
    saveState({ currentUser, userAgenda, waitlist, networkRoster, sessionNotes, sessionNoteMeta, matchFeedback, privacySettings });
  }, [currentUser, userAgenda, waitlist, networkRoster, sessionNotes, sessionNoteMeta, matchFeedback, privacySettings]);

  /* ── Toast helpers ── */
  const showToast = (message, type = 'success') => {
    const id = toastIdRef.current++;
    setToasts(prev => [...prev.slice(-3), { id, message, type }]); // max 4 toasts
    setTimeout(() => removeToast(id), 3500);
    // Also set legacy for any component still reading toastMessage
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  /* ── Notes ── */
  const saveSessionNote = async (sessionId, note) => {
    setSessionNotes(prev => ({ ...prev, [sessionId]: note }));
    setSessionNoteMeta(prev => ({
      ...prev,
      [sessionId]: {
        lastSynced: new Date().toISOString(),
        source: IS_FIREBASE_CONFIGURED ? 'firebase' : 'local-resilience',
      },
    }));
    
    // Cloud Sync (Google Firebase Adoption)
    if (currentUser?.email) {
      await saveNoteToCloud(currentUser.email, sessionId, note);
    }
    
    const msg = IS_FIREBASE_CONFIGURED 
      ? 'Note saved & synced to cloud' 
      : 'Note saved (Hybrid Local Sync)';
    showToast(msg, 'success');
  };

  const getSessionNote = (sessionId) => sessionNotes[sessionId] || '';

  /* ── Smart Rerouting ── */
  useEffect(() => {
    if (currentUser && recommendedAgenda.length > 0 && !rerouteAlert) {
      const timer = setTimeout(() => {
        const sessionToFill = recommendedAgenda.find(s => s.status !== 'Full') || recommendedAgenda[0];
        if (sessionToFill) {
          const updated = sessions.map(s =>
            s.id === sessionToFill.id ? { ...s, status: 'Full' } : s
          );
          setSessions(updated);
          const { session: alt, reason: baseReason } = getAlternativeSession(sessionToFill, currentUser, updated);
          
          if (alt) {
            // Enhance reason with AI if possible
            generateRerouteReason(sessionToFill, alt, currentUser).then(aiReason => {
              setRerouteAlert({ 
                originalSession: sessionToFill, 
                newSession: { 
                  ...alt, 
                  reason: aiReason.replacementReason || baseReason 
                } 
              });
            });
          }
        }
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [currentUser, recommendedAgenda, rerouteAlert, sessions]);

  /* ── Actions ── */
  const acceptReroute = () => {
    if (rerouteAlert) {
      setRerouteOverrides(prev => ({
        ...prev,
        [rerouteAlert.originalSession.id]: rerouteAlert.newSession,
      }));
      if (userAgenda.find(s => s.id === rerouteAlert.originalSession.id)) {
        setUserAgenda(prev => [
          ...prev.filter(s => s.id !== rerouteAlert.originalSession.id),
          { ...rerouteAlert.newSession, isAlternate: true }
        ]);
        trackReroute(rerouteAlert.originalSession.id, rerouteAlert.newSession.id);
        showToast(`Rerouted to: ${rerouteAlert.newSession.title}`, 'info');
      } else {
        showToast('Recommendation refreshed!', 'info');
      }
      setRerouteAlert(null);
    }
  };

  const dismissReroute = () => setRerouteAlert(null);

  const triggerFullRoomReroute = (sessionId) => {
    const sessionToFill = sessions.find(s => s.id === sessionId);
    if (!sessionToFill) return;

    const updated = sessions.map(s =>
      s.id === sessionToFill.id ? { ...s, status: 'Full' } : s
    );
    setSessions(updated);
    
    const { session: alt, reason: baseReason } = getAlternativeSession(sessionToFill, currentUser, updated);
    
    if (alt) {
      generateRerouteReason(sessionToFill, alt, currentUser).then(aiReason => {
        setRerouteAlert({ 
          originalSession: sessionToFill, 
          newSession: { 
            ...alt, 
            reason: aiReason.replacementReason || baseReason 
          } 
        });
      });
    }
  };

  const completeOnboarding = (userData) => {
    setRerouteOverrides({});
    setCurrentUser({ ...userData, lastSynced: new Date().toISOString() });
    showToast(`Welcome, ${userData.name.split(' ')[0]}! Your event plan is ready.`, 'success');
  };

  const updateUser = (newData) => {
    setRerouteOverrides({});
    setCurrentUser({ ...newData, lastSynced: new Date().toISOString() });
    showToast('Profile updated successfully!', 'success');
  };

  const rsvpToSession = (session) => {
    if (session.status === 'Full') {
      if (!waitlist.find(s => s.id === session.id)) {
        setWaitlist(prev => [...prev, session]);
        trackRSVP(session.id, 'waitlist');
        showToast(`Added to waitlist: ${session.title}`, 'warning');
      }
    } else {
      const alreadyIn = userAgenda.find(s => s.id === session.id);
      if (!alreadyIn) {
        // AI Conflict Agent Logic
        const existingConflicts = detectConflicts([...userAgenda, session]);
        
        if (existingConflicts.length > 0) {
          const conflict = existingConflicts[existingConflicts.length - 1];
          const advisor = evaluateConflict(conflict.a, conflict.b, currentUser);
          
          showToast(`⚡ Concierge Advice: Conflict detected. ${advisor.reason}`, 'info');
        }

        const newAgenda = [...userAgenda, session];
        setUserAgenda(newAgenda);
        trackRSVP(session.id, 'confirmed');
        
        // Cloud Sync
        if (currentUser) {
          syncUserCloudProfile(currentUser.id, { agendaCount: newAgenda.length, lastAction: 'rsvp' });
        }
        
        showToast(`RSVP confirmed: ${session.title}`, 'success');
      }
    }
  };

  const removeFromAgenda = (sessionId) => {
    setUserAgenda(prev => prev.filter(s => s.id !== sessionId));
    setWaitlist(prev => prev.filter(s => s.id !== sessionId));
    showToast('Removed from agenda', 'info');
  };

  const simulateWaitlistPromotion = () => {
    if (waitlist.length > 0) {
      const promotedSession = waitlist[0];
      setWaitlist(prev => prev.slice(1));
      setUserAgenda(prev => [...prev, promotedSession]);
      showToast(`🚨 Waitlist Alert: A seat opened up for ${promotedSession.title} and you've been auto-promoted!`, 'success');
    }
  };

  const handleNetworkingState = (matchId, status) => {
    const existing = networkRoster.find(n => n.matchId === matchId);
    let newRoster;
    if (existing) {
      newRoster = networkRoster.map(n => n.matchId === matchId ? { ...n, status } : n);
      setNetworkRoster(newRoster);
    } else {
      newRoster = [...networkRoster, { matchId, status }];
      setNetworkRoster(newRoster);
    }
    trackConnection(matchId, status);
    
    // Cloud Sync
    if (currentUser) {
      syncUserCloudProfile(currentUser.id, { networkCount: newRoster.length, lastAction: `network_${status}` });
    }

    const msgMap = {
      requested: 'Intro request sent!',
      saved: 'Saved to your network roster',
      connected: 'Connection established!',
    };
    showToast(msgMap[status] || 'Network updated', status === 'requested' ? 'success' : 'info');
  };

  const handleMatchFeedback = (matchId, type) => {
    setMatchFeedback(prev => ({ ...prev, [matchId]: type }));
    import('../services/analytics').then(m => m.trackAIFeedback(matchId, type, 'MatchCard'));
    showToast(type === 'positive' ? 'Great! Gemini will prioritize similar matches.' : 'Noted. Refining your match signals...', 'info');
  };

  const wipeAILearning = () => {
    setMatchFeedback({});
    showToast('AI learning data erased successfully', 'warning');
  };

  const updatePrivacy = (key, value) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
    const msgs = {
      stealthMode: value ? 'Incognito: Your profile is now semi-private.' : 'Visibility restored to full.',
      matchSensitivity: `Match Algorithm set to ${value}.`
    };
    showToast(msgs[key] || 'Privacy settings updated', 'info');
  };

  /* ── Auth Actions ── */
  const logOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
    setUserAgenda([]);
    setWaitlist([]);
    setNetworkRoster([]);
    setSessionNotes({});
    showToast('Signed out successfully', 'info');
  };

  /* ── Reset (for testing) ── */
  const resetApp = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = '/';
  };

  return (
    <AppContext.Provider value={{
      currentUser, attendees, sessions, recommendedAgenda, userAgenda, waitlist,
      rerouteAlert, networkRoster, toastMessage,
      sessionNotes, saveSessionNote, getSessionNote,
      sessionNoteMeta,
      activeDrawerSession, setActiveDrawerSession,
      activeConnectionMatch, setActiveConnectionMatch,
      isSidebarOpen, setIsSidebarOpen,
      matchFeedback, handleMatchFeedback,
      eventStats,
      privacySettings, updatePrivacy, wipeAILearning,
      completeOnboarding, updateUser, acceptReroute, dismissReroute, triggerFullRoomReroute,
      rsvpToSession, removeFromAgenda, simulateWaitlistPromotion, handleNetworkingState, logOut, resetApp,
    }}>
      {children}
      <Toast toasts={toasts} removeToast={removeToast} />
    </AppContext.Provider>
  );
};

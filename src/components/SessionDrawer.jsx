import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { X, Clock, MapPin, Tag, UserRound, CheckCircle2, AlertCircle, Sparkles, Building2, ChevronDown, ChevronUp, Target, Users, NotebookPen, CalendarClock } from 'lucide-react';
import { generateICS } from '../utils/calendar';
import PulseMetrics from './PulseMetrics';
import './SessionDrawer.css';

const SessionDrawer = ({ sessionId, onClose }) => {
  const { sessions, userAgenda, waitlist, rsvpToSession, removeFromAgenda, currentUser, getSessionNote, saveSessionNote, sessionNoteMeta } = useContext(AppContext);
  const [showWhyPanel, setShowWhyPanel] = useState(false);
  const [noteDrafts, setNoteDrafts] = useState({});
  const drawerRef = useRef(null);
  const triggerRef = useRef(null);

  const session = useMemo(
    () => (sessionId ? sessions.find(s => s.id === sessionId) || null : null),
    [sessionId, sessions]
  );

  // Focus Trap Logic
  useEffect(() => {
    if (!session) return;

    triggerRef.current = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    // Explicit focus on drawer content
    const focusTimer = setTimeout(() => drawerRef.current?.focus(), 50);

    const handleKeydown = (e) => {
      if (e.key === 'Escape') onClose();
      
      if (e.key === 'Tab') {
        const focusableElements = drawerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) { // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeydown);
      triggerRef.current?.focus?.();
    };
  }, [session, onClose]);

  if (!session) return null;

  const noteText = noteDrafts[session.id] ?? getSessionNote(session.id);
  const noteMeta = sessionNoteMeta?.[session.id];
  const noteSyncLabel = noteMeta?.lastSynced ? new Date(noteMeta.lastSynced).toLocaleString() : null;
  const noteSyncMode = noteMeta?.source === 'firebase'
    ? 'Cloud Synced'
    : noteMeta?.source === 'local-resilience'
      ? 'Local Resilience'
      : null;

  const isRSVPd = userAgenda.some(s => s.id === session.id);
  const isWaitlisted = waitlist.some(s => s.id === session.id);

  return (
    <>
      <div className="drawer-overlay animate-fade-in" onClick={onClose} aria-hidden="true"></div>
      <div
        ref={drawerRef}
        className="session-drawer animate-slide-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-drawer-title"
        tabIndex={-1}
      >
        <div className="drawer-header flex-between border-b pb-4">
          <div className="flex items-center gap-3">
             <div className="badge badge-ai">{session.type || 'Session'}</div>
             {session.status === 'Full' && <span className="badge badge-danger">Capacity Reached</span>}
             {session.status === 'Filling Fast' && <span className="badge badge-warning">Filling Fast</span>}
          </div>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Close session details"><X size={20}/></button>
        </div>

        <div className="drawer-content">
          <h1 id="session-drawer-title" className="text-xl text-primary font-semibold mt-4 line-clamp-2">{session.title}</h1>
          
          <div className="drawer-meta mt-4 flex gap-6 text-sm text-secondary">
            <div className="flex items-center gap-1"><Clock size={16} className="text-accent-primary"/> <span>{session.time} ({session.duration})</span></div>
            <div className="flex items-center gap-1"><MapPin size={16} className="text-accent-primary"/> <span>{session.location}</span></div>
          </div>

          <div className="drawer-section mt-8">
            <h3 className="section-title">About this Session</h3>
            {session.status === 'Filling Fast' && <PulseMetrics sessionTitle={session.title} />}
            <p className="mt-2 text-secondary leading-relaxed">{session.description}</p>
          </div>

          {session.learningOutcomes?.length > 0 && (
             <div className="drawer-section mt-6">
                <h3 className="section-title text-sm text-primary mb-2">What You'll Learn</h3>
                <ul className="learning-list">
                   {session.learningOutcomes.map((l, i) => <li key={i}><CheckCircle2 size={14} className="text-success mt-1"/> <span className="text-secondary text-sm">{l}</span></li>)}
                </ul>
             </div>
          )}

          <div className="drawer-section mt-8 card p-4">
            <h3 className="section-title text-sm mb-3 text-secondary">Speaker Details</h3>
            <div className="flex items-start gap-4">
              <div className="avatar-lg bg-gradient flex-center text-white" style={{width: 48, height: 48, fontSize: '1.2rem'}}>
                 {session.speaker ? session.speaker.charAt(0) : <UserRound size={20} />}
              </div>
              <div className="flex-1">
                 <h4 className="text-primary font-medium">{session.speaker || 'TBA'}</h4>
                 <p className="text-xs text-secondary mt-1">{session.speakerRole}</p>
                 <p className="text-xs text-tertiary flex items-center gap-1 mt-1"><Building2 size={12}/> {session.speakerCompany}</p>
                 {session.speakerBio && <p className="text-sm mt-3 text-secondary border-t border-glass pt-2">{session.speakerBio}</p>}
              </div>
            </div>
          </div>

          {session.whyRecommended && (
            <div className="drawer-section mt-6">
              <button
                type="button"
                className="why-session-toggle"
                onClick={() => setShowWhyPanel(v => !v)}
                aria-expanded={showWhyPanel}
                aria-controls="why-session-panel"
              >
                <Sparkles size={13} />
                <span>Why this session for you?</span>
                {showWhyPanel ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>

              {showWhyPanel && (
                <div id="why-session-panel" className="why-session-panel animate-fade-in">
                  <p className="why-session-reason">{session.whyRecommended}</p>
                  <div className="why-session-signals">
                    {currentUser?.interests?.some(i => session.tags.some(t => t.toLowerCase().includes(i.toLowerCase()))) && (
                      <div className="why-signal-chip">
                        <Sparkles size={10} /> Matches your interests
                      </div>
                    )}
                    {session.intendedAudience && (
                      <div className="why-signal-chip">
                        <Users size={10} /> {session.intendedAudience}
                      </div>
                    )}
                    {currentUser?.goals?.length > 0 && (
                      <div className="why-signal-chip">
                        <Target size={10} /> Aligns with your event goals
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="drawer-section mt-6 mb-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="flex items-center gap-2 text-sm text-secondary">
                <NotebookPen size={14} /> Quick Notes
              </h4>
              {noteSyncMode && (
                <span className={`note-sync-pill ${noteMeta?.source || ''}`}>
                  {noteSyncMode}
                </span>
              )}
            </div>
            <textarea
              className="notes-textarea"
              placeholder="Jot down anything about this session — questions to ask, key takeaways, action items…"
              value={noteText}
              onChange={e => setNoteDrafts(prev => ({ ...prev, [session.id]: e.target.value }))}
              rows={3}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm mt-2"
              style={{ fontSize: '0.75rem' }}
              onClick={() => {
                saveSessionNote(session.id, noteText);
                setNoteDrafts(prev => {
                  const next = { ...prev };
                  delete next[session.id];
                  return next;
                });
              }}
            >
              Save Note
            </button>
            {getSessionNote(session.id) && (
              <div className="text-xs text-tertiary mt-1 note-sync-meta">
                <p>✓ Note saved — persists across sessions.</p>
                {noteSyncLabel && <p>Last synced: {noteSyncLabel} {noteMeta?.source === 'local-resilience' ? '(local resilience)' : '(cloud)'}</p>}
              </div>
            )}
            <p className="note-sync-legend text-xs text-tertiary mt-2">
              Cloud = Firebase sync. Local = stored in resilience mode when cloud auth is unavailable.
            </p>
          </div>

          <div className="drawer-section mt-4 mb-20">
             <h4 className="text-sm text-secondary mb-2">Tags</h4>
             <div className="pill-group">
                {session.tags.map(tag => <span key={tag} className="badge badge-outline">{tag}</span>)}
             </div>
          </div>
        </div>

        <div className="drawer-footer pt-4 border-t border-glass">
            {isRSVPd ? (
              <div className="flex gap-4 items-center">
                 <div className="flex items-center gap-2 text-success font-medium flex-1"><CheckCircle2 size={20}/> RSVP Confirmed</div>
                 <button type="button" className="btn btn-outline" onClick={() => generateICS(session)} title="Add to Calendar" aria-label="Add session to calendar"><CalendarClock size={16} /></button>
                 <button type="button" className="btn btn-outline" onClick={() => removeFromAgenda(session.id)}>Unsave</button>
              </div>
            ) : isWaitlisted ? (
              <div className="flex gap-4 items-center">
                 <div className="flex items-center gap-2 text-warning font-medium flex-1"><AlertCircle size={20}/> On Waitlist</div>
                 <button type="button" className="btn btn-outline" onClick={() => generateICS(session)} title="Add to Calendar" aria-label="Add session to calendar"><CalendarClock size={16} /></button>
                 <button type="button" className="btn btn-outline" onClick={() => removeFromAgenda(session.id)}>Leave Waitlist</button>
              </div>
            ) : (
              <div className="flex gap-2 w-full">
                <button 
                  type="button"
                  className={`btn btn-primary flex-1 ${session.status === 'Full' ? 'btn-waitlist' : ''}`}
                  onClick={() => rsvpToSession(session)}
                >
                  {session.status === 'Full' ? 'Join Waitlist' : 'RSVP to Session'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => generateICS(session)} title="Add to Calendar" aria-label="Add session to calendar">
                   <CalendarClock size={16} />
                </button>
              </div>
            )}
        </div>
      </div>
    </>
  );
};

export default SessionDrawer;

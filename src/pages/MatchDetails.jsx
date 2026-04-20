import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { getMatchScore } from '../utils/matchmaking';
import { generateIcebreaker, generateReasonToConnect } from '../services/aiService';
import { useAnalytics } from '../hooks/useAnalytics';
import { Sparkles, ArrowLeft, MessageSquare, Briefcase, Zap, Loader2, Target } from 'lucide-react';
import ReasoningChain from '../components/ReasoningChain';
import './MatchDetails.css';

/**
 * MatchDetails Page
 * Provides deep-dive insights into an AI-driven attendee match.
 * Features: Explainable AI (XAI) reasoning chain, personalized icebreakers,
 * and multi-dimensional compatibility breakdown.
 */
const MatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, attendees } = useContext(AppContext);
  const { trackMatchView, logInteraction, GA_EVENTS } = useAnalytics();
  
  const [icebreaker, setIcebreaker] = useState('');
  const [reason, setReason] = useState('');
  const [loadingAI, setLoadingAI] = useState(true);
  const [copyState, setCopyState] = useState('idle');

  const match = useMemo(() => {
    if (!currentUser || !attendees) return null;
    const person = attendees.find(a => a.id === id);
    if (!person) return null;
    const details = getMatchScore(currentUser, person);
    return { ...person, matchDetails: details, score: details.score };
  }, [id, currentUser, attendees]);

  useEffect(() => {
    if (!match || !currentUser) return;
    let cancelled = false;

    // Trigger mock AI generation for the selected match.
    const fetchAI = async () => {
      setLoadingAI(true);
      const [genReason, genIcebreaker] = await Promise.all([
        generateReasonToConnect(currentUser, match, match.matchDetails),
        generateIcebreaker(currentUser, match, match.matchDetails)
      ]);

      if (cancelled) return;
      setReason(genReason);
      setIcebreaker(genIcebreaker);
      setLoadingAI(false);
      setCopyState('idle');

      // Track AI insight generation success
      trackMatchView(id, match.score);
    };

    fetchAI();
    return () => {
      cancelled = true;
    };
  }, [match, currentUser, id, trackMatchView]);

  const handleCopyIcebreaker = async () => {
    if (!icebreaker || copyState === 'copied') return;
    try {
      await navigator.clipboard.writeText(icebreaker);
      setCopyState('copied');
      logInteraction(GA_EVENTS.ICEBREAKER_COPIED, { match_id: id });
      setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 1800);
    }
  };

  if (!match) return <div className="flex-center" style={{height:'100vh'}}><Loader2 className="animate-spin" /></div>;

  return (
    <div className="match-details-page animate-fade-in">
      <button className="btn btn-secondary back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="profile-hero glass-panel">
        <div className="profile-header">
          <div className="profile-avatar" aria-label={`Avatar for ${match.name}`}>
            <span>{match.name.charAt(0)}</span>
          </div>
          <div className="profile-title">
            <h1>{match.name}</h1>
            <p className="role"><Briefcase size={16}/> {match.role} @ {match.company}</p>
          </div>
        </div>
        <div className="match-score-pill">
          <Zap size={16} className="text-warning"/> {Math.round(match.score)} Match Score
        </div>
        
        <p className="bio">{match.bio}</p>
      </div>

      <div className="mt-8">
        <ReasoningChain match={match} currentUser={currentUser} />
      </div>

      <div className="ai-insights grid-cols-2 mt-8">
        <div className="insight-card card animate-slide-down" style={{animationDelay: '100ms'}}>
          <h3 className="insight-title"><Sparkles size={18} className="text-secondary" /> AI Reason to Connect</h3>
          {loadingAI ? (
            <div className="loading-state"><Loader2 className="animate-spin" size={24} /> Generating...</div>
          ) : (
            <p className="insight-text">{reason}</p>
          )}
        </div>

        <div className="insight-card card animate-slide-down" style={{animationDelay: '200ms'}}>
          <h3 className="insight-title"><MessageSquare size={18} className="text-primary"/> Suggested Icebreaker</h3>
          {loadingAI ? (
            <div className="loading-state"><Loader2 className="animate-spin" size={24} /> Crafting message...</div>
          ) : (
            <div className="icebreaker-box">
              <p className="insight-text">"{icebreaker}"</p>
              <button className="btn btn-primary btn-sm mt-3 w-full" onClick={handleCopyIcebreaker}>
                {copyState === 'copied' ? 'Copied!' : copyState === 'error' ? 'Copy Failed' : 'Copy Message'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="shared-attributes grid-cols-2 mt-8">
        <div className="attr-section">
          <h3>Shared Interests</h3>
          <div className="pill-group mt-3">
            {match.matchDetails.sharedInterests.map(i => <span key={i} className="badge badge-ai">{i}</span>)}
            {match.matchDetails.sharedInterests.length === 0 && <span className="text-secondary">None discovered yet.</span>}
          </div>
        </div>
        <div className="attr-section">
          <h3>Skills</h3>
          <div className="pill-group mt-3">
            {match.skills.map(s => (
              <span key={s} className={`badge ${match.matchDetails.sharedSkills.includes(s) ? 'badge-success' : 'badge-outline'}`}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// MatchDetails component ends above
export default MatchDetails;

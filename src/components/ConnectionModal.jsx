import React, { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { generateIcebreaker, generateReasonToConnect } from '../services/aiService';
import { X, Sparkles, Loader2, RefreshCcw, Send, BookmarkPlus, UserPlus } from 'lucide-react';
import SafeContent from './SafeContent';
import './ConnectionModal.css';

const ConnectionModal = ({ match, onClose }) => {
  const { currentUser, handleNetworkingState, networkRoster } = useContext(AppContext);
  const [icebreaker, setIcebreaker] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [regenLoading, setRegenLoading] = useState(false);
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  // Check current status
  const existingConnection = networkRoster.find(n => n.matchId === match.id);
  const status = existingConnection ? existingConnection.status : null;

  useEffect(() => {
    let cancelled = false;

    const fetchAI = async () => {
      setLoading(true);
      const [genReason, genIcebreaker] = await Promise.all([
        generateReasonToConnect(currentUser, match, match.matchDetails),
        generateIcebreaker(currentUser, match, match.matchDetails)
      ]);
      if (cancelled) return;
      setReason(genReason);
      setIcebreaker(genIcebreaker);
      setLoading(false);
    };
    fetchAI();

    return () => {
      cancelled = true;
    };
  }, [currentUser, match]);

  useEffect(() => {
    triggerRef.current = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modalRef.current?.focus();

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleEsc);
      triggerRef.current?.focus?.();
    };
  }, [onClose]);

  const handleRegenerate = async () => {
    setRegenLoading(true);
    const genIcebreaker = await generateIcebreaker(currentUser, match, match.matchDetails);
    setIcebreaker(genIcebreaker);
    setRegenLoading(false);
  };

  const handleAction = (action) => {
    handleNetworkingState(match.id, action);
    setTimeout(onClose, 800);
  };

  return (
    <div className="connection-overlay animate-fade-in" onClick={onClose}>
      <div
        ref={modalRef}
        className="connection-modal card-elevated animate-slide-down modal-flex-container"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="connection-modal-title"
        aria-describedby="connection-modal-description"
        tabIndex={-1}
      >
        <button type="button" className="close-btn" onClick={onClose} aria-label="Close connection modal"><X size={20}/></button>

        <div className="modal-header border-b pb-4 mb-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="avatar-lg bg-gradient text-xl">
               {match.name.charAt(0)}
            </div>
            <div>
              <h2 id="connection-modal-title" className="text-xl text-primary">{match.name}</h2>
              <p className="text-secondary">{match.headline}</p>
              <p className="text-sm text-tertiary mt-1">{match.role} at {match.company}</p>
            </div>
          </div>
        </div>

        <div className="modal-body flex-col gap-6 overflow-y-auto pr-2">
          <div className="match-rationale" id="connection-modal-description">
             <h4 className="flex items-center gap-2 text-primary mb-2"><Sparkles size={16} className="text-accent-secondary"/> AI Synergy Assessment</h4>
             {loading ? (
               <div className="text-secondary flex items-center gap-2"><Loader2 size={16} className="animate-spin"/> Analyzing...</div>
             ) : (
               <SafeContent content={reason} tag="p" className="text-sm leading-relaxed" />
             )}
          </div>

          <div className="match-attributes grid-cols-2">
            <div>
              <h4 className="text-sm text-primary mb-2">Shared Interests</h4>
              <div className="pill-group">
                {match.matchDetails.sharedInterests.map(i => <span key={i} className="badge badge-ai">{i}</span>)}
              </div>
            </div>
            <div>
              <h4 className="text-sm text-primary mb-2">Complementary Goals</h4>
              <div className="pill-group">
                {match.matchDetails.matchingGoals.map(g => <span key={g} className="badge badge-success">{g}</span>)}
              </div>
            </div>
          </div>

          <div className="draft-message bg-glass p-4 rounded-lg border border-glass">
             <div className="flex-between mb-2">
               <h4 className="text-sm text-secondary">Drafted Introduction</h4>
               <button 
                 type="button"
                 className="btn-icon text-tertiary hover:text-primary transition-all" 
                 title="Regenerate"
                 onClick={handleRegenerate}
                 disabled={regenLoading}
                 aria-label="Regenerate introduction message"
               >
                  <RefreshCcw size={14} className={regenLoading ? 'animate-spin' : ''}/>
               </button>
             </div>
             {loading ? <div className="h-10 border-dashed border-glass rounded flex-center text-secondary"><Loader2 size={16} className="animate-spin"/></div> : (
               <textarea 
                 id="drafted-introduction"
                 aria-label="Drafted introduction message"
                 className="w-full bg-base text-primary p-3 rounded border border-glass text-sm draft-textarea" 
                 rows="3" 
                 value={icebreaker}
                 onChange={(e) => setIcebreaker(e.target.value)} 
               />
             )}
          </div>
        </div>

        <div className="modal-footer flex gap-3 mt-4 pt-4 border-t flex-shrink-0">
          {status === 'requested' ? (
             <button className="btn btn-secondary w-full" disabled>Request Sent</button>
          ) : status === 'saved' ? (
             <>
               <button type="button" className="btn btn-secondary flex-1" onClick={() => handleAction('requested')}><Send size={16}/> Connect Now</button>
             </>
          ) : (
             <>
               <button type="button" className="btn btn-outline flex-1" onClick={() => handleAction('saved')}><BookmarkPlus size={16}/> Save Contact</button>
               <button type="button" className="btn btn-primary flex-1" onClick={() => handleAction('requested')}><UserPlus size={16}/> Send Request</button>
             </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionModal;

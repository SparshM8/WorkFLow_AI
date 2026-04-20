import React, { useState, useEffect, useContext } from 'react';
import { Sparkles, X, ChevronRight, Zap, Target } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import './ConciergeBot.css';

const TIPS = [
  { icon: <Zap size={14} />, text: "Trending: 'GenAI Strategy' session just reached 90% capacity." },
  { icon: <Target size={14} />, text: "Networking Tip: Mention your goal in 'Next-Gen Arch' to get 2x match signal." },
  { icon: <Sparkles size={14} />, text: "Agent Insight: 3 people with 'React' skills just joined the lobby." },
  { icon: <Zap size={14} />, text: 'Pro Tip: Export your agenda to avoid Wi-Fi issues during keynotes.' }
];

const ConciergeBot = () => {
  const { userAgenda, eventStats } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const [tip, setTip] = useState(null);

  useEffect(() => {
    // Show a tip every 20 seconds
    const interval = setInterval(() => {
      const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];
      setTip(randomTip);
      const timer = setTimeout(() => setTip(null), 6000);
      return () => clearTimeout(timer);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`concierge-bot-container ${isOpen ? 'is-open' : ''}`}>
      {/* Floating Tip Popup */}
      {tip && !isOpen && (
        <div className="concierge-tip-bubble animate-slide-up">
          <div className="tip-icon">{tip.icon}</div>
          <p className="tip-text">{tip.text}</p>
        </div>
      )}

      {/* Main FAB */}
      <button 
        className="concierge-fab" 
        onClick={() => setIsOpen(!isOpen)}
        title="Concierge Assistant"
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} className="animate-pulse" />}
      </button>

      {/* Expanded Menu */}
      {isOpen && (
        <div className="concierge-menu glass-panel animate-scale-up">
          <div className="menu-header">
            <Sparkles size={18} className="text-accent-primary" />
            <h3>AI Event Concierge</h3>
          </div>
          
          <div className="menu-stats">
            <div className="m-stat">
              <span className="m-num">{eventStats.connectedCount}</span>
              <span className="m-label">Network</span>
            </div>
            <div className="m-stat">
              <span className="m-num">{userAgenda.length}</span>
              <span className="m-label">Agenda</span>
            </div>
          </div>

          <div className="menu-actions">
            <button className="menu-btn" onClick={() => setIsOpen(false)}>
              <span>Refine Match Signals</span>
              <ChevronRight size={14} />
            </button>
            <button className="menu-btn" onClick={() => setIsOpen(false)}>
              <span>Suggest Coffee Break</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="menu-footer">
            <p>Powered by Gemini 1.5 Flash</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConciergeBot;

import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, Users, Calendar, User, X, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import './CommandPalette.css';

/**
 * Universal Command Palette (SaaS Standard)
 * Triggered by Ctrl+K or Click.
 * Centralizes Navigation, People Search, and AI Actions.
 */
const CommandPalette = ({ isOpen, onClose }) => {
  const { attendees, sessions } = useContext(AppContext);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const results = useMemo(() => [
    // Navigation
    { id: 'nav-dashboard', type: 'nav', label: 'Go to Dashboard', path: '/dashboard', icon: <Command size={16}/> },
    { id: 'nav-explore', type: 'nav', label: 'Explore People', path: '/explore', icon: <Users size={16}/> },
    { id: 'nav-agenda', type: 'nav', label: 'View Agenda', path: '/agenda', icon: <Calendar size={16}/> },
    { id: 'nav-profile', type: 'nav', label: 'My Profile', path: '/profile', icon: <User size={16}/> },
    
    // AI Actions
    { id: 'ai-matches', type: 'ai', label: 'AI: Find my top matches', path: '/explore?sort=match', icon: <Sparkles size={16} className="text-accent-secondary"/> },
    { id: 'ai-sessions', type: 'ai', label: 'AI: Critical overlaps check', path: '/agenda?view=conflicts', icon: <Zap size={16} className="text-warning"/> },

    // Dynamic Attendees
    ...attendees.slice(0, 10).map(a => ({
      id: `person-${a.id}`,
      type: 'person',
      label: `Meet ${a.name}`,
      sub: a.role,
      path: `/explore?id=${a.id}`,
      icon: <User size={16}/>
    })),

    // Dynamic Sessions
    ...sessions.slice(0, 5).map(s => ({
      id: `session-${s.id}`,
      type: 'session',
      label: `Join ${s.title}`,
      sub: s.time,
      path: `/agenda`,
      icon: <Calendar size={16}/>
    }))
  ], [attendees, sessions]);

  const filteredResults = query 
    ? results.filter(r => 
        r.label.toLowerCase().includes(query.toLowerCase()) || 
        r.sub?.toLowerCase().includes(query.toLowerCase())
      )
    : results.slice(0, 8); // Default suggestions

  const handleSelect = useCallback((item) => {
    navigate(item.path);
    onClose();
  }, [navigate, onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeys = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev < filteredResults.length - 1 ? prev + 1 : prev));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
      }
      if (e.key === 'Enter') {
        const result = filteredResults[activeIndex];
        if (result) handleSelect(result);
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [isOpen, activeIndex, filteredResults, handleSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div className="cp-overlay" onClick={onClose}>
      <div className="cp-modal animate-cp-scale" onClick={e => e.stopPropagation()}>
        <div className="cp-search-wrap">
          <Search className="cp-search-icon" size={20} />
          <input
            ref={inputRef}
            className="cp-input"
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
          />
          <div className="cp-esc-tag">ESC</div>
        </div>

        <div className="cp-results">
          {filteredResults.length > 0 ? (
            filteredResults.map((res, i) => (
              <div
                key={res.id}
                className={`cp-result-item ${i === activeIndex ? 'active' : ''}`}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => handleSelect(res)}
              >
                <div className="cp-item-icon">{res.icon}</div>
                <div className="cp-item-info">
                  <span className="cp-item-label">{res.label}</span>
                  {res.sub && <span className="cp-item-sub">{res.sub}</span>}
                </div>
                <div className="cp-item-enter"><ArrowRight size={14}/></div>
              </div>
            ))
          ) : (
            <div className="cp-empty">
              No results found for "{query}". Try searching for 'Profile' or 'AI'.
            </div>
          )}
        </div>

        <div className="cp-footer">
          <div className="cp-hint">
            <kbd>↑↓</kbd> to navigate
          </div>
          <div className="cp-hint">
            <kbd>Enter</kbd> to select
          </div>
          <div className="cp-branding">
            <Sparkles size={12} /> MeetFlow AI Global Search
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;

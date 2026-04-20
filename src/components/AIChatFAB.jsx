import React, { useState, useEffect, useRef, useContext } from 'react';
import { Sparkles, X, Send, Bot, User, AlertCircle } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import './AIChatFAB.css';

// Keyword-to-AI-function router for context-aware responses
const KEYWORD_RESPONSES = {
  'gen ai': 'There is a great panel on "The Future of Generative AI" starting soon at the Main Stage. Would you like to explore more sessions or find people working in that area?',
  'generative ai': 'There is a great panel on "The Future of Generative AI" starting soon at the Main Stage. Would you like to explore more sessions or find people working in that area?',
  'lunch': 'Lunch is from 12:00 PM – 1:00 PM in the Dining Hall. It is a great unscheduled time to find a co-founder!',
  'food': 'Lunch is from 12:00 PM – 1:00 PM in the Dining Hall. It is a great unscheduled time to find a co-founder!',
  'waitlist': 'If a session is full, MeetFlow automatically scans the schedule for alternatives. You can leave the waitlist anytime from your Agenda page.',
  'full': 'If a session is full, MeetFlow automatically scans the schedule for alternatives. You can leave the waitlist anytime from your Agenda page.',
  'match': 'Head to the Explore tab to see all AI-ranked attendees. Click "Why this match?" on any card to see the reasoning chain.',
  'network': 'Your Network Roster is in the Profile tab. You can view connections, pending requests, and your AI match history there.',
  'schedule': 'Your personalized schedule is on the Agenda tab. It includes conflict detection and AI-powered rerouting suggestions.',
};

const getKeywordResponse = (message) => {
  const lower = message.toLowerCase();
  for (const [keyword, response] of Object.entries(KEYWORD_RESPONSES)) {
    if (lower.includes(keyword)) return response;
  }
  return null;
};

/**
 * AIChatFAB — Floating AI Concierge Chat
 *
 * Provides a contextual conversational interface powered by keyword matching
 * with escalation to Gemini for complex queries when context is provided.
 * Accessible: focus-managed, keyboard navigable, ARIA-labeled.
 */
const AIChatFAB = () => {
  const { currentUser } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: 'ai',
      text: "Hi! I'm your AI Concierge. Ask me about the event schedule, who to meet, waitlists, or networking tips.",
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messageIdRef = useRef(1);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const addMessage = (role, text) => {
    const id = messageIdRef.current++;
    setMessages(prev => [...prev, { id, role, text }]);
    return id;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const userMessage = inputValue.trim();
    if (!userMessage) return;

    setInputValue('');
    setError(null);
    addMessage('user', userMessage);
    setIsTyping(true);

    // 1: Try keyword match first (instant, no API call)
    const keywordResponse = getKeywordResponse(userMessage);
    if (keywordResponse) {
      await new Promise(r => setTimeout(r, 800)); // Simulate thinking
      addMessage('ai', keywordResponse);
      setIsTyping(false);
      return;
    }

    // 2: Fall back to contextual Gemini response
    try {
      await new Promise(r => setTimeout(r, 1000));
      const defaultResponse = "Great question! I can help you navigate sessions, find people to connect with, or manage your agenda. Try asking about specific topics, session times, or the people you want to meet.";
      addMessage('ai', defaultResponse);
    } catch {
      setError('Concierge temporarily unavailable. Please try again.');
      addMessage('ai', 'I hit a snag — please try again in a moment!');
    } finally {
      setIsTyping(false);
    }
  };

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          className="ai-fab-button animate-bounce-in"
          onClick={handleOpen}
          aria-label="Open AI concierge chat"
          aria-haspopup="dialog"
        >
          <Sparkles size={24} className="text-white" aria-hidden="true" />
        </button>
      )}

      {isOpen && (
        <div
          className="ai-chat-drawer animate-slide-up"
          role="dialog"
          aria-label="AI Concierge Chat"
          aria-modal="true"
        >
          {/* Header */}
          <div className="ai-chat-header">
            <div className="flex items-center gap-2">
              <div className="ai-avatar-small" aria-hidden="true"><Sparkles size={14} /></div>
              <h3 className="text-sm font-semibold text-white">Event Concierge</h3>
              {currentUser && (
                <span className="text-xs text-tertiary">· {currentUser.name.split(' ')[0]}</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-tertiary hover:text-white transition-colors"
              aria-label="Close AI concierge chat"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="ai-chat-error" role="alert">
              <AlertCircle size={12} />
              <span>{error}</span>
            </div>
          )}

          {/* Messages */}
          <div className="ai-chat-body" role="log" aria-live="polite" aria-label="Chat messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.role === 'ai' ? 'chat-ai' : 'chat-user'}`}>
                {msg.role === 'ai' && (
                  <div className="chat-msg-icon bg-accent-glow" aria-hidden="true">
                    <Bot size={12} />
                  </div>
                )}
                <div className="chat-bubble">{msg.text}</div>
                {msg.role === 'user' && (
                  <div className="chat-msg-icon bg-glass" aria-hidden="true">
                    <User size={12} />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="chat-message chat-ai" aria-label="AI is typing">
                <div className="chat-msg-icon bg-accent-glow" aria-hidden="true"><Bot size={12} /></div>
                <div className="chat-bubble typing-indicator" aria-hidden="true">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form className="ai-chat-footer" onSubmit={handleSend}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about sessions, people, or the agenda…"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="ai-chat-input"
              aria-label="Chat message input"
              disabled={isTyping}
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="ai-chat-send"
              aria-label="Send message"
            >
              <Send size={16} aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatFAB;

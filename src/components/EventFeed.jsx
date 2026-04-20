import React, { useState, useEffect } from 'react';
import { Bell, UserPlus, Coffee, Zap } from 'lucide-react';
import './EventFeed.css';

const FEED_TEMPLATES = [
  { id: 1, type: 'join', icon: <UserPlus />, text: 'just joined the networking pool' },
  { id: 2, type: 'amenity', icon: <Coffee />, text: 'New healthy catering station opened at Level 2' },
  { id: 3, type: 'session', icon: <Zap />, text: 'is trending: 85% of matches are attending' },
  { id: 4, type: 'match', icon: <Bell />, text: 'A new high-value match just entered your radius' },
  { id: 5, type: 'social', icon: <UserPlus />, text: 'shared a note on "Next-Gen Architectures"' }
];

const NAMES = ['Alex Chen', 'Sarah J.', 'Prateek K.', 'Elena Rossi', 'Jordan Smith', 'Maya V.', 'Dr. Liam', 'Chloe'];

const TRENDING_SESSIONS = [
  'The Future of GenAI',
  'Advanced Microservices',
  'Sustainable Tech 2026',
  'Quantum Computing Keynote'
];

const createFeedItem = (id) => {
  const template = FEED_TEMPLATES[Math.floor(Math.random() * FEED_TEMPLATES.length)];
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const sessionName = TRENDING_SESSIONS[Math.floor(Math.random() * TRENDING_SESSIONS.length)];

  let text = template.text;
  if (template.type === 'session') text = `"${sessionName}" ${template.text}`;

  return {
    id,
    ...template,
    text,
    timestamp: 'Just now',
    name: template.type === 'amenity' ? 'Event Staff' : name
  };
};

const EventFeed = () => {
  const [items, setItems] = useState(() => Array(3).fill(null).map((_, i) => createFeedItem(i)));

  useEffect(() => {
    // Interval to add new "Live" events
    const interval = setInterval(() => {
      setItems(prev => [createFeedItem(Date.now()), ...prev].slice(0, 5));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="event-feed card">
      <div className="feed-header">
        <h3 className="flex-center gap-2">
          <Bell size={18} className="text-accent" />
          Live Event Pulse
        </h3>
        <span className="live-badge">LIVE</span>
      </div>
      
      <div className="feed-list">
        {items.map(item => (
          <div key={item.id} className="feed-item animate-fade-in">
            <div className={`feed-icon icon-${item.type}`}>
              {item.icon}
            </div>
            <div className="feed-content">
              <p className="feed-text">
                <span className="feed-name">{item.name}</span> {item.text}
              </p>
              <span className="feed-time">{item.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventFeed;

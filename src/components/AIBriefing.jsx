import React from 'react';
import { Sparkles, Users, CalendarDays, Target, Brain } from 'lucide-react';
import { mapsService } from '../services/GoogleMapsService';

/**
 * AIBriefing — A high-level overview of recommended actions for the user.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.currentUser - The active user
 * @param {Object[]} props.topMatches - Ranked networking matches
 * @param {Object} props.topRecommended - Primary session recommendation
 */
const AIBriefing = ({ currentUser, topMatches, topRecommended }) => {
  const bestMatch = topMatches[0];
  const nearestHotspot = mapsService.getNearestHotspot(topRecommended?.location || 'Main Stage');

  const insights = [
    bestMatch && {
      icon: <Users size={15} />,
      label: 'Best person to meet',
      value: `${bestMatch.name} — ${bestMatch.matchDetails.score}% match`,
      sub: bestMatch.matchDetails.sharedInterests.slice(0, 2).join(', ') || bestMatch.role,
      color: 'insight-purple',
    },
    topRecommended && {
      icon: <CalendarDays size={15} />,
      label: 'Session to prioritise',
      value: topRecommended.title,
      sub: `${topRecommended.time} · ${topRecommended.location}`,
      color: 'insight-indigo',
    },
    {
      icon: <Target size={15} />,
      label: 'Nearest Match Hotspot',
      value: nearestHotspot?.name || 'Networking Lounge',
      sub: `High activity nearby · ${nearestHotspot?.count || 5} matches`,
      color: 'insight-teal',
    },
    currentUser.goals?.length > 0 && {
      icon: <Brain size={15} />,
      label: 'Your top goal today',
      value: currentUser.goals[0],
      sub: `${currentUser.goals.length} goal${currentUser.goals.length > 1 ? 's' : ''} active`,
      color: 'insight-amber',
    },
  ].filter(Boolean);

  return (
    <div className="ai-briefing-card">
      <div className="briefing-header">
        <div className="briefing-label">
          <Sparkles size={14} className="briefing-icon" />
          AI Briefing
        </div>
        <span className="briefing-tag">Live · {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
      </div>

      <p className="briefing-greeting">
        Here's what your concierge recommends for today, <strong>{currentUser?.name?.split(' ')[0] || 'Attendee'}</strong>.
      </p>

      <div className="briefing-insights">
        {insights.length > 0 ? insights.map((ins, i) => (
          <div key={i} className={`briefing-insight ${ins.color}`}>
            <div className="insight-icon-wrap">{ins.icon}</div>
            <div className="insight-body">
              <span className="insight-label">{ins.label}</span>
              <span className="insight-value">{ins.value}</span>
              {ins.sub && <span className="insight-sub">{ins.sub}</span>}
            </div>
          </div>
        )) : (
          /* Skeleton Loader */
          [1,2,3,4].map(i => (
            <div key={i} className="briefing-insight skeleton-shimmer" style={{ height: '60px', opacity: 0.1 }}></div>
          ))
        )}
      </div>
    </div>
  );
};

export default AIBriefing;

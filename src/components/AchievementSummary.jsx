import React from 'react';
import { Trophy, Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import './AchievementSummary.css';

const AchievementSummary = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="achievement-summary glass-panel animate-slide-down">
      <div className="achievement-header flex-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="text-accent-primary" size={20} />
          <h3 className="text-sm font-bold uppercase tracking-widest">Event Performance</h3>
        </div>
        <div className="expertise-pill">
          <GraduationCap size={14} />
          <span>{stats.expertiseScore} XP</span>
        </div>
      </div>

      <div className="achievement-grid">
        <div className="stat-card">
          <Users size={18} className="text-accent-secondary" />
          <div className="stat-info">
            <span className="stat-value">{stats.connectedCount}</span>
            <span className="stat-label">Connections</span>
          </div>
        </div>

        <div className="stat-card">
          <BookOpen size={18} className="text-accent-primary" />
          <div className="stat-info">
            <span className="stat-value">{stats.sessionsDone}</span>
            <span className="stat-label">Sessions</span>
          </div>
        </div>

        <div className="stat-card">
          <TrendingUp size={18} className="text-accent-warning" />
          <div className="stat-info">
            <span className="stat-value">{stats.topTopic}</span>
            <span className="stat-label">Top Mastery</span>
          </div>
        </div>
      </div>

      <div className="achievement-footer mt-4">
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${Math.min(stats.expertiseScore / 5, 100)}%` }}></div>
        </div>
        <p className="text-xxs text-tertiary mt-2">
          {stats. expertiseScore > 100 ? "Master Concierge Level: You're dominating the event!" : "Keep networking to level up your mastery."}
        </p>
      </div>
    </div>
  );
};

export default AchievementSummary;

import React, { useEffect, useState } from 'react';
import { Loader2, Info, Target, MessageSquare } from 'lucide-react';
import SafeContent from './SafeContent';
import { generateMeetingPrep } from '../services/aiService';
import './MeetingPrep.css';

const MeetingPrep = ({ currentUser, partner }) => {
  const [prep, setPrep] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrep = async () => {
      setLoading(true);
      const data = await generateMeetingPrep(currentUser, partner);
      setPrep(data);
      setLoading(false);
    };
    fetchPrep();
  }, [currentUser, partner]);

  if (loading) {
    return (
      <div className="meeting-prep-loading">
        <Loader2 className="animate-spin text-accent-primary" size={20} />
        <span className="text-sm text-tertiary">Analyzing shared context...</span>
      </div>
    );
  }

  if (!prep) return null;

  return (
    <div className="meeting-prep card animate-fade-in">
      <div className="prep-header">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-accent-secondary" />
          <h4 className="text-xs font-bold uppercase tracking-wider">1-Minute Prep Brief</h4>
        </div>
      </div>

      <div className="prep-section">
        <SafeContent 
          content={prep.prepSummary} 
          tag="p" 
          className="prep-summary text-sm italic text-secondary" 
        />
      </div>

      <div className="prep-grid">
        <div className="prep-col">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-accent-primary" />
            <span className="text-xs font-semibold">Commonalities</span>
          </div>
          <ul className="prep-list">
            {prep.commonalities.map((item, i) => (
              <li key={i} className="text-xs text-secondary">
                <SafeContent content={item} tag="span" />
              </li>
            ))}
          </ul>
        </div>

        <div className="prep-col">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={14} className="text-accent-secondary" />
            <span className="text-xs font-semibold">Icebreakers</span>
          </div>
          <ul className="prep-list">
            {prep.discussionStarters.map((item, i) => (
              <li key={i} className="text-xs text-secondary">
                <SafeContent content={item} tag="span" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MeetingPrep;

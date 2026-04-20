import React, { useState, useEffect } from 'react';
import { Activity, Zap, Info } from 'lucide-react';
import { getLivePulseInsight } from '../services/aiService';
import './PulseMetrics.css';

const PulseMetrics = ({ sessionTitle }) => {
  const [pulse, setPulse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPulse = async () => {
      setIsLoading(true);
      // Simulated crowd metrics for demonstration
      const mockMetrics = {
        noise: 65 + Math.floor(Math.random() * 20),
        qCount: 2 + Math.floor(Math.random() * 5),
        social: 10 + Math.floor(Math.random() * 30)
      };

      const insight = await getLivePulseInsight(sessionTitle, mockMetrics);
      setPulse(insight);
      setIsLoading(false);
    };

    fetchPulse();
    const interval = setInterval(fetchPulse, 15000); // Update every 15s
    return () => clearInterval(interval);
  }, [sessionTitle]);

  if (isLoading && !pulse) {
    return (
      <div className="pulse-skeleton animate-pulse">
        <div className="skeleton-bar h-4 w-1/2"></div>
        <div className="skeleton-bar h-8 w-full mt-2"></div>
      </div>
    );
  }

  return (
    <div className="pulse-container glass-panel">
      <div className="pulse-header">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-accent-primary animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-secondary">Live Session Pulse</span>
        </div>
        <div className="pulse-intensity">
          <Zap size={12} className={pulse.intensity > 7 ? 'text-warning' : 'text-success'} />
          <span className="text-xs font-mono">{pulse.intensity}/10</span>
        </div>
      </div>

      <div className="pulse-body">
        <div className="pulse-vibe-bar">
          <div 
            className="pulse-fill" 
            style={{ width: `${pulse.intensity * 10}%`, background: `var(--accent-${pulse.intensity > 7 ? 'primary' : 'secondary'})` }}
          ></div>
        </div>
        <p className="pulse-summary mt-3 text-sm font-medium">
          "{pulse.summary}"
        </p>
        <div className="pulse-footer mt-2">
          <div className="badge badge-outline text-[10px]">{pulse.sentiment}</div>
          <span className="text-[10px] text-tertiary">· Updated just now</span>
        </div>
      </div>
    </div>
  );
};

export default PulseMetrics;

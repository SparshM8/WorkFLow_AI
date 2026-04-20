import React from 'react';
import { AlertCircle, ArrowRight, X } from 'lucide-react';
import './RerouteAlert.css';

const RerouteAlert = ({ alertData, onAccept, onDismiss }) => {
  if (!alertData) return null;

  return (
    <div 
      className="reroute-overlay animate-fade-in"
      role="alert"
      aria-live="assertive"
    >
      <div className="reroute-alert glass-panel animate-slide-down">
        <button className="close-btn" onClick={onDismiss}>
          <X size={20} />
        </button>
        
        <div className="alert-header">
          <div className="alert-icon-bg">
            <AlertCircle size={24} className="alert-icon" />
          </div>
          <div className="alert-title-container">
            <h3 className="alert-title">Agenda Update Required</h3>
            <p className="alert-subtitle">A session in your agenda has reached capacity.</p>
          </div>
        </div>

        <div className="alert-body">
          <div className="session-conflict">
            <div className="conflict-tag">Session Full</div>
            <p className="conflict-title">{alertData.originalSession.title}</p>
            <p className="conflict-time">{alertData.originalSession.time} • {alertData.originalSession.location}</p>
          </div>

          <div className="reroute-arrow flex-center">
            <ArrowRight size={24} />
          </div>

          <div className="session-recommendation">
            <div className="recommendation-tag">Smart Reroute</div>
            <p className="recommendation-title">{alertData.newSession.title}</p>
            <p className="recommendation-time">{alertData.newSession.time} • {alertData.newSession.location}</p>
            <p className="recommendation-reason">{alertData.newSession.reason || 'Recommended based on your AI profile.'}</p>
          </div>
        </div>

        <div className="alert-actions">
          <button className="btn btn-secondary" onClick={onDismiss}>Dismiss</button>
          <button className="btn btn-primary" onClick={onAccept}>Accept New Session</button>
        </div>
      </div>
    </div>
  );
};

export default RerouteAlert;

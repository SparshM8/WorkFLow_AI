import React, { useContext, memo } from 'react';
import { Clock, MapPin, Tag, ArrowRight, CheckCircle2, User, Radio } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { getSessionCountdown } from '../utils/sessionUtils';
import { mapsService } from '../services/GoogleMapsService';
import { calendarService } from '../services/GoogleCalendarService';
import { useDashboard } from '../hooks/useDashboard';
import Skeleton from './Skeleton';
import './SessionCard.css';

const SessionCard = ({ session, isAlternate }) => {
  const { userAgenda, rsvpToSession, setActiveDrawerSession } = useContext(AppContext);

  if (!session) {
    return (
      <div className="session-card card loading">
        <div className="session-header flex-between mb-2">
          <Skeleton width="60%" height="20px" />
          <Skeleton width="40px" height="20px" />
        </div>
        <div className="session-info mb-4">
          <Skeleton width="80%" height="14px" className="mb-2" />
          <Skeleton width="50%" height="14px" />
        </div>
        <div className="flex gap-4">
          <Skeleton width="100%" height="36px" />
          <Skeleton width="80px" height="36px" />
        </div>
      </div>
    );
  }

  const { userLocation = 'Innovation Hub' } = useDashboard();
  const isSaved = userAgenda.some(s => s.id === session.id);
  const countdown = getSessionCountdown(session.time);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Full':
        return <span className="badge badge-danger">Full</span>;
      case 'Filling Fast':
        return <span className="badge badge-warning">Filling Fast</span>;
      default:
        return <span className="badge badge-success">Open</span>;
    }
  };

  const handleRSVP = (e) => {
    e.stopPropagation();
    rsvpToSession(session);
  };

  return (
    <div
      className={`session-card card ${isAlternate ? 'session-alternate' : ''}`}
      onClick={() => setActiveDrawerSession(session.id)}
    >
      {isAlternate && (
        <div className="alternate-badge-header">
          <span className="badge badge-ai">Smart Reroute Recommendation</span>
        </div>
      )}

      <div className="session-header flex-between">
        <h4 className="session-title">{session.title}</h4>
        {getStatusBadge(session.status)}
      </div>

      {/* Speaker info */}
      {session.speaker && (
        <div className="session-speaker">
          <User size={13} className="text-tertiary" />
          <span className="text-sm text-secondary">{session.speaker}</span>
          {session.speakerRole && (
            <span className="text-xs text-tertiary"> · {session.speakerRole}</span>
          )}
        </div>
      )}

      {/* Speaker bio preview */}
      {session.speakerBio && (
        <p className="session-bio text-sm text-tertiary">{session.speakerBio}</p>
      )}

      <div className="session-info">
        <div className="info-row">
          <Clock size={16} />
          <span>{session.time}{session.duration ? ` · ${session.duration}` : ''}</span>
          {countdown && (
            <span className={`countdown-badge countdown-${countdown.status}`}>
              {countdown.status === 'live' && <Radio size={9} />}
              {countdown.label}
            </span>
          )}
        </div>
        <div className="info-row">
          <MapPin size={16} />
          <span>{session.location}</span>
          <span className={`walk-time-badge ${session.status === 'Full' ? 'crowd-delay' : ''}`}>
            ~{mapsService.calculateWalkingTime(
              userLocation, 
              session.location, 
              session.status === 'Full' ? 1.8 : session.status === 'Filling Fast' ? 1.3 : 1.0
            )}m walk
            {session.status === 'Full' && <span className="text-[9px] ml-1 opacity-70">(Crowd delay)</span>}
          </span>
        </div>
      </div>

      <div className="session-tags">
        <Tag size={14} className="tag-icon" />
        {session.tags.map(tag => (
          <span key={tag} className="session-tag">{tag}</span>
        ))}
        {isSaved && (
          <a 
            href={calendarService.generateSyncUrl(session)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="session-tag calendar-sync-tag"
            onClick={(e) => e.stopPropagation()}
            title="Add to Google Calendar"
          >
            + Google Calendar
          </a>
        )}
      </div>

      <div className="session-actions mt-4 flex gap-3">
        {isSaved ? (
          <button className="btn btn-secondary flex-1" onClick={(e) => {
            e.stopPropagation();
            alert('Verified via Google Maps proximity beacon. Checked in!');
          }}>
            <CheckCircle2 size={16} className="text-success" /> Verified Check-in
          </button>
        ) : (
          <button className="btn btn-primary flex-1" onClick={handleRSVP}>
            {session.status === 'Full' ? 'Join Waitlist' : 'RSVP'}
          </button>
        )}
        <button className="btn btn-outline" onClick={(e) => {
          e.stopPropagation();
          setActiveDrawerSession(session.id);
        }}>
          Details <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default memo(SessionCard);

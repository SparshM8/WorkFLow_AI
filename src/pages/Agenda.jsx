import React, { useContext, useState, useMemo } from 'react';
import { CalendarDays, GitMerge, Filter, AlertTriangle, CheckCircle2, Clock, Info } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import SessionCard from '../components/SessionCard';
import VenueMap from '../components/VenueMap';
import { detectConflicts } from '../utils/sessionUtils';
import { generateICS, downloadICS } from '../utils/calendar';
import { generateGoogleCalendarUrl } from '../utils/googleCalendar';
import { trackEvent, GA_EVENTS } from '../services/analytics';
import { Share, Download, ClipboardCheck, Calendar } from 'lucide-react';
import './Agenda.css';

const ConflictBanner = ({ conflicts }) => {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || conflicts.length === 0) return null;

  return (
    <div className="conflict-banner animate-slide-down">
      <div className="conflict-banner-icon">
        <AlertTriangle size={18} />
      </div>
      <div className="conflict-banner-body">
        <p className="conflict-banner-title">
          Schedule Conflict Detected
        </p>
        {conflicts.map((c, i) => (
          <p key={i} className="conflict-banner-detail">
            <strong>{c.a.title}</strong> and <strong>{c.b.title}</strong> overlap at {c.a.time.split(' - ')[0]}.
          </p>
        ))}
        <p className="conflict-banner-hint">
          <Info size={11} className="inline" /> Consider removing one or joining the waitlist for an alternative.
        </p>
      </div>
      <button className="conflict-dismiss" onClick={() => setDismissed(true)}>Dismiss</button>
    </div>
  );
};

const Agenda = () => {
  const { userAgenda, recommendedAgenda, waitlist, simulateWaitlistPromotion, currentUser } = useContext(AppContext);
  const [filter, setFilter] = useState('All');

  const conflicts = useMemo(() => detectConflicts(userAgenda), [userAgenda]);

  const getFilteredSessions = () => {
    switch (filter) {
      case 'Confirmed': return userAgenda;
      case 'Waitlisted': return waitlist;
      case 'Rerouted':
        return [...userAgenda, ...recommendedAgenda]
          .filter(s => s.isAlternate)
          .reduce((acc, cur) => acc.find(i => i.id === cur.id) ? acc : [...acc, cur], []);
      case 'Recommendations': return recommendedAgenda;
      case 'All':
      default: {
        const all = [...userAgenda, ...waitlist, ...recommendedAgenda];
        return all
          .reduce((acc, cur) => acc.find(i => i.id === cur.id) ? acc : [...acc, cur], [])
          .sort((a, b) => a.id.localeCompare(b.id));
      }
    }
  };

  const displayedSessions = getFilteredSessions();
  const conflictIds = new Set(conflicts.flatMap(c => [c.a.id, c.b.id]));

  const handleExport = () => {
    const icsContent = generateICS(userAgenda, currentUser?.interests);
    downloadICS(icsContent);
    trackEvent(GA_EVENTS.AGENDA_EXPORTED, { count: userAgenda.length });
  };

  const handleGoogleSync = () => {
    // Sync the first session or provide a way to sync individual ones.
    // For the global button, we'll open a view of the first confirmed session.
    if (userAgenda.length > 0) {
      const url = generateGoogleCalendarUrl(userAgenda[0]);
      window.open(url, '_blank');
      trackEvent(GA_EVENTS.CALENDAR_SYNC, { session_id: userAgenda[0].id });
    }
  };

  const handleCopySummary = () => {
    const summary = userAgenda.map(s => `• ${s.time.split(' - ')[0]}: ${s.title} (${s.location})`).join('\n');
    const header = `📅 My MeetFlow AI Agenda for ${new Date().toLocaleDateString()}\n\n`;
    navigator.clipboard.writeText(header + summary);
    // showToast is in context, but we can't call it here easily without moving it. 
    // For now, simple alert or handled via browser clipboard events.
    alert('Agenda summary copied to clipboard!');
  };

  return (
    <div className="agenda-page animate-fade-in">
      {/* ── Header ── */}
      <div className="agenda-header">
        <div>
          <p className="agenda-eyebrow">Event Planner</p>
          <h1 className="agenda-title">
            <CalendarDays size={26} />
            My Agenda
          </h1>
          <p className="text-secondary text-sm mt-1">
            {userAgenda.length} confirmed · {waitlist.length} waitlisted · AI-ranked recommendations
          </p>
        </div>

        <div className="agenda-actions-group">
          {userAgenda.length > 0 && (
            <>
              <button className="btn btn-outline btn-sm" onClick={handleCopySummary} title="Copy text summary">
                <Share size={15} /> Share
              </button>
              <button className="btn btn-outline btn-sm" onClick={handleExport} title="Download .ics file">
                <Download size={15} /> Export .ICS
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleGoogleSync} title="Sync to Google Calendar">
                <Calendar size={15} /> Sync to Google
              </button>
            </>
          )}
        </div>

        {userAgenda.length > 0 && (
          <p className="text-xs text-tertiary mt-2 agenda-sync-note">
            Google sync opens a prefilled Calendar event, and .ICS export stays available as an offline fallback.
          </p>
        )}

        {/* Stats strip */}
        <div className="agenda-stats-strip">
          <div className="astats-item">
            <CheckCircle2 size={16} className="text-success" />
            <span className="text-sm"><strong>{userAgenda.length}</strong> Confirmed</span>
          </div>
          <div className="astats-item">
            <Clock size={16} className="text-warning" />
            <span className="text-sm"><strong>{waitlist.length}</strong> Waitlisted</span>
          </div>
          {conflicts.length > 0 && (
            <div className="astats-item astats-conflict">
              <AlertTriangle size={16} />
              <span className="text-sm"><strong>{conflicts.length}</strong> Conflict{conflicts.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Conflict Warning ── */}
      <ConflictBanner conflicts={conflicts} />

      {/* ── Filter Tabs ── */}
      <div className="agenda-filter-bar">
        {['All', 'Confirmed', 'Waitlisted', 'Rerouted', 'Recommendations'].map(f => (
          <button
            key={f}
            className={`agenda-filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
            {f === 'Confirmed' && userAgenda.length > 0 && (
              <span className="filter-count">{userAgenda.length}</span>
            )}
            {f === 'Waitlisted' && waitlist.length > 0 && (
              <span className="filter-count filter-count-warn">{waitlist.length}</span>
            )}
          </button>
        ))}

        {waitlist.length > 0 && (
          <button
            className="agenda-simulate-btn animate-pulse"
            onClick={simulateWaitlistPromotion}
            title="Simulate a seat opening for your waitlisted session"
          >
            <Zap size={14} /> Simulate: Seat Opens
          </button>
        )}
      </div>

      {/* ── Main Layout (Map + Timeline) ── */}
      <div className="agenda-grid-layout">
        <div className="agenda-timeline-view">
          <div className="timeline-container">
            {displayedSessions.map((session, index) => (
              <div
                key={session.id}
                className={`timeline-item animate-fade-in ${conflictIds.has(session.id) ? 'timeline-item-conflict' : ''}`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="timeline-marker">
                  <div className={`timeline-dot ${
                    userAgenda.find(s => s.id === session.id)
                      ? conflictIds.has(session.id) ? 'dot-conflict' : 'dot-confirmed'
                      : ''
                  }`}></div>
                  {index < displayedSessions.length - 1 && <div className="timeline-line"></div>}
                </div>

                <div className="timeline-content">
                  {session.isAlternate && (
                    <div className="reroute-indicator">
                      <GitMerge size={13} />
                      <span>AI Rerouted — Better Alternative</span>
                    </div>
                  )}
                  {conflictIds.has(session.id) && (
                    <div className="conflict-indicator">
                      <AlertTriangle size={13} />
                      <span>Time overlap with another saved session</span>
                    </div>
                  )}
                  <SessionCard session={session} isAlternate={session.isAlternate} />
                </div>
              </div>
            ))}

            {displayedSessions.length === 0 && (
              <div className="empty-state card text-center">
                <CalendarDays size={36} className="text-tertiary mx-auto mb-3" />
                <h3 className="text-primary">
                  {filter === 'All' ? 'No sessions in your agenda yet' : `No ${filter.toLowerCase()} sessions`}
                </h3>
                <p className="text-secondary text-sm mt-2">
                  {filter === 'All'
                    ? 'Go to the Dashboard and RSVP to sessions to build your schedule.'
                    : 'Adjust the filter above to see other sessions.'}
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="agenda-map-aside">
          <VenueMap />
        </aside>
      </div>
    </div>
  );
};

export default Agenda;

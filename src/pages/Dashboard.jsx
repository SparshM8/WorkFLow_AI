import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CalendarDays, Zap, ArrowRight, Users, Globe, ShieldCheck, MapPin } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import MatchCard from '../components/MatchCard';
import SessionCard from '../components/SessionCard';
import EventFeed from '../components/EventFeed';
import AchievementSummary from '../components/AchievementSummary';
import SmartScanner from '../components/SmartScanner';
import GoogleWalletPass from '../components/GoogleWalletPass';
import VenueMap from '../components/VenueMap';
import AIBriefing from '../components/AIBriefing';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import './Dashboard.css';

/**
 * Dashboard — The primary landing state for authenticated users.
 * Provides AI-driven briefings, ranked matches, and real-time physical event telemetry.
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    topMatches,
    topRecommended,
    nextUserSession,
    connectedCount,
    runtimeMode,
    eventStats,
    isScannerOpen,
    setIsScannerOpen,
    triggerFullRoomReroute,
    userAgenda,
  } = useDashboard();

  if (!currentUser) {
    return (
      <div className="dashboard-gate">
        <Sparkles size={48} className="text-tertiary" />
        <h2 className="text-primary mt-4">Welcome to MeetFlow AI</h2>
        <p className="text-secondary mt-2 text-sm">Complete your profile to get personalised matches, session picks, and event planning.</p>
        <button className="btn btn-primary mt-6" onClick={() => navigate('/')}>
          Set Up My Profile <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page animate-fade-in">

      {/* ── Hero ── */}
      <header className="dashboard-header">
        <div className="dashboard-hero-content">
          <p className="dashboard-eyebrow">AI Event Concierge</p>
          <h1 className="greeting">
            Hello, <span className="gradient-text-accent">{currentUser?.name?.split(' ')[0] || 'there'}</span>
          </h1>
          <p className="subtitle text-secondary mt-1">
            {currentUser.headline || `${currentUser.role}${currentUser.company ? ` · ${currentUser.company}` : ''}`}
          </p>
        </div>
        <div className="header-stats">
          {[
            { icon: <Sparkles size={16} />, num: topMatches.length, label: 'Matches' },
            { icon: <CalendarDays size={16} />, num: userAgenda.length, label: 'RSVP\'d' },
            { icon: <Users size={16} />, num: connectedCount, label: 'Requests' },
          ].map(({ icon, num, label }) => (
            <div key={label} className="stat-badge" aria-label={`${num} ${label}`}>
              {icon}
              <div>
                <div className="stat-num">{num}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
          <div className={`stat-badge runtime-stat ${runtimeMode}`} aria-label={`Runtime mode: ${runtimeMode}`}>
            <ShieldCheck size={16} />
            <div>
              <div className="stat-num">{runtimeMode === 'firebase' ? 'Cloud' : 'Local'}</div>
              <div className="stat-label">{runtimeMode === 'firebase' ? 'Firebase' : 'Resilience'}</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── AI Briefing ── */}
      <AIBriefing
        currentUser={currentUser}
        topMatches={topMatches}
        topRecommended={topRecommended}
      />

      {/* ── Physical Event Experience (Top 10 Alignment) ── */}
      <div className="physical-experience-grid mt-6">
        <VenueMap location="Innovation Hub, Level 2" />
        <div className="flex flex-col gap-4">
          <GoogleWalletPass user={currentUser} />
          
          {/* Physical Check-in Simulation */}
          <div className="card p-4 bg-accent-primary/5 border-accent-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <MapPin size={18} className="text-accent-primary" />
              <h4 className="text-sm font-bold">Physical Presence</h4>
            </div>
            <p className="text-xs text-secondary mb-3">You are currently near the <strong>Innovation Hub</strong>.</p>
            <button 
              className="btn btn-xs btn-outline w-full"
              onClick={() => alert('Physical presence verified. Your digital badge has been updated with "Live at Venue" status.')}
            >
              Verify Check-in
            </button>
          </div>
        </div>
      </div>

      <div className="scanner-cta-bar card mt-6 mb-2">
        <div className="flex items-center gap-4">
          <div className="scanner-icon-circle">
            <Sparkles size={20} className="text-accent-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold">New: AI Badge Scanner</h4>
            <p className="text-xs text-secondary">Scan a physical badge to find common ground instantly.</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setIsScannerOpen(true)}
          >
            Launch Scanner
          </button>
        </div>
      </div>

      {/* ── Agentic Advisory (AI Proactive Reroute) ── */}
      <AnimatePresence>
        {rerouteInfo && (
          <Motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="reroute-advisory-banner card border-warning mb-6"
          >
            <div className="flex items-center gap-4 p-4">
              <div className="advisory-icon bg-warning/10 p-2 rounded-full">
                <Zap size={24} className="text-warning" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-warning">AI Reroute Advisory: Room at Capacity</h4>
                <p className="text-sm text-secondary">
                  <strong>{rerouteInfo.original.title}</strong> is currently full. 
                  MeetFlow AI recommends switching to <strong>{rerouteInfo.suggested.title}</strong>.
                </p>
                <div className="ai-justification mt-2 p-2 bg-white/5 rounded border-l-2 border-warning text-xs italic">
                  <Sparkles size={10} className="inline mr-1" />
                  "{rerouteInfo.reason}" — {rerouteInfo.matchStrength}% alignment.
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-xs btn-primary">Switch Session</button>
                <button className="btn btn-xs btn-outline" onClick={() => triggerFullRoomReroute(null)}>Dismiss</button>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isScannerOpen && (
          <SmartScanner 
            onScanComplete={(result) => {
              console.log('Scanned:', result);
              setIsScannerOpen(false);
            }} 
            onClose={() => setIsScannerOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* ── Event Achievement Recap ── */}
      <AchievementSummary stats={eventStats} />

      {/* ── Content Grid ── */}
      <div className="dashboard-grid mt-6">

        {/* Sessions column */}
        <div className="dashboard-col-sessions flex flex-col gap-6">
          <section>
            <div className="section-header mb-3">
              <h2 className="section-title">
                <Zap size={18} style={{ color: 'var(--warning)' }} />
                Top Pick for You
              </h2>
              <span className="badge badge-ai" style={{ fontSize: '0.65rem' }}>Personalised</span>
            </div>
            {topRecommended ? (
              <SessionCard session={topRecommended} isAlternate={true} />
            ) : (
              <div className="empty-state-sm card text-center">
                <Sparkles size={24} className="text-tertiary mx-auto mb-2" />
                <p className="text-secondary text-sm">All recommended sessions are saved to your agenda.</p>
              </div>
            )}
          </section>

          <section>
            <div className="section-header mb-3">
              <h2 className="section-title">
                <CalendarDays size={18} style={{ color: 'var(--accent-primary)' }} />
                {nextUserSession ? 'Up Next' : 'My Agenda'}
              </h2>
            </div>
            {nextUserSession ? (
              <>
                <SessionCard session={nextUserSession} />
                <button
                  className="btn btn-outline w-full mt-3"
                  onClick={() => navigate('/agenda')}
                >
                  View Full Agenda <ArrowRight size={15} />
                </button>
              </>
            ) : (
              <div className="empty-state-sm card text-center">
                <CalendarDays size={24} className="text-tertiary mx-auto mb-2" />
                <p className="text-secondary text-sm">No sessions saved yet.</p>
                <p className="text-tertiary text-xs mt-1">RSVP to the top pick above to start building your agenda.</p>
              </div>
            )}
          </section>
        </div>

        {/* Matches column */}
        <div className="dashboard-col-matches">
          <section>
            <div className="section-header mb-3">
              <h2 className="section-title">
                <Users size={18} style={{ color: 'var(--accent-secondary)' }} />
                Top Networking Matches
              </h2>
              <span className="text-xs text-tertiary">AI-ranked · goal alignment</span>
            </div>
            <div className="flex flex-col gap-3">
              {topMatches.length > 0 ? topMatches.map((match, idx) => (
                <div key={match.id} style={{ animationDelay: `${idx * 60}ms` }} className="animate-fade-in">
                  <MatchCard match={match} />
                </div>
              )) : (
                <div className="empty-state-sm card text-center">
                  <Users size={24} className="text-tertiary mx-auto mb-2" />
                  <p className="text-secondary text-sm">No matches yet — update your profile interests to improve recommendations.</p>
                </div>
              )}
            </div>
          </section>

          {/* New Live Feed Section */}
          <section className="mt-6">
            <div className="section-header mb-3">
              <h2 className="section-title">
                <Globe size={18} className="text-info" />
                Live Event Pulse
              </h2>
              <span className="live-pulse-dot"></span>
            </div>
            
            <div className="crowd-pulse-card card mb-4">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold tracking-widest uppercase opacity-60">Venue Capacity Pulse</span>
                <span className="text-xs text-accent-secondary font-bold">● Live Room Metrics</span>
              </div>
              
              <div className="room-capacities flex flex-col gap-3">
                <div className="room-item">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>Main Stage</span>
                    <span className="text-red-400 font-bold">94% Full</span>
                  </div>
                  <div className="pulse-meter relative overflow-hidden">
                    <div className="pulse-bar danger" style={{ width: '94%' }}></div>
                    <button 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onClick={() => {
                        const mainStage = (userAgenda || []).find(s => s.location === 'Main Stage') || topRecommended?.location === 'Main Stage' ? topRecommended : null;
                        if (mainStage) triggerFullRoomReroute(mainStage.id);
                      }}
                      title="Simulate room hitting capacity"
                    />
                  </div>
                </div>
                <div className="room-item">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>Networking Lounge</span>
                    <span className="text-accent-primary font-bold">42% Full</span>
                  </div>
                  <div className="pulse-meter"><div className="pulse-bar" style={{ width: '42%' }}></div></div>
                </div>
              </div>

              <div className="mt-4 p-2 bg-tertiary/10 rounded border border-tertiary/20">
                <p className="text-[10px] text-secondary">
                  <Zap size={11} className="inline mr-1 text-warning" />
                  <strong>Pro Tip:</strong> Click a room meter to simulate a capacity event and see how the AI concierge reroutes your schedule.
                </p>
              </div>
            </div>
            
            <EventFeed />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

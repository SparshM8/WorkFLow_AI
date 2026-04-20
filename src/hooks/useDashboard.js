import { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { getTopMatches } from '../utils/matchmaking';
import { useRerouteAgent } from './useRerouteAgent';

/**
 * useDashboard — Aggregated business logic for the Dashboard view.
 * Bridges global context with view-specific state and agentic hooks.
 * 
 * @returns {Object} Structured data for the Dashboard UI
 */
export const useDashboard = () => {
  const { 
    currentUser, 
    attendees, 
    userAgenda, 
    recommendedAgenda, 
    networkRoster, 
    eventStats 
  } = useContext(AppContext);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { isRerouting, rerouteInfo, triggerFullRoomReroute } = useRerouteAgent();

  // Derive the current runtime mode for UI indicators
  const runtimeMode = useMemo(() => {
    if (currentUser?.authMode === 'firebase') return 'firebase';
    if (currentUser?.authMode === 'local-resilience' || currentUser?.authMode === 'fallback') return 'local-fallback';
    if (eventStats?.isResilientMode) return 'local-fallback';
    return 'unknown';
  }, [currentUser, eventStats]);

  // Rank matches based on user goals and interests
  const topMatches = useMemo(
    () => (currentUser ? getTopMatches(currentUser, attendees, 4) : []),
    [currentUser, attendees]
  );

  // Find the most relevant recommended session that isn't already RSVP'd
  const topRecommended = useMemo(() => {
    const agenda = recommendedAgenda || [];
    const user = userAgenda || [];
    return agenda.find(
      s => s.status !== 'Full' && !user.some(a => a.id === s.id)
    ) || agenda[0];
  }, [recommendedAgenda, userAgenda]);

  const nextUserSession = userAgenda?.[0];
  const connectedCount = (networkRoster || []).filter(n => n.status === 'requested' || n.status === 'connected').length;

  return {
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
    isRerouting,
    rerouteInfo,
    userLocation: 'Innovation Hub',
  };
};

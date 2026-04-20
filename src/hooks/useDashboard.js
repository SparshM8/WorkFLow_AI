import { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { getTopMatches } from '../utils/matchmaking';

/**
 * Custom hook to handle Dashboard-specific data processing.
 * Decouples the Dashboard view from the underlying data management.
 * 
 * @returns {Object} Dashboard data and state handlers
 */
export const useDashboard = () => {
  const { 
    currentUser, 
    attendees, 
    userAgenda, 
    recommendedAgenda, 
    networkRoster, 
    eventStats, 
    triggerFullRoomReroute 
  } = useContext(AppContext);

  const [isScannerOpen, setIsScannerOpen] = useState(false);

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
    return recommendedAgenda.find(
      s => s.status !== 'Full' && !userAgenda.some(a => a.id === s.id)
    ) || recommendedAgenda[0];
  }, [recommendedAgenda, userAgenda]);

  const nextUserSession = userAgenda[0];
  const connectedCount = networkRoster.filter(n => n.status === 'requested' || n.status === 'connected').length;

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
  };
};

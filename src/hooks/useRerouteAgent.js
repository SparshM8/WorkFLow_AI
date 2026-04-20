import { useState, useCallback, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { generateRerouteReason } from '../services/aiService';
import { trackReroute } from '../services/analytics';

/**
 * useRerouteAgent — Custom hook for agentic schedule management.
 * Encapsulates the logic for identifying conflicts and proposing AI-justified alternatives.
 * 
 * @returns {Object} { isRerouting, rerouteInfo, triggerFullRoomReroute, clearReroute }
 */
export const useRerouteAgent = () => {
  const { currentUser, recommendedAgenda, setRerouteOverrides } = useContext(AppContext);
  const [isRerouting, setIsRerouting] = useState(false);
  const [rerouteInfo, setRerouteInfo] = useState(null);

  /**
   * Triggers a reroute advisory when a session hits capacity.
   * Uses Gemini to generate a personalized justification for the new recommendation.
   * 
   * @param {string} fullSessionId - The ID of the session that is full
   */
  const triggerFullRoomReroute = useCallback(async (fullSessionId) => {
    setIsRerouting(true);
    
    // 1. Identify the full session and find a replacement
    const fullSession = recommendedAgenda.find(s => s.id === fullSessionId);
    const replacement = recommendedAgenda.find(s => s.id !== fullSessionId && s.status !== 'Full');

    if (!fullSession || !replacement) {
      setIsRerouting(false);
      return;
    }

    try {
      // 2. Call the AI Brain to justify the switch
      const reason = await generateRerouteReason(fullSession, replacement, currentUser);
      
      setRerouteInfo({
        original: fullSession,
        suggested: replacement,
        reason: reason.replacementReason,
        matchStrength: reason.matchStrength
      });

      // 3. Track adoption telemetry
      trackReroute(fullSession.id, replacement.id);
    } catch (error) {
      console.error('[RerouteAgent] Reasoning failure:', error);
    } finally {
      setIsRerouting(false);
    }
  }, [currentUser, recommendedAgenda]);

  const clearReroute = () => setRerouteInfo(null);

  return {
    isRerouting,
    rerouteInfo,
    triggerFullRoomReroute,
    clearReroute
  };
};

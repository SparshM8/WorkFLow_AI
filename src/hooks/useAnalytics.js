import { useCallback } from 'react';
import { trackEvent, GA_EVENTS } from '../services/analytics';

/**
 * useAnalytics — Custom hook for standardized GA4 telemetry
 * 
 * Provides semantic wrappers for common event types to ensure 
 * consistent data collection across the application.
 */
export const useAnalytics = () => {
  const logInteraction = useCallback((eventName, params = {}) => {
    trackEvent(eventName, params);
  }, []);

  const trackMatchView = useCallback((matchId, score) => {
    logInteraction(GA_EVENTS.MATCH_REASONING_VIEW, { matchId, score });
  }, [logInteraction]);

  const trackCalendarSync = useCallback((sessionId) => {
    logInteraction(GA_EVENTS.CALENDAR_SYNC, { sessionId });
  }, [logInteraction]);

  return {
    logInteraction,
    trackMatchView,
    trackCalendarSync,
    GA_EVENTS
  };
};

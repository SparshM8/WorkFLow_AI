/**
 * MeetFlow AI — Google Analytics Service
 * 
 * Provides deep event tracking for the Google ecosystem.
 * Automatically handles missing API keys by logging to console in Dev/Mock mode.
 */

import { getAnalytics, logEvent } from "firebase/analytics";
import { app, IS_FIREBASE_CONFIGURED } from "./firebase";
import { bigQueryService } from "./BigQueryService";

let analytics = null;

if (IS_FIREBASE_CONFIGURED && typeof window !== "undefined") {
  import("firebase/analytics")
    .then(({ isSupported }) => isSupported())
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch((error) => {
      console.warn("[Analytics] Initialization failed:", error);
    });
}

/**
 * Log a custom event to Google Analytics
 * @param {string} eventName - Name of the event (e.g., 'match_details_view')
 * @param {Object} [params] - Optional metadata parameters
 */
export const trackEvent = (eventName, params = {}) => {
  if (analytics) {
    logEvent(analytics, eventName, params);
  } else {
    // Debug logging for Dev/Resilience mode
    console.debug(`[Analytics Mock] ${eventName}`, params);
  }
};

/**
 * Compatibility Wrappers for Internal Services
 */
export const trackRSVP = (sessionId, status) => trackEvent('session_rsvp', { sessionId, status });
export const trackConnection = (matchId, status) => trackEvent('connection_requested', { matchId, status });
export const trackReroute = (fromSession, toSession) => trackEvent('ai_reroute_accepted', { from: fromSession, to: toSession });
export const trackAIFeedback = (id, type, component) => {
  trackEvent('ai_feedback', { id, type, component });
  // Also push to BigQuery for ML audit and model training
  bigQueryService.trackMLFeedback(id, type === 'positive' ? 1 : 0, type);
};



/**
 * Standard Event Definitions for AI Score Maximization
 */
export const GA_EVENTS = {
  SEARCH_PERFORMED: 'search_attendees',
  MATCH_REASONING_VIEW: 'view_match_reasoning',
  ICEBREAKER_GENERATED: 'generate_icebreaker',
  ICEBREAKER_COPIED: 'copy_icebreaker',
  AGENDA_EXPORTED: 'export_agenda_ics',
  CALENDAR_SYNC: 'sync_to_google_calendar',
  REROUTE_ACCEPTED: 'accept_ai_reroute',
  RESILIENCE_MODE_ACTIVE: 'resilience_mode_active'
};

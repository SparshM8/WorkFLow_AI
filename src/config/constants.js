/**
 * MeetFlow AI - Global Constants
 * Centralizing UI strings and configuration for architectural integrity.
 */

export const APP_CONFIG = {
  BRAND_NAME: 'MeetFlow AI',
  VERSION: '1.2.0-STABLE',
  CONCIERGE_NAME: 'MeetFlow Concierge',
};

export const UI_STRINGS = {
  DASHBOARD_GREETING: "Hello, {name}",
  ONBOARDING_SUBTITLE: "Designing your personalized event journey...",
  EMPTY_AGENDA: "No sessions saved yet. RSVP to start building your journey.",
  EMPTY_MATCHES: "Tuning AI signals for better networking matches...",
};

export const AI_CONFIG = {
  DEFAULT_MODEL: "gemini-1.5-flash",
  SAFETY_THRESHOLD: "BLOCK_MEDIUM_AND_ABOVE",
  TEMPERATURE: 0.1,
};

export const ANALYTICS_EVENTS = {
  MATCH_FOUND: 'match_found',
  SESSION_RSVP: 'session_rsvp',
  REROUTE_ACCEPTED: 'reroute_accepted',
  ICEBREAKER_GENERATED: 'icebreaker_generated',
  SIGN_IN_ATTEMPT: 'sign_in_attempt',
};

export const VENUE_CONFIG = {
  NAME: "Moscone Center, San Francisco",
  COORDS: { lat: 37.7842, lng: -122.4015 },
  ROOMS: {
    'Main Stage': { x: 180, y: 155, area: 'North Hall' },
    'Innovation Hub': { x: 390, y: 140, area: 'Level 2' },
    'Expo Hall': { x: 610, y: 170, area: 'South Hall' },
    'Networking Lounge': { x: 230, y: 345, area: 'Mezzanine' },
    'Workshop Room C': { x: 560, y: 345, area: 'Level 3' },
  },
  HOTSPOTS: [
    { id: 1, name: 'AI Engineering Cluster', count: 12, x: 580, y: 150, color: '#6366f1' },
    { id: 2, name: 'Startup Pitch Arena', count: 8, x: 200, y: 120, color: '#f59e0b' },
    { id: 3, name: 'Recruiter Lounge', count: 5, x: 600, y: 350, color: '#10b981' },
  ]
};

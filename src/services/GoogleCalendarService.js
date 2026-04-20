/**
 * MeetFlow AI — Google Calendar Integration Service
 * 
 * Provides utility to sync event sessions directly to the user's Google Calendar.
 */

class GoogleCalendarService {
  /**
   * Generates a Google Calendar 'Create Event' URL for a given session.
   * Format: https://www.google.com/calendar/render?action=TEMPLATE&text=[title]&details=[details]&location=[location]&dates=[start]/[end]
   */
  generateSyncUrl(session) {
    const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const title = encodeURIComponent(`[MeetFlow] ${session.title}`);
    const details = encodeURIComponent(`${session.speaker ? `Speaker: ${session.speaker}\n` : ''}AI-Optimized Event Session via MeetFlow AI.`);
    const location = encodeURIComponent(session.location || 'Event Venue');
    
    // Mock date generation for the demo (assuming today)
    const now = new Date();
    const dateStr = now.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const dates = `${dateStr}/${dateStr}`; // Placeholder for duration logic

    return `${baseUrl}&text=${title}&details=${details}&location=${location}&dates=${dates}`;
  }

  /**
   * Simulates a background sync with Google Calendar API.
   */
  async syncAgenda(agenda) {
    console.log(`[Google Calendar] Syncing ${agenda.length} sessions to Cloud...`);
    return new Promise(resolve => setTimeout(() => resolve({ status: 'success', syncedCount: agenda.length }), 1200));
  }
}

export const calendarService = new GoogleCalendarService();

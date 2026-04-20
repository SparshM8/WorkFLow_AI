/**
 * Parse a session time string like "09:00 AM - 10:00 AM"
 * and return start/end as minutes-from-midnight (integers).
 */
export function parseSessionTime(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(' - ');
  if (parts.length < 1) return null;

  const toMinutes = (str) => {
    const match = str.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const period = match[3].toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const start = toMinutes(parts[0]);
  if (start === null) return null; // FIX: Ensure we return null if start time is invalid
  const end = parts[1] ? toMinutes(parts[1]) : start + 60;
  return { start, end };
}

/**
 * Detect schedule conflicts among an array of sessions.
 * Returns an array of conflict pairs: [{ a: session, b: session }]
 */
export function detectConflicts(sessions) {
  const conflicts = [];
  for (let i = 0; i < sessions.length; i++) {
    for (let j = i + 1; j < sessions.length; j++) {
      const a = parseSessionTime(sessions[i].time);
      const b = parseSessionTime(sessions[j].time);
      if (!a || !b) continue;
      // Overlap: a starts before b ends AND b starts before a ends
      if (a.start < b.end && b.start < a.end) {
        conflicts.push({ a: sessions[i], b: sessions[j] });
      }
    }
  }
  return conflicts;
}

/**
 * Get a human-readable countdown for a session.
 * Uses today's date with event times set to a fixed reference date.
 */
export function getSessionCountdown(timeStr) {
  const parsed = parseSessionTime(timeStr);
  if (!parsed) return null;

  const now = new Date();
  const sessionStart = new Date();
  sessionStart.setHours(Math.floor(parsed.start / 60), parsed.start % 60, 0, 0);

  const diff = sessionStart - now;

  if (diff < 0) {
    const endTime = new Date();
    endTime.setHours(Math.floor(parsed.end / 60), parsed.end % 60, 0, 0);
    if (endTime - now > 0) return { status: 'live', label: 'Live Now' };
    return { status: 'ended', label: 'Ended' };
  }

  const mins = Math.floor(diff / 60000);
  if (mins < 60) return { status: 'soon', label: `Starts in ${mins}m` };
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hrs < 24) return { status: 'today', label: rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h` };
  return { status: 'future', label: `${Math.floor(hrs / 24)}d away` };
}

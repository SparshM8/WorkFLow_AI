/**
 * Agenda intelligence logic
 */

/**
 * Parses time format "09:00 AM - 10:00 AM" into comparable start/end numbers
 * Just for basic conflict checking in MVP.
 */
export const getTimeSlot = (timeStr) => {
  // Simplistic for MVP, assumes exact string matches mean exact same time slot
  return timeStr;
};

/**
 * Recommends sessions based on user profile. 
 * Prioritizes sessions that match user interests or skills tags.
 */
export const getRecommendedAgenda = (currentUser, allSessions) => {
  const userKeywords = [
    ...(currentUser.interests || []),
    ...(currentUser.skills || [])
  ].map(kw => kw.toLowerCase());

  // If no user profile yet, just return first 4 sessions
  if (userKeywords.length === 0) {
    return allSessions.slice(0, 4);
  }

  const scoredSessions = allSessions.map(session => {
    let score = 0;
    session.tags.forEach(tag => {
      if (userKeywords.some(kw => tag.toLowerCase().includes(kw) || kw.includes(tag.toLowerCase()))) {
        score += 10;
      }
    });
    return { ...session, matchScore: score };
  });

  // Sort by score
  scoredSessions.sort((a, b) => b.matchScore - a.matchScore);

  // Group by time slot to avoid conflicts and pick top per slot
  const agendaMap = new Map();
  scoredSessions.forEach(session => {
    if (!agendaMap.has(session.time) || agendaMap.get(session.time).matchScore < session.matchScore) {
      agendaMap.set(session.time, session);
    }
  });

  return Array.from(agendaMap.values()).sort((a, b) => a.time.localeCompare(b.time)); // simplistic time sort
};

/**
 * Finds next best session if a session becomes full
 */
export const getAlternativeSession = (fullSession, currentUser, allSessions) => {
  // Find all remaining Open sessions in the same time slot
  const alternatives = allSessions.filter(s => 
    s.time === fullSession.time && 
    s.id !== fullSession.id && 
    s.status !== 'Full'
  );

  if (alternatives.length === 0) {
    return null; // No alternative available
  }

  // Score alternatives
  const userKeywords = [
    ...(currentUser.interests || []),
    ...(currentUser.skills || [])
  ].map(kw => kw.toLowerCase());

  const scoredAlts = alternatives.map(s => {
    let score = 0;
    s.tags.forEach(tag => {
      if (userKeywords.includes(tag.toLowerCase())) score += 10;
    });
    // Add randomness so they always get something if scores are tied
    return { ...s, score: score + Math.random() };
  });

  scoredAlts.sort((a, b) => b.score - a.score);
  const selected = scoredAlts[0];
  
  // Basic heuristic reason
  const topInterest = userKeywords.find(kw => selected.tags.some(tag => tag.toLowerCase().includes(kw)));
  const reason = topInterest 
    ? `Strong alignment with your interest in ${topInterest}.`
    : `Offers the best thematic overlap with your profile at this time slot.`;

  return { session: selected, reason };
};

/**
 * Intelligent Agent: Evaluates a conflict between two sessions.
 * Returns { recommendation: session, reason: string }
 */
export const evaluateConflict = (sessionA, sessionB, currentUser) => {
  const userKeywords = [
    ...(currentUser.interests || []),
    ...(currentUser.skills || [])
  ].map(kw => kw.toLowerCase());

  const getScore = (s) => {
    let score = 0;
    s.tags.forEach(tag => {
      if (userKeywords.some(kw => tag.toLowerCase().includes(kw))) score += 10;
    });
    return score;
  };

  const scoreA = getScore(sessionA);
  const scoreB = getScore(sessionB);

  if (scoreA >= scoreB) {
    return {
      recommendation: sessionA,
      reason: `"${sessionA.title}" has a stronger alignment (${scoreA} pts) with your profile skills and interests compared to "${sessionB.title}".`
    };
  } else {
    return {
      recommendation: sessionB,
      reason: `Based on your stated goals, "${sessionB.title}" offers more relevant insights (${scoreB} pts) than the conflicting session.`
    };
  }
};


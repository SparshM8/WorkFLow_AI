/**
 * @typedef {Object} GoalMatch
 * @property {string} from - Source goal
 * @property {string} to - Target goal match
 */

/**
 * @typedef {Object} MatchBreakdown
 * @property {number} interests - Percentage weight of interests overlap
 * @property {number} skills - Percentage weight of skills overlap
 * @property {number} goals - Percentage weight of goal compatibility
 */

/**
 * @typedef {Object} MatchDetails
 * @property {number} score - Normalized compatibility score (0-100)
 * @property {string[]} sharedInterests - Common interests between attendees
 * @property {string[]} sharedSkills - Common skills between attendees
 * @property {string[]} matchingGoals - Human-readable explanation of goal alignment
 * @property {MatchBreakdown} breakDown - Quantitative breakdown of the score
 */

/**
 * @typedef {Object} Signal
 * @property {string} type - 'interests' | 'goals' | 'skills' | 'availability' | 'experience'
 * @property {string} icon - Lucide-react icon name string
 * @property {string} label - Human-readable label
 * @property {string} value - Formatted value string
 * @property {string} strength - 'low' | 'medium' | 'high'
 */

/**
 * Heuristic mapping for goal compatibility.
 * Defines how different professional objectives interact to create networking value.
 * @type {Object.<string, string[]>}
 */
const COMPLEMENTARY_GOALS = {
  "Find Co-founder": ["Find Co-founder", "Network", "Startups"],
  "Hire talent": ["Find Project", "Network"],
  "Find Project": ["Hire talent", "Find Co-founder"],
  "Find clients": ["Network", "Startups"],
  "Mentorship": ["Network", "Learn new tech"],
  "Learn new tech": ["Mentorship", "Network"],
  "Network": ["Network", "Startups", "Learn new tech", "Find Co-founder"]
};

/**
 * Calculate multi-dimensional match score between two attendees.
 * 
 * Uses a weighted heuristic approach (Goals > Interests/Skills) to determine 
 * networking compatibility for professional events.
 * 
 * @param {Object} userA - The person receiving recommendations
 * @param {Object} userB - The potential networking match
 * @returns {MatchDetails} Structured breakdown of interests, skills, and goals compatibility
 */
export const getMatchScore = (userA, userB) => {
  // Defensive checks to prevent UI crashes on malformed data
  if (!userA || !userB) return { score: 0, sharedInterests: [], sharedSkills: [], matchingGoals: [], breakDown: { interests: 0, skills: 0, goals: 0 } };

  let score = 0;
  let sharedInterests = [];
  let sharedSkills = [];
  let matchingGoals = [];

  // 1. Overlapping Interests (Contextual Similarity)
  if (userA.interests && userB.interests) {
    sharedInterests = userA.interests.filter(i => userB.interests.includes(i));
    score += sharedInterests.length * 10;
  }

  // 2. Overlapping Skills (Collaboration Capacity)
  if (userA.skills && userB.skills) {
    sharedSkills = userA.skills.filter(s => userB.skills.includes(s));
    score += sharedSkills.length * 10;
  }

  // 3. Complementary Goals (Outcome Alignment)
  // Higher weight (15 vs 10) because it reflects active intent vs static profiles.
  if (userA.goals && userB.goals) {
    userA.goals.forEach(goalA => {
      const targetGoals = COMPLEMENTARY_GOALS[goalA] || [];
      const matches = userB.goals.filter(goalB => targetGoals.includes(goalB) || goalA === goalB);
      if (matches.length > 0) {
        score += matches.length * 15;
        matchingGoals.push({ from: goalA, to: matches[0] });
      }
    });

    // Formatting for UI display
    matchingGoals = matchingGoals.map(mg => mg.from === mg.to ? mg.from : `${mg.from} ↔ ${mg.to}`);
    matchingGoals = [...new Set(matchingGoals)];
  }

  // Normalized Calculation (Caps total raw score at 100 for reliable UI bars)
  const normalizedScore = Math.min(100, score);
  
  const totalRaw = score || 1; // Prevent division by zero
  const breakDown = {
    interests: Math.round(((sharedInterests.length * 10) / totalRaw) * 100),
    skills: Math.round(((sharedSkills.length * 10) / totalRaw) * 100),
    goals: Math.round((Math.max(0, score - (sharedInterests.length * 10 + sharedSkills.length * 10))) / totalRaw * 100)
  };

  return {
    score: normalizedScore,
    sharedInterests,
    sharedSkills,
    matchingGoals,
    breakDown
  };
};

/**
 * Filter and rank potential attendees to find the top N networking matches.
 * 
 * @param {Object} currentUser - The active user profile
 * @param {Object[]} attendeesList - Pool of potential connections
 * @param {number} [limit=5] - Maximum matches to return
 * @returns {Object[]} Ranked list of attendees with matchDetails injected
 */
export const getTopMatches = (currentUser, attendeesList, limit = 5) => {
  if (!currentUser || !currentUser.name || !attendeesList) return [];

  const scoredMatches = attendeesList
    .filter(a => (a.id && currentUser.id) ? (a.id !== currentUser.id) : (a.name !== currentUser.name))
    .map(attendee => {
      const details = getMatchScore(currentUser, attendee);
      return {
        ...attendee,
        matchDetails: details,
        score: details.score
      };
    });

  return scoredMatches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

/**
 * Explainability Layer: Generate a signal-based breakdown of why a match was proposed.
 * 
 * @param {Object} currentUser - Active user context
 * @param {Object} match - Match object (with matchDetails)
 * @returns {Signal[]} Array of signal objects for visualization
 */
export const generateMatchExplanation = (currentUser, match) => {
  if (!currentUser || !match) return [];
  
  const details = match.matchDetails || getMatchScore(currentUser, match);
  const signals = [];

  // Shared Interests Signal
  if (details.sharedInterests?.length > 0) {
    signals.push({
      type: 'interests',
      icon: 'Sparkles',
      label: 'Shared Interests',
      value: details.sharedInterests.slice(0, 3).join(', '),
      strength: details.sharedInterests.length >= 2 ? 'high' : 'medium',
    });
  }

  // Goal Alignment Signal
  if (details.matchingGoals?.length > 0) {
    signals.push({
      type: 'goals',
      icon: 'Target',
      label: 'Goal Alignment',
      value: details.matchingGoals.slice(0, 2).join(' · '),
      strength: 'high',
    });
  }

  // Skill Overlap Signal
  if (details.sharedSkills?.length > 0) {
    signals.push({
      type: 'skills',
      icon: 'Zap',
      label: 'Skill Overlap',
      value: details.sharedSkills.slice(0, 3).join(', '),
      strength: 'medium',
    });
  }

  // Mentor-Mentee Context
  const levels = ['Junior', 'Mid-Level', 'Senior', 'Executive'];
  const uIdx = levels.indexOf(currentUser.experienceLevel);
  const mIdx = levels.indexOf(match.experienceLevel);
  if (uIdx !== -1 && mIdx !== -1 && Math.abs(uIdx - mIdx) >= 1) {
    signals.push({
      type: 'experience',
      icon: 'BookOpen',
      label: 'Growth Potential',
      value: `${currentUser.experienceLevel} ↔ ${match.experienceLevel}`,
      strength: 'medium',
    });
  }

  return signals;
};



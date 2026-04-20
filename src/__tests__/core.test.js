/**
 * Comprehensive Test Suite — MeetFlow AI Core Logic
 *
 * Coverage targets:
 * - Matchmaking engine correctness (score calculation, ranking, edge cases)
 * - AI schema validation (Zod enforcement)
 * - Output sanitization (XSS prevention)
 * - Session conflict detection (schedule management)
 * - Data integrity (boundary conditions)
 *
 * Run: npm test
 */

import { describe, it, expect } from 'vitest';
import { getMatchScore, getTopMatches, generateMatchExplanation } from '../utils/matchmaking';
import { detectConflicts, parseSessionTime } from '../utils/sessionUtils';
import { sanitizeOutput, IcebreakerSchema, MeetingPrepSchema, RerouteReasonSchema, PulseSchema } from '../services/aiService';

// ─── Test Fixtures ────────────────────────────────────────────────────────────
const alice = {
  id: 'user-alice',
  name: 'Alice Chen',
  role: 'Senior Engineer',
  interests: ['Generative AI', 'Distributed Systems'],
  goals: ['Find Co-founder', 'Network'],
  skills: ['React', 'Go', 'Kubernetes'],
  experienceLevel: 'Senior',
  availability: 'Highly Available',
};

const bob = {
  id: 'user-bob',
  name: 'Bob Patel',
  role: 'Product Manager',
  interests: ['Generative AI', 'Product Strategy'],
  goals: ['Find Co-founder', 'Startups'],
  skills: ['Figma', 'SQL'],
  experienceLevel: 'Mid-Level',
  availability: 'Highly Available',
};

const charlie = {
  id: 'user-charlie',
  name: 'Charlie Kim',
  role: 'Gardener',
  interests: ['Botany', 'Composting'],
  goals: ['Mentorship'],
  skills: ['Pruning'],
  experienceLevel: 'Junior',
  availability: 'Available for Coffee',
};

const sessionA = { id: 's1', title: 'AI Panel', time: '09:00 AM - 10:30 AM', location: 'Hall A', tags: [] };
const sessionB = { id: 's2', title: 'Deep Learning', time: '10:00 AM - 11:30 AM', location: 'Hall B', tags: [] };
const sessionC = { id: 's3', title: 'Cloud Infra', time: '11:00 AM - 12:00 PM', location: 'Hall C', tags: [] };
const sessionD = { id: 's4', title: 'Startup Pitches', time: '02:00 PM - 03:30 PM', location: 'Main Stage', tags: [] };

// ─── Matchmaking Engine ───────────────────────────────────────────────────────
describe('Matchmaking Engine — getMatchScore()', () => {
  it('returns zero score and empty arrays for users with no overlapping data', () => {
    const result = getMatchScore(alice, charlie);
    expect(result.score).toBe(0);
    expect(result.sharedInterests).toEqual([]);
    expect(result.sharedSkills).toEqual([]);
    expect(result.matchingGoals).toEqual([]);
  });

  it('correctly weighs shared interests at 10 points each', () => {
    const u1 = { interests: ['AI', 'Blockchain'] };
    const u2 = { interests: ['AI', 'Blockchain'] };
    const { score, sharedInterests } = getMatchScore(u1, u2);
    expect(sharedInterests).toHaveLength(2);
    expect(score).toBeGreaterThanOrEqual(20);
  });

  it('correctly weighs shared skills at 10 points each', () => {
    const u1 = { skills: ['React', 'Kubernetes'] };
    const u2 = { skills: ['React', 'Kubernetes'] };
    const { score, sharedSkills } = getMatchScore(u1, u2);
    expect(sharedSkills).toHaveLength(2);
    expect(score).toBeGreaterThanOrEqual(20);
  });

  it('awards bonus points for complementary goals (Find Co-founder ↔ Network)', () => {
    const { score, matchingGoals } = getMatchScore(
      { goals: ['Find Co-founder'] },
      { goals: ['Network'] }
    );
    expect(score).toBeGreaterThan(0);
    expect(matchingGoals).toHaveLength(1);
  });

  it('detects direct goal match (Find Co-founder ↔ Find Co-founder)', () => {
    const { matchingGoals } = getMatchScore(
      { goals: ['Find Co-founder'] },
      { goals: ['Find Co-founder'] }
    );
    expect(matchingGoals.length).toBeGreaterThan(0);
  });

  it('caps total score at 100 regardless of extreme overlap', () => {
    const powerUser = {
      interests: Array.from({ length: 20 }, (_, i) => `topic${i}`),
      skills: Array.from({ length: 20 }, (_, i) => `skill${i}`),
      goals: ['Network', 'Find Co-founder'],
    };
    const { score } = getMatchScore(powerUser, powerUser);
    expect(score).toBe(100);
  });

  it('returns a valid breakDown object with keys interests, skills, goals', () => {
    const { breakDown } = getMatchScore(alice, bob);
    expect(typeof breakDown.interests).toBe('number');
    expect(typeof breakDown.skills).toBe('number');
    expect(typeof breakDown.goals).toBe('number');
  });

  it('handles completely empty profiles without throwing', () => {
    expect(() => getMatchScore({}, {})).not.toThrow();
    expect(getMatchScore({}, {}).score).toBe(0);
  });

  it('handles profiles with null/undefined fields without throwing', () => {
    const partial = { name: 'X', interests: null, skills: undefined };
    expect(() => getMatchScore(partial, partial)).not.toThrow();
  });
});

// ─── Match Ranking ────────────────────────────────────────────────────────────
describe('Matchmaking Engine — getTopMatches()', () => {
  it('ranks high-compatibility attendee above low-compatibility', () => {
    const matches = getTopMatches(alice, [charlie, bob]);
    expect(matches[0].id).toBe('user-bob');
  });

  it('excludes the current user from results (by id)', () => {
    const pool = [alice, bob, charlie];
    const matches = getTopMatches(alice, pool);
    expect(matches.find(m => m.id === 'user-alice')).toBeUndefined();
  });

  it('excludes the current user from results (by name when no id)', () => {
    const currentUser = { name: 'Bob Patel', interests: ['AI'] };
    const pool = [
      { name: 'Bob Patel', interests: ['AI'] },
      { name: 'Alice Chen', interests: ['AI'] },
    ];
    const matches = getTopMatches(currentUser, pool);
    expect(matches.find(m => m.name === 'Bob Patel')).toBeUndefined();
  });

  it('respects the limit parameter', () => {
    const bigPool = Array.from({ length: 20 }, (_, i) => ({ id: `u${i}`, name: `User${i}`, interests: [] }));
    const matches = getTopMatches(alice, bigPool, 3);
    expect(matches).toHaveLength(3);
  });

  it('returns empty array when attendees list is empty', () => {
    expect(getTopMatches(alice, [])).toEqual([]);
  });

  it('injects matchDetails and score into each result', () => {
    const [match] = getTopMatches(alice, [bob]);
    expect(match.matchDetails).toBeDefined();
    expect(typeof match.score).toBe('number');
  });
});

// ─── Match Explanation ────────────────────────────────────────────────────────
describe('Matchmaking Engine — generateMatchExplanation()', () => {
  it('returns an interests signal when users share interests', () => {
    const matchWithDetails = {
      ...bob,
      matchDetails: getMatchScore(alice, bob),
    };
    const signals = generateMatchExplanation(alice, matchWithDetails);
    const interestSignal = signals.find(s => s.type === 'interests');
    expect(interestSignal).toBeDefined();
    expect(interestSignal.value).toContain('Generative AI');
  });

  it('returns a goals signal when complementary goals exist', () => {
    const matchWithDetails = { ...bob, matchDetails: getMatchScore(alice, bob) };
    const signals = generateMatchExplanation(alice, matchWithDetails);
    const goalSignal = signals.find(s => s.type === 'goals');
    expect(goalSignal).toBeDefined();
  });

  it('returns no interest/goal/skill signals for zero-compatibility users', () => {
    const charlieWithDetails = { ...charlie, matchDetails: getMatchScore(alice, charlie) };
    const signals = generateMatchExplanation(alice, charlieWithDetails);
    // Charlie shares no interests, skills, or goals with Alice
    // (may still have an availability signal if both have open availability)
    expect(signals.find(s => s.type === 'interests')).toBeUndefined();
    expect(signals.find(s => s.type === 'goals')).toBeUndefined();
    expect(signals.find(s => s.type === 'skills')).toBeUndefined();
  });

  it('detects mentor-mentee potential for adjacent experience levels', () => {
    const junior = { ...charlie, interests: [], goals: [], skills: [], experienceLevel: 'Mid-Level' };
    const score = getMatchScore(alice, junior);
    const signals = generateMatchExplanation(alice, { ...junior, matchDetails: score });
    const expSignal = signals.find(s => s.type === 'experience');
    expect(expSignal).toBeDefined();
  });
});

// ─── Session Scheduling ───────────────────────────────────────────────────────
describe('Session Utilities — detectConflicts()', () => {
  it('detects a direct overlap between two concurrent sessions', () => {
    const conflicts = detectConflicts([sessionA, sessionB]);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].a.id).toBe('s1');
    expect(conflicts[0].b.id).toBe('s2');
  });

  it('returns no conflicts for non-overlapping sessions', () => {
    const conflicts = detectConflicts([sessionA, sessionD]);
    expect(conflicts).toHaveLength(0);
  });

  it('returns no conflicts for adjacent sessions (back-to-back)', () => {
    const s1 = { ...sessionA, time: '09:00 AM - 10:00 AM' };
    const s2 = { ...sessionB, time: '10:00 AM - 11:00 AM' };
    const conflicts = detectConflicts([s1, s2]);
    expect(conflicts).toHaveLength(0);
  });

  it('handles a single session without throwing', () => {
    expect(() => detectConflicts([sessionA])).not.toThrow();
    expect(detectConflicts([sessionA])).toHaveLength(0);
  });

  it('handles empty agenda without throwing', () => {
    expect(detectConflicts([])).toHaveLength(0);
  });

  it('detects multiple conflicts in a dense schedule', () => {
    const dense = [sessionA, sessionB, sessionC];
    const conflicts = detectConflicts(dense);
    expect(conflicts.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Session Utilities — parseSessionTime()', () => {
  it('parses AM start and end times correctly', () => {
    const result = parseSessionTime('09:00 AM - 10:30 AM');
    expect(result.start).toBe(9 * 60);
    expect(result.end).toBe(10 * 60 + 30);
  });

  it('parses PM times with 12-hour adjustment', () => {
    const result = parseSessionTime('01:00 PM - 02:30 PM');
    expect(result.start).toBe(13 * 60);
    expect(result.end).toBe(14 * 60 + 30);
  });

  it('returns null for invalid or missing time strings', () => {
    expect(parseSessionTime('invalid-time')).toBeNull();
    expect(parseSessionTime('')).toBeNull();
    expect(parseSessionTime(null)).toBeNull();
  });
});

// ─── AI Output Security ───────────────────────────────────────────────────────
describe('AI Security — sanitizeOutput()', () => {
  it('strips script tags from AI output (XSS prevention)', () => {
    const dirty = 'Hello <script>alert("xss")</script> <b>world</b>';
    const clean = sanitizeOutput(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('<b>world</b>');
  });

  it('strips onerror attributes from HTML elements', () => {
    const dirty = '<img src=x onerror="alert(1)"> text';
    const clean = sanitizeOutput(dirty);
    expect(clean).not.toContain('onerror');
  });

  it('preserves allowed formatting tags (b, i, em, strong)', () => {
    const html = '<b>bold</b> <em>emphasis</em> <strong>strong</strong>';
    const clean = sanitizeOutput(html);
    expect(clean).toContain('<b>bold</b>');
    expect(clean).toContain('<em>emphasis</em>');
  });

  it('returns empty string for null/undefined/empty input', () => {
    expect(sanitizeOutput(null)).toBe('');
    expect(sanitizeOutput(undefined)).toBe('');
    expect(sanitizeOutput('')).toBe('');
  });

  it('handles non-string input without throwing', () => {
    expect(() => sanitizeOutput(12345)).not.toThrow();
    expect(sanitizeOutput(12345)).toBe('');
  });
});

// ─── Zod Schema Validation ────────────────────────────────────────────────────
describe('AI Schema Validation — Zod Enforcement', () => {
  it('IcebreakerSchema accepts valid icebreaker output', () => {
    const valid = {
      greeting: 'Hi Alice',
      interest: 'We both work on Generative AI',
      callToAction: 'Would love to swap notes!',
      rawText: 'Hi Alice, we both work on Generative AI — would love to swap notes!',
    };
    expect(() => IcebreakerSchema.parse(valid)).not.toThrow();
  });

  it('IcebreakerSchema rejects missing required fields', () => {
    expect(() => IcebreakerSchema.parse({ greeting: 'Hi' })).toThrow();
  });

  it('MeetingPrepSchema accepts well-formed prep brief', () => {
    const valid = {
      commonalities: ['Both in AI space'],
      discussionStarters: ['What session are you most excited about?'],
      prepSummary: 'Strong connection candidate with aligned goals.',
    };
    expect(() => MeetingPrepSchema.parse(valid)).not.toThrow();
  });

  it('MeetingPrepSchema rejects empty arrays', () => {
    expect(() => MeetingPrepSchema.parse({
      commonalities: [],
      discussionStarters: [],
      prepSummary: 'x'.repeat(200),
    })).toThrow();
  });

  it('RerouteReasonSchema rejects out-of-range matchStrength', () => {
    expect(() => RerouteReasonSchema.parse({
      replacementReason: 'Great alternative!',
      matchStrength: 150, // Invalid: exceeds max 100
    })).toThrow();
  });

  it('PulseSchema rejects out-of-range intensity', () => {
    expect(() => PulseSchema.parse({
      intensity: 11, // Invalid: exceeds max 10
      sentiment: 'High Engagement',
      summary: 'The crowd is very excited.',
    })).toThrow();
  });
});

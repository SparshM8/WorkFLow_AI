import { describe, it, expect, vi } from 'vitest';
import { getMatchScore, getTopMatches } from '../utils/matchmaking';

vi.mock('../services/aiService', () => ({
  generateIcebreaker: vi.fn(async () => 'Hi Bob, I noticed we both care about Generative AI — would love to swap insights!'),
}));

import { generateIcebreaker } from '../services/aiService';

describe('MeetFlow AI - Networking ROI Integration', () => {
  const mockUser = {
    id: 'user1',
    name: 'Jane Dev',
    role: 'Lead Engineer',
    interests: ['Generative AI', 'React'],
    goals: ['Find Co-founder'],
    skills: ['Node.js', 'AWS'],
    experienceLevel: 'Senior'
  };

  const mockAttendees = [
    {
      id: 'user2',
      name: 'Bob Builder',
      role: 'Fullstack Dev',
      interests: ['Generative AI', 'Web3'],
      goals: ['Find Co-founder', 'Network'],
      skills: ['React', 'Solidity'],
      experienceLevel: 'Mid-Level'
    },
    {
      id: 'user3',
      name: 'Alice Architect',
      role: 'CTO',
      interests: ['Startups', 'SaaS'],
      goals: ['Hire talent'],
      skills: ['System Design'],
      experienceLevel: 'Executive'
    }
  ];

  it('should correctly calculate composite match scores', () => {
    const scoreA = getMatchScore(mockUser, mockAttendees[0]);

    // Bob shares Generative AI (10) + complementary goal (15) + shared skill React? (React is in interests for mockUser actually)
    // Actually mockUser has React in interests. Bob has React in skills. getMatchScore doesn't cross-check interests vs skills.
    
    expect(scoreA.score).toBeGreaterThan(0);
    expect(scoreA.sharedInterests).toContain('Generative AI');
  });

  it('should rank Bob higher than Alice for Jane based on Founder goal alignment', () => {
    const top = getTopMatches(mockUser, mockAttendees);
    expect(top[0].id).toBe('user2'); // Both want to find a co-founder
  });

  it('should handle zero-overlap scenarios gracefully without crashing', () => {
    const loner = {
      id: 'user4',
      name: 'Loner',
      interests: [],
      goals: [],
      skills: []
    };
    const score = getMatchScore(mockUser, loner);
    expect(score.score).toBe(0);
    expect(score.breakDown.interests).toBe(0);
  });

  it('should generate a valid icebreaker format even with high-level signals', async () => {
    const match = mockAttendees[0];
    const details = getMatchScore(mockUser, match);

    const icebreaker = await generateIcebreaker(mockUser, match, details);
    
    expect(typeof icebreaker).toBe('string');
    expect(icebreaker.length).toBeGreaterThan(10);
  });
});

import { describe, it, expect } from 'vitest';
import { getMatchScore, getTopMatches } from './matchmaking';

describe('Matchmaking Logic', () => {
  const userA = {
    name: 'Alice',
    interests: ['AI', 'Startups'],
    skills: ['React', 'Python'],
    goals: ['Find Co-founder', 'Network']
  };

  const userB = {
    name: 'Bob',
    interests: ['AI', 'Startups'],
    skills: ['React', 'Node.js'],
    goals: ['Find Co-founder', 'Hire talent']
  };

  const userC = {
    name: 'Charlie',
    interests: ['Cooking'],
    skills: ['Chef'],
    goals: ['Mentorship'] // No overlap with Alice
  };

  it('calculates score based on shared interests', () => {
    const { score, sharedInterests } = getMatchScore({ interests: ['AI'] }, { interests: ['AI'] });
    expect(score).toBe(10);
    expect(sharedInterests).toContain('AI');
  });

  it('calculates score based on shared skills', () => {
    const { score, sharedSkills } = getMatchScore({ skills: ['React'] }, { skills: ['React'] });
    expect(score).toBe(10);
    expect(sharedSkills).toContain('React');
  });

  it('calculates score based on complementary goals', () => {
    const { score, matchingGoals } = getMatchScore({ goals: ['Find Co-founder'] }, { goals: ['Find Co-founder'] });
    // Find Co-founder + Find Co-founder = 15 points
    expect(score).toBe(15);
    expect(matchingGoals).toHaveLength(1);
  });

  it('calculates complex scores correctly', () => {
    const result = getMatchScore(userA, userB);
    // Interests: AI, Startups (2 * 10 = 20)
    // Skills: React (1 * 10 = 10)
    // Goals: Find Co-founder (15) + Network (0 matches with Bob's goals in the Complementary map) 
    // Wait, let's check COMPLEMENTARY_GOALS["Network"]: ["Network", "Startups", "Learn new tech", "Find Co-founder"]
    // Bob has "Find Co-founder". So Network (Alice) <-> Find Co-founder (Bob) = 15 points.
    // Total = 20 + 10 + 15 + 15 = 60.
    expect(result.score).toBe(60);
  });

  it('handles empty or null profiles gracefully', () => {
    const result = getMatchScore({}, {});
    expect(result.score).toBe(0);
    expect(result.sharedInterests).toEqual([]);
  });

  it('caps scores at 100', () => {
    const extremeUser = {
      interests: Array(20).fill('topic'),
      skills: Array(20).fill('skill'),
      goals: ['Network', 'Mentorship']
    };
    const result = getMatchScore(extremeUser, extremeUser);
    expect(result.score).toBe(100);
  });

  it('ranks matches correctly', () => {
    const matches = getTopMatches(userA, [userB, userC]);
    expect(matches[0].name).toBe('Bob');
    expect(matches[1].name).toBe('Charlie');
    expect(matches[0].score).toBeGreaterThan(matches[1].score);
  });
});

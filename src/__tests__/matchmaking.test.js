import { describe, it, expect } from 'vitest';
import { getMatchScore, getTopMatches, generateMatchExplanation } from '../utils/matchmaking';

const userA = {
  name: "Antigravity",
  role: "Lead Engineer",
  interests: ["Generative AI", "Scalable Systems"],
  goals: ["Find Co-founder", "Network"],
  skills: ["React", "Node.js"],
  experienceLevel: "Senior",
  availability: "Always"
};

const userB = {
  id: "2",
  name: "Jane Dev",
  role: "Product Manager",
  interests: ["Generative AI", "User Psychology"],
  goals: ["Find Co-founder", "Startups"],
  skills: ["Product Strategy", "Figma"],
  experienceLevel: "Senior",
  availability: "Mostly"
};

const userC = {
  id: "3",
  name: "Non-Match",
  role: "Gardener",
  interests: ["Botany"],
  goals: ["Learn new tech"],
  skills: ["Pruning"],
  experienceLevel: "Junior",
  availability: "Available for Coffee"
};

describe('Matchmaking Engine', () => {
    it('should correctly calculate higher score for compatible users', () => {
        const scoreAB = getMatchScore(userA, userB);
        const scoreAC = getMatchScore(userA, userC);
        expect(scoreAB.score).toBeGreaterThan(scoreAC.score);
        expect(scoreAB.sharedInterests).toContain("Generative AI");
    });

    it('should identify complementary goals', () => {
        const scoreAB = getMatchScore(userA, userB);
        expect(scoreAB.matchingGoals.length).toBeGreaterThan(0);
        // "Find Co-founder" matches between both
    });

    it('should return top matches in sorted order', () => {
        const matches = getTopMatches(userA, [userB, userC], 2);
        expect(matches[0].id).toBe("2"); // Jane Dev should be top
        expect(matches[1].id).toBe("3");
    });

    it('should generate meaningful explanations', () => {
        const explanation = generateMatchExplanation(userA, userB);
        const interestSignal = explanation.find(s => s.type === 'interests');
        expect(interestSignal).toBeDefined();
        expect(interestSignal.value).toContain("Generative AI");
    });
});

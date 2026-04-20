import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppContext } from '../../context/AppContext';
import MatchCard from '../../components/MatchCard';

vi.mock('../../utils/matchmaking', () => ({
  generateMatchExplanation: vi.fn(() => ([
    {
      type: 'interests',
      label: 'Shared Interests',
      value: 'Generative AI, React',
      strength: 'high',
    },
  ])),
}));

vi.mock('../../components/ReasoningChain', () => ({
  default: () => <div>Reasoning chain placeholder</div>,
}));

describe('MatchCard', () => {
  const match = {
    id: 'match-1',
    name: 'Bob Builder',
    role: 'Fullstack Dev',
    company: 'Acme Labs',
    bio: 'Builds resilient product workflows.',
    matchDetails: {
      score: 82,
      sharedInterests: ['Generative AI', 'React'],
      sharedSkills: ['Node.js'],
      matchingGoals: ['Network'],
      breakDown: { interests: 40, skills: 20, goals: 40 },
    },
  };

  const contextValue = {
    currentUser: {
      name: 'Jane Dev',
      experienceLevel: 'Senior',
      interests: ['Generative AI'],
      goals: ['Network'],
      skills: ['Node.js'],
    },
    networkRoster: [],
    setActiveConnectionMatch: vi.fn(),
    matchFeedback: {},
    handleMatchFeedback: vi.fn(),
  };

  it('opens the connection flow from the primary action', () => {
    render(
      <AppContext.Provider value={contextValue}>
        <MatchCard match={match} />
      </AppContext.Provider>
    );

    expect(screen.getByText('82% match')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Connect/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Connect/i }));

    expect(contextValue.setActiveConnectionMatch).toHaveBeenCalledWith(match);
  });

  it('expands the match rationale for explainability', () => {
    render(
      <AppContext.Provider value={contextValue}>
        <MatchCard match={match} />
      </AppContext.Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Why this match\?/i }));

    expect(screen.getByText('Reasoning chain placeholder')).toBeInTheDocument();
    expect(screen.getByText('Shared Interests')).toBeInTheDocument();
  });
});
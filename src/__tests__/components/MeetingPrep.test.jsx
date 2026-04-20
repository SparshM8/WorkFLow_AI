import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MeetingPrep from '../../components/MeetingPrep';

vi.mock('../../services/aiService', () => ({
  generateMeetingPrep: vi.fn(),
}));

import { generateMeetingPrep } from '../../services/aiService';

describe('MeetingPrep', () => {
  const currentUser = {
    name: 'Jane Dev',
    goals: ['Find Co-founder'],
  };

  const partner = {
    name: 'Bob Builder',
    role: 'Fullstack Dev',
    company: 'Acme Labs',
  };

  beforeEach(() => {
    generateMeetingPrep.mockResolvedValue({
      commonalities: ['Shared interest in AI', 'Both work in product teams'],
      discussionStarters: ['What problem are you solving today?'],
      prepSummary: 'You both care about building useful AI products.',
    });
  });

  it('renders the prep brief after the AI response resolves', async () => {
    render(<MeetingPrep currentUser={currentUser} partner={partner} />);

    expect(screen.getByText(/Analyzing shared context/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('1-Minute Prep Brief')).toBeInTheDocument();
    });

    expect(screen.getByText('Shared interest in AI')).toBeInTheDocument();
    expect(screen.getByText('What problem are you solving today?')).toBeInTheDocument();
    expect(screen.getByText(/building useful AI products/i)).toBeInTheDocument();
    expect(generateMeetingPrep).toHaveBeenCalledWith(currentUser, partner);
  });
});
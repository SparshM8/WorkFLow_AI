import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../services/firebase', () => ({
  IS_FIREBASE_CONFIGURED: false,
}));

import LandingPage from '../pages/LandingPage';

describe('LandingPage runtime mode', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows the local resilience mode badge when Firebase keys are missing', () => {
    render(<LandingPage />);

    expect(screen.getByText(/Mode: Local Resilience \(Firebase Keys Missing\)/i)).toBeInTheDocument();
  });
});
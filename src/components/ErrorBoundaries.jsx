import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Root Error Boundary for the entire application.
 * Catches unexpected React render errors and provides a graceful reload option.
 */
export class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Unhandled render error:', error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100vh', flexDirection: 'column', gap: '1rem',
            background: '#06060c', color: 'white', padding: '2rem', textAlign: 'center',
          }}
        >
          <Sparkles size={40} style={{ color: '#6366f1' }} />
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Something went wrong</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '380px', margin: 0 }}>
            MeetFlow AI hit an unexpected error. Your data is safe. Please refresh:
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 2rem', background: '#6366f1', color: 'white',
              border: 'none', borderRadius: '12px', cursor: 'pointer',
              fontWeight: 700, boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
            }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * AI-Specific Error Boundary.
 * Isolates AI failures (e.g., in the Chat FAB or AI-heavy widgets) 
 * so the rest of the UI remains functional.
 */
export class AIAgentBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="card p-4 border-dashed border-red-500/30 text-center">
          <p className="text-xs text-secondary">AI Concierge is currently recalibrating signals...</p>
          <button className="btn btn-xs btn-outline mt-2" onClick={() => this.setState({ hasError: false })}>Retry AI</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * App.jsx — Root Application Shell
 *
 * Architecture:
 * - ErrorBoundary: catches unexpected React render errors
 * - AppProvider: global state (user, sessions, networking, toasts)
 * - React Router: lazy-loaded routes with chunk-error recovery
 * - MainLayout: nav + overlay layer (drawer, modal, command palette, FAB)
 * - ProtectedRoute: redirects unauthenticated users to landing page
 */

import React, { Suspense, lazy, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Menu, Sparkles } from 'lucide-react';
import { AppProvider, AppContext } from './context/AppContext';
import Navigation from './components/Navigation';
import RerouteAlert from './components/RerouteAlert';
import SessionDrawer from './components/SessionDrawer';
import ConnectionModal from './components/ConnectionModal';
import CommandPalette from './components/CommandPalette';
import AIChatFAB from './components/AIChatFAB';
import ConciergeBot from './components/ConciergeBot';
import TermsPrivacy from './pages/TermsPrivacy';

import './App.css';

// ─── Chunk-error-resilient lazy loader ────────────────────────────────────────
// Automatically refreshes on ChunkLoadError (new deployment invalidation).
const safeLazy = (importFn) =>
  lazy(() =>
    importFn().catch((error) => {
      if (error.name === 'ChunkLoadError' || error.message?.includes('Loading chunk')) {
        console.warn('[App] Chunk load error — reloading for new deployment.');
        window.location.reload();
      }
      throw error;
    })
  );

const LazyLanding    = safeLazy(() => import('./pages/LandingPage'));
const LazyOnboarding = safeLazy(() => import('./pages/Onboarding'));
const LazyDashboard  = safeLazy(() => import('./pages/Dashboard'));
const LazyAgenda     = safeLazy(() => import('./pages/Agenda'));
const LazyMatchDetails = safeLazy(() => import('./pages/MatchDetails'));
const LazyProfile    = safeLazy(() => import('./pages/Profile'));
const LazyExplore    = safeLazy(() => import('./pages/Explore'));

// ─── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
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
 * AI-Specific Error Boundary
 * Isolates AI failures so the rest of the UI remains functional.
 */
class AIAgentBoundary extends React.Component {
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

// ─── Route Loader ─────────────────────────────────────────────────────────────
const RouteLoader = () => (
  <div className="dashboard-gate flex-col gap-4" role="status" aria-live="polite" aria-label="Loading page">
    <div className="loader-pulse-ring">
      <Sparkles size={32} className="text-accent-primary animate-pulse" aria-hidden="true" />
    </div>
    <div className="text-center">
      <h2 className="text-xl font-bold text-primary">MeetFlow AI</h2>
      <p className="text-secondary text-sm">Preparing your event journey…</p>
    </div>
  </div>
);

// ─── Protected Route ──────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useContext(AppContext);
  if (!currentUser) return <Navigate to="/" replace />;
  return children;
};

// ─── Main Layout ──────────────────────────────────────────────────────────────
const MainLayout = ({ children }) => {
  const {
    currentUser,
    activeDrawerSession, setActiveDrawerSession,
    activeConnectionMatch, setActiveConnectionMatch,
    setIsSidebarOpen,
  } = useContext(AppContext);

  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Global keyboard shortcut: Ctrl+K / Cmd+K opens Command Palette
  useEffect(() => {
    const handleGlobalKeys = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  return (
    <div className="app-container">
      {currentUser && <Navigation />}

      <main id="main-content" className={`main-content ${currentUser ? 'with-nav' : ''}`}>
        {currentUser && (
          <div className="mobile-header flex-between">
            <h2 className="brand-text gradient-text" style={{ fontSize: '1.25rem' }}>MeetFlow AI</h2>
            <button
              type="button"
              className="btn-icon"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={24} aria-hidden="true" />
            </button>
          </div>
        )}
        <div className="content-pad">
          {children}
        </div>
      </main>

      {/* ── Overlay Layer ── */}
      <RerouteAlert />

      {activeDrawerSession && (
        <SessionDrawer
          sessionId={activeDrawerSession}
          onClose={() => setActiveDrawerSession(null)}
        />
      )}

      {activeConnectionMatch && (
        <ConnectionModal
          match={activeConnectionMatch}
          onClose={() => setActiveConnectionMatch(null)}
        />
      )}

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />

      <AIAgentBoundary>
        <AIChatFAB />
      </AIAgentBoundary>
    </div>
  );
};

// ─── App Root ─────────────────────────────────────────────────────────────────
const App = () => (
  <ErrorBoundary>
    <AppProvider>
      <Router>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <MainLayout>
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              <Route path="/" element={<LazyLanding />} />
              <Route path="/onboarding" element={<LazyOnboarding />} />
              <Route path="/dashboard" element={<ProtectedRoute><LazyDashboard /></ProtectedRoute>} />
              <Route path="/agenda" element={<ProtectedRoute><LazyAgenda /></ProtectedRoute>} />
              <Route path="/match/:id" element={<ProtectedRoute><LazyMatchDetails /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><LazyProfile /></ProtectedRoute>} />
              <Route path="/explore" element={<ProtectedRoute><LazyExplore /></ProtectedRoute>} />
              <Route path="/privacy" element={<TermsPrivacy />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </MainLayout>
        <ConciergeBot />
      </Router>
    </AppProvider>
  </ErrorBoundary>
);

export default App;

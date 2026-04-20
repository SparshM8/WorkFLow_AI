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

import React, { Suspense, lazy, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { AppProvider, AppContext } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundaries';
import MainLayout from './layout/MainLayout';
import ConciergeBot from './components/ConciergeBot';
import TermsPrivacy from './pages/TermsPrivacy';

import './App.css';

// ─── Chunk-error-resilient lazy loader ────────────────────────────────────────
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

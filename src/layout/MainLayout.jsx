import React, { useContext, useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import Navigation from '../components/Navigation';
import RerouteAlert from '../components/RerouteAlert';
import SessionDrawer from '../components/SessionDrawer';
import ConnectionModal from '../components/ConnectionModal';
import CommandPalette from '../components/CommandPalette';
import AIChatFAB from '../components/AIChatFAB';
import { AIAgentBoundary } from '../components/ErrorBoundaries';

/**
 * MainLayout — Provides the consistent shell for the authenticated application.
 * Includes global navigation, mobile header, and common overlays.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Route content
 */
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

export default MainLayout;

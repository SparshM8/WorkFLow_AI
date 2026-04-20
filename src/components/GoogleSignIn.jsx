import React, { useState } from 'react';
import { LogIn, CheckCircle2 } from 'lucide-react';
import { googleSignIn } from '../services/AuthService';
import './GoogleSignIn.css';

/**
 * Google Sign-In Component
 * Uses Firebase Auth popup with resilient fallback from AuthService.
 */
const GoogleSignIn = ({ onAuthSuccess }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authNotice, setAuthNotice] = useState('');

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthNotice('');
    try {
      const user = await googleSignIn();
      setIsAuthenticating(false);
      setIsSuccess(true);
      if (user.provider === 'local-resilience') {
        setAuthNotice('Google Auth is not fully configured yet. You are continuing in local resilience mode.');
      }
      setTimeout(() => {
        onAuthSuccess({
          id: user.uid,
          email: user.email,
          name: user.displayName,
          provider: user.provider,
        });
      }, 1000);
    } catch (error) {
      setIsAuthenticating(false);
      setAuthNotice(error?.message || 'Sign-in failed. Please verify Firebase Authentication settings.');
    }
  };

  return (
    <div className="google-auth-container">
      <button 
        className={`btn-google ${isAuthenticating ? 'loading' : ''} ${isSuccess ? 'success' : ''}`}
        onClick={handleSignIn}
        disabled={isAuthenticating || isSuccess}
        aria-label="Sign in with Google"
      >
        {isSuccess ? (
          <CheckCircle2 size={18} className="animate-bounce-in" />
        ) : (
          <svg className="google-logo" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        <span>{isSuccess ? 'Authenticated' : isAuthenticating ? 'Signing in...' : 'Sign in with Google'}</span>
      </button>
      <p className="auth-helper">Powered by Google Cloud Firebase Identity</p>
      {authNotice && <p className="auth-helper" role="status">{authNotice}</p>}
    </div>
  );
};

export default GoogleSignIn;

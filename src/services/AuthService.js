/**
 * MeetFlow AI Authentication Service
 * Uses Firebase Google Identity when configured, with resilient local fallback.
 */
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, IS_FIREBASE_CONFIGURED } from './firebase';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
let firebaseAuthPrecheck = null;
const FIREBASE_AUTH_UNAVAILABLE_KEY = 'meetflow_firebase_auth_unavailable';

const createLocalSessionUser = () => ({
  uid: `google_${Math.random().toString(36).slice(2, 11)}`,
  displayName: 'Conference Guest',
  email: 'guest@example.com',
  photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
  emailVerified: true,
  provider: 'local-resilience',
  authMode: 'fallback',
});

const persistAuthSession = (user, token = 'mock_jwt_token') => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('meetflow_auth_session', JSON.stringify({
      user,
      token,
      expiry: Date.now() + 3600000,
    }));
  }
};

const markFirebaseAuthUnavailable = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(FIREBASE_AUTH_UNAVAILABLE_KEY, '1');
  }
};

const clearFirebaseAuthUnavailable = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(FIREBASE_AUTH_UNAVAILABLE_KEY);
  }
};

const isFirebaseAuthMarkedUnavailable = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(FIREBASE_AUTH_UNAVAILABLE_KEY) === '1';
};

const isFirebaseAuthReady = async () => {
  if (!IS_FIREBASE_CONFIGURED || !FIREBASE_API_KEY) return false;
  if (firebaseAuthPrecheck !== null) return firebaseAuthPrecheck;

  try {
    const response = await fetch(`https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=${FIREBASE_API_KEY}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    firebaseAuthPrecheck = response.ok;
  } catch {
    firebaseAuthPrecheck = false;
  }

  return firebaseAuthPrecheck;
};

export const googleSignIn = async () => {
  if (isFirebaseAuthMarkedUnavailable()) {
    await delay(200);
    const localUser = createLocalSessionUser();
    persistAuthSession(localUser);
    return localUser;
  }

  if (IS_FIREBASE_CONFIGURED && auth) {
    const authReady = await isFirebaseAuthReady();
    if (!authReady) {
      console.warn('[Auth] Firebase Auth project config unavailable. Using local resilience mode.');
      markFirebaseAuthUnavailable();
      await delay(300);
      const localUser = createLocalSessionUser();
      persistAuthSession(localUser);
      return localUser;
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const sessionUser = {
        uid: user.uid,
        displayName: user.displayName || 'Conference Guest',
        email: user.email || 'guest@example.com',
        photoURL: user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
        emailVerified: user.emailVerified,
        provider: 'google.com',
        authMode: 'firebase',
      };

      persistAuthSession(sessionUser, await user.getIdToken());
      clearFirebaseAuthUnavailable();
      return sessionUser;
    } catch (error) {
      const recoverableAuthCodes = new Set([
        'auth/configuration-not-found',
        'auth/invalid-api-key',
        'auth/api-key-not-valid',
        'auth/unauthorized-domain',
        'auth/operation-not-allowed',
        'auth/network-request-failed',
      ]);

      if (recoverableAuthCodes.has(error?.code)) {
        console.warn('[Auth] Firebase Google Sign-In unavailable. Falling back to local resilience mode.', {
          code: error?.code,
          message: error?.message,
        });
        markFirebaseAuthUnavailable();
        await delay(400);
        const localUser = createLocalSessionUser();
        persistAuthSession(localUser);
        return localUser;
      }

      throw error;
    }
  }

  // Fallback mode when Firebase keys are not configured.
  await delay(800);
  const localUser = createLocalSessionUser();
  persistAuthSession(localUser);
  return localUser;
};

export const logOutSession = () => {
  localStorage.removeItem('meetflow_auth_session');
};

export const getSessionUser = () => {
  const session = localStorage.getItem('meetflow_auth_session');
  if (!session) return null;
  return JSON.parse(session).user;
};

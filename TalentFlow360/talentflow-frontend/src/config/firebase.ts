import { initializeApp, getApps, getApp, deleteApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, Auth, UserCredential } from 'firebase/auth';
import { GoogleAuthPayload } from '../types/auth';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}

const STORAGE_KEY = 'talentflow_firebase_config';

/**
 * Reset all active Firebase app instances in memory.
 */
export async function resetFirebaseApps(): Promise<void> {
  const existingApps = getApps();
  for (const app of existingApps) {
    try {
      await deleteApp(app);
    } catch (e) {
      console.warn('Error deleting Firebase app instance:', e);
    }
  }
}

/**
 * Retrieve Firebase configuration from LocalStorage or Vite Environment Variables.
 */
export function getFirebaseConfig(): FirebaseConfig | null {
  // 1. Check LocalStorage override first
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: FirebaseConfig = JSON.parse(stored);
      if (parsed.apiKey && parsed.authDomain && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored Firebase config:', e);
  }

  // 2. Fall back to Vite environment variables
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;
  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;

  if (
    apiKey &&
    authDomain &&
    projectId &&
    apiKey !== 'your_api_key_here' &&
    !apiKey.startsWith('your_')
  ) {
    return {
      apiKey,
      authDomain,
      projectId,
      storageBucket: storageBucket || `${projectId}.appspot.com`,
      messagingSenderId: messagingSenderId || '',
      appId: appId || '',
      measurementId: measurementId || '',
    };
  }

  return null;
}

/**
 * Check if a valid Firebase configuration is active.
 */
export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return Boolean(config && config.apiKey && config.authDomain && config.projectId);
}

/**
 * Save Firebase configuration to LocalStorage and reinitialize.
 */
export async function saveFirebaseConfig(config: FirebaseConfig): Promise<boolean> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    await resetFirebaseApps();
    initializeApp(config);
    return true;
  } catch (e) {
    console.error('Failed to save Firebase config:', e);
    return false;
  }
}

/**
 * Clear stored Firebase configuration from LocalStorage and memory.
 */
export async function clearFirebaseConfig(): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_KEY);
    await resetFirebaseApps();
  } catch (e) {
    console.error('Failed to clear Firebase config:', e);
  }
}

/**
 * Parse raw Firebase config text (e.g. pasted JavaScript snippet or JSON).
 */
export function parseFirebaseConfigSnippet(snippet: string): FirebaseConfig | null {
  try {
    // If it's direct JSON
    if (snippet.trim().startsWith('{')) {
      const parsed = JSON.parse(snippet);
      if (parsed.apiKey && parsed.authDomain) {
        return {
          ...parsed,
          apiKey: parsed.apiKey.replace(/["',;]/g, '').trim(),
          authDomain: parsed.authDomain.replace(/["',;]/g, '').trim(),
          projectId: parsed.projectId ? parsed.projectId.replace(/["',;]/g, '').trim() : '',
        };
      }
    }

    // Try regex matching common Firebase JS object format
    const extract = (key: string): string => {
      const regex = new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`, 'i');
      const match = snippet.match(regex);
      return match ? match[1].replace(/["',;]/g, '').trim() : '';
    };

    const apiKey = extract('apiKey');
    const authDomain = extract('authDomain');
    const projectId = extract('projectId');
    const storageBucket = extract('storageBucket');
    const messagingSenderId = extract('messagingSenderId');
    const appId = extract('appId');
    const measurementId = extract('measurementId');

    if (apiKey && authDomain && projectId) {
      return {
        apiKey,
        authDomain,
        projectId,
        storageBucket: storageBucket || `${projectId}.appspot.com`,
        messagingSenderId,
        appId,
        measurementId,
      };
    }
  } catch (e) {
    console.warn('Failed to parse Firebase config snippet:', e);
  }
  return null;
}

/**
 * Initialize or get Firebase App instance.
 */
export function getFirebaseApp(): FirebaseApp {
  const config = getFirebaseConfig();
  if (!config) {
    throw new Error('FIREBASE_NOT_CONFIGURED: Please configure your Firebase project credentials.');
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    const current = getApp();
    if (current.options.apiKey === config.apiKey && current.options.projectId === config.projectId) {
      return current;
    }
    // Delete stale app synchronously or mark for re-creation
    try {
      deleteApp(current);
    } catch (e) {
      console.warn('Error clearing stale Firebase app:', e);
    }
  }

  return initializeApp(config);
}

/**
 * Get Firebase Auth instance.
 */
export function getFirebaseAuth(): Auth {
  const app = getFirebaseApp();
  return getAuth(app);
}

/**
 * Trigger Real Google Sign-In Popup via Firebase Auth.
 * Returns normalized payload ready to send to Spring Boot backend /api/v1/auth/google.
 */
export async function signInWithGoogleReal(
  role: string = 'ROLE_JOB_SEEKER'
): Promise<GoogleAuthPayload> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  provider.addScope('email');
  provider.addScope('profile');

  const credential: UserCredential = await signInWithPopup(auth, provider);
  const user = credential.user;

  if (!user.email) {
    throw new Error('Google account does not have a verified email address.');
  }

  // Parse first and last names from displayName
  const fullName = user.displayName?.trim() || '';
  let firstName = 'Google';
  let lastName = 'User';

  if (fullName) {
    const parts = fullName.split(' ');
    firstName = parts[0] || 'Google';
    lastName = parts.slice(1).join(' ') || 'User';
  }

  return {
    email: user.email.toLowerCase(),
    firstName,
    lastName,
    googleId: user.uid,
    avatarUrl: user.photoURL || undefined,
    role,
  };
}


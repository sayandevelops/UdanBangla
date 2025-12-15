
import { User } from '../types';

/**
 * MOCK FIREBASE SERVICE
 * 
 * The real Firebase SDK throws "auth/operation-not-supported-in-this-environment" 
 * in this preview environment due to cross-origin isolation and storage restrictions.
 * 
 * This mock service provides a working authentication experience for the demo.
 */

// --- Mock Classes ---

export class GoogleAuthProvider {}

export class RecaptchaVerifier {
  constructor(container: HTMLElement | string, parameters: any, auth: any) {}
  verify() { return Promise.resolve(true); }
  render() { return Promise.resolve(0); }
  clear() {}
}

// --- Mock State ---

let currentUser: User | null = null;
let authStateListeners: ((user: User | null) => void)[] = [];

// Initialize from local storage if available
try {
  const stored = localStorage.getItem('udan_bangla_mock_user');
  if (stored) {
    currentUser = JSON.parse(stored);
  }
} catch (e) {
  console.warn('LocalStorage not available');
}

// --- Helpers ---

const notifyListeners = () => {
  authStateListeners.forEach(listener => listener(currentUser));
};

const updateStorage = () => {
  try {
    if (currentUser) {
      localStorage.setItem('udan_bangla_mock_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('udan_bangla_mock_user');
    }
  } catch (e) {
    // Ignore storage errors
  }
};

const mockDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

// --- Auth Methods ---

export const auth = {
  // Mock property to satisfy some SDK checks
  currentUser: currentUser
};

export const onAuthStateChanged = (
  _authInstance: any, 
  callback: (user: User | null) => void
) => {
  authStateListeners.push(callback);
  // Immediate callback
  callback(currentUser);
  return () => {
    authStateListeners = authStateListeners.filter(cb => cb !== callback);
  };
};

export const signOut = async (_authInstance: any) => {
  await mockDelay(500);
  currentUser = null;
  updateStorage();
  notifyListeners();
};

export const signInWithPopup = async (_authInstance: any, _provider: any) => {
  await mockDelay(1500);
  currentUser = {
    uid: 'mock-google-' + Date.now(),
    email: 'student@gmail.com',
    phoneNumber: null,
    displayName: 'Google User',
    photoURL: null,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString()
    }
  };
  updateStorage();
  notifyListeners();
  return { user: currentUser };
};

export const signInWithEmailAndPassword = async (_authInstance: any, email: string, password: string) => {
  await mockDelay(1000);
  
  // Admin Login Check
  if (email === 'sayon8023@gmail.com') {
    if (password !== '123450') {
      throw { code: 'auth/wrong-password', message: 'Invalid password for admin.' };
    }
    // Admin User Object
    currentUser = {
      uid: 'admin-uid-sayon',
      email: email,
      phoneNumber: null,
      displayName: 'System Administrator',
      photoURL: null,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString()
      }
    };
  } else {
    // Basic validation for other users
    if (!email.includes('@')) throw { code: 'auth/invalid-email', message: 'Invalid email' };
    
    // Normal User Object
    currentUser = {
      uid: 'mock-email-' + Date.now(),
      email: email,
      phoneNumber: null,
      displayName: email.split('@')[0],
      photoURL: null,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString()
      }
    };
  }
  
  updateStorage();
  notifyListeners();
  return { user: currentUser };
};

export const createUserWithEmailAndPassword = async (_authInstance: any, email: string, password: string) => {
  // Use same logic as sign in for mock
  return signInWithEmailAndPassword(_authInstance, email, password);
};

export const signInWithPhoneNumber = async (_authInstance: any, phoneNumber: string, _verifier: any) => {
  await mockDelay(1000);
  // Return a mock confirmation result
  return {
    confirm: async (otp: string) => {
      await mockDelay(800);
      if (otp !== '123456') throw { code: 'auth/invalid-verification-code', message: 'Invalid OTP' };
      
      currentUser = {
        uid: 'mock-phone-' + Date.now(),
        email: null,
        phoneNumber: phoneNumber,
        displayName: 'Mobile User',
        photoURL: null,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        }
      };
      updateStorage();
      notifyListeners();
      return { user: currentUser };
    }
  };
};

export const updateProfile = async (user: User, updates: { displayName: string }) => {
  await mockDelay(500);
  if (currentUser && currentUser.uid === user.uid) {
    currentUser = { ...currentUser, ...updates };
    updateStorage();
    notifyListeners();
  }
};

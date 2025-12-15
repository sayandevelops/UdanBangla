// Mock implementation of Firebase services
// This allows the app to run without requiring a valid Firebase project configuration or node_modules
import { User as UserType } from '../types';

// Mock User object matching the structure expected by the app
const MOCK_USER: UserType = {
  uid: 'mock-user-123',
  email: 'student@example.com',
  phoneNumber: null,
  displayName: 'Demo Student',
  photoURL: null,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString()
  }
};

const ADMIN_USER: UserType = {
  uid: 'admin-user-999',
  email: 'sayon8023@gmail.com',
  phoneNumber: null,
  displayName: 'Admin User',
  photoURL: null,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString()
  }
};

let currentUser: UserType | null = null;
const authListeners: ((user: UserType | null) => void)[] = [];

const notifyListeners = () => {
  authListeners.forEach(listener => listener(currentUser));
};

// --- Auth Exports ---

export const auth = {
  get currentUser() { return currentUser; }
};

export const onAuthStateChanged = (authInstance: any, callback: (user: UserType | null) => void) => {
  authListeners.push(callback);
  // Initial callback
  setTimeout(() => callback(currentUser), 0);
  return () => {
    const index = authListeners.indexOf(callback);
    if (index > -1) authListeners.splice(index, 1);
  };
};

export const signOut = async (authInstance: any) => {
  currentUser = null;
  notifyListeners();
  return Promise.resolve();
};

export const signInWithPopup = async (authInstance: any, provider: any) => {
  currentUser = MOCK_USER;
  notifyListeners();
  return Promise.resolve({ user: currentUser });
};

export const signInWithEmailAndPassword = async (authInstance: any, email: string, password: string) => {
  if (email === ADMIN_USER.email) {
    currentUser = ADMIN_USER;
  } else {
    currentUser = {
      ...MOCK_USER,
      uid: 'user-' + Date.now(),
      email: email,
      displayName: email.split('@')[0]
    };
  }
  notifyListeners();
  return Promise.resolve({ user: currentUser });
};

export const createUserWithEmailAndPassword = async (authInstance: any, email: string, password: string) => {
  currentUser = {
    ...MOCK_USER,
    uid: 'new-user-' + Date.now(),
    email: email,
    displayName: email.split('@')[0]
  };
  notifyListeners();
  return Promise.resolve({ user: currentUser });
};

export const signInWithPhoneNumber = async (authInstance: any, phoneNumber: string, verifier: any) => {
  return Promise.resolve({
    confirm: async (otp: string) => {
      if (otp === '123456') {
        currentUser = {
          ...MOCK_USER,
          uid: 'phone-user-' + Date.now(),
          email: null,
          phoneNumber: phoneNumber,
          displayName: 'Mobile User'
        };
        notifyListeners();
        return { user: currentUser };
      }
      throw new Error('Invalid OTP. Use 123456');
    }
  });
};

export const updateProfile = async (user: any, profile: { displayName?: string, photoURL?: string }) => {
  if (currentUser) {
    if (profile.displayName) currentUser.displayName = profile.displayName;
    if (profile.photoURL) currentUser.photoURL = profile.photoURL;
    notifyListeners();
  }
  return Promise.resolve();
};

export class GoogleAuthProvider {}

export class RecaptchaVerifier {
  constructor(authInstance: any, container: any, params: any) {}
  render() { return Promise.resolve(0); }
  verify() { return Promise.resolve('mock-token'); }
}

// --- Firestore Exports ---

export const db = {}; // Mock DB object
export const getFirestore = (app: any) => db;

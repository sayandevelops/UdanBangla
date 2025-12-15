// ...existing code...
import type { User } from '../types';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider as FirebaseGoogleAuthProvider,
  RecaptchaVerifier as FirebaseRecaptchaVerifier,
  signInWithPopup as firebaseSignInWithPopup,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signInWithPhoneNumber as firebaseSignInWithPhoneNumber,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  type Auth,
  type User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';

const firebaseConfig = {
 apiKey: "AIzaSyBT4v__chb6eoNyOPSovwCCgLEbfGrhF4U",
  authDomain: "udan-bangla-55581.firebaseapp.com",
  projectId: "udan-bangla-55581",
  storageBucket: "udan-bangla-55581.firebasestorage.app",
  messagingSenderId: "769809403146",
  appId: "1:769809403146:web:d19fabdf7cce487f51fef3"

};

const missing = Object.entries(firebaseConfig).filter(([, v]) => !v);
if (missing.length) {
  console.warn('Firebase config incomplete. Set VITE_FIREBASE_* in .env.local:', missing.map(([k]) => k));
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig as any);
const auth = getAuth(app);
const db = getFirestore(app);

export const GoogleAuthProvider = FirebaseGoogleAuthProvider;
export const RecaptchaVerifier = FirebaseRecaptchaVerifier;
export const getDb = () => db;

// Re‑export some Firestore helpers for convenience in services
export const firestore = {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
};

/** Map Firebase User -> app User type (adjust fields if your types.ts differs) */
const mapUser = (fbUser: FirebaseUser | null): User | null => {
  if (!fbUser) return null;
  return {
    uid: fbUser.uid,
    email: fbUser.email ?? null,
    phoneNumber: fbUser.phoneNumber ?? null,
    displayName: fbUser.displayName ?? null,
    photoURL: fbUser.photoURL ?? null,
    metadata: {
      creationTime: fbUser.metadata?.creationTime ?? null,
      lastSignInTime: fbUser.metadata?.lastSignInTime ?? null
    }
  } as any;
};

export const getAuthInstance = (): Auth => auth;

export const onAuthStateChanged = (authInstance: Auth | undefined, callback: (u: User | null) => void) => {
  return firebaseOnAuthStateChanged(authInstance || auth, (fbUser) => {
    callback(mapUser(fbUser));
  });
};

export const signOut = (authInstance?: Auth) => firebaseSignOut(authInstance || auth);

export const signInWithPopup = (authInstance: Auth | undefined, provider: any) =>
  firebaseSignInWithPopup(authInstance || auth, provider);

export const signInWithEmailAndPassword = (authInstance: Auth | undefined, email: string, password: string) =>
  firebaseSignInWithEmailAndPassword(authInstance || auth, email, password);

export const createUserWithEmailAndPassword = (authInstance: Auth | undefined, email: string, password: string) =>
  firebaseCreateUserWithEmailAndPassword(authInstance || auth, email, password);

export const sendPasswordResetEmail = (authInstance: Auth | undefined, email: string) =>
  firebaseSendPasswordResetEmail(authInstance || auth, email);

export const signInWithPhoneNumber = (authInstance: Auth | undefined, phoneNumber: string, verifier: any) =>
  firebaseSignInWithPhoneNumber(authInstance || auth, phoneNumber, verifier);

export const updateProfile = (user: any, profile: { displayName?: string; photoURL?: string }) =>
  firebaseUpdateProfile(user, profile);
// ...existing code...
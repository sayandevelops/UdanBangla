import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuthInstance, onAuthStateChanged, signOut } from '../services/firebase';
import { User } from '../types';
import { saveUserProfile } from '../services/userService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the auth instance
    const authInstance = getAuthInstance();
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      setCurrentUser(user);
      if (user) {
        // Fire and forget profile save
        saveUserProfile(user);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    const authInstance = getAuthInstance();
    await signOut(authInstance);
  };

  const value = {
    currentUser,
    loading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
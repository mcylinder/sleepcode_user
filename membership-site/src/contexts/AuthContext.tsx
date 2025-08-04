'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  UserCredential
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '@/lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<UserCredential>;
  signup: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<UserCredential>;
  signInWithFacebook: () => Promise<UserCredential>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function signup(email: string, password: string) {
    if (!auth) throw new Error('Firebase not initialized. Please check your environment variables.');
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email: string, password: string) {
    if (!auth) throw new Error('Firebase not initialized. Please check your environment variables.');
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    if (!auth) throw new Error('Firebase not initialized. Please check your environment variables.');
    return signOut(auth);
  }

  function signInWithGoogle() {
    if (!auth || !googleProvider) throw new Error('Firebase not initialized. Please check your environment variables.');
    return signInWithPopup(auth, googleProvider);
  }

  function signInWithFacebook() {
    if (!auth || !facebookProvider) throw new Error('Firebase not initialized. Please check your environment variables.');
    return signInWithPopup(auth, facebookProvider);
  }

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    signInWithGoogle,
    signInWithFacebook,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 
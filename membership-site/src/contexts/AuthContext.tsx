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
import { auth, googleProvider, facebookProvider, appleProvider, startAppleSignIn, handleAppleRedirectResult } from '@/lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<UserCredential>;
  signup: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<UserCredential>;
  signInWithFacebook: () => Promise<UserCredential>;
  signInWithApple: () => Promise<void>;
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

  function signInWithApple() {
    if (!auth || !appleProvider) throw new Error('Firebase not initialized. Please check your environment variables.');
    return startAppleSignIn();
  }

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    // Only handle Apple redirect result if we're on a page that might have one
    const handleRedirectResult = async () => {
      try {
        const result = await handleAppleRedirectResult();
        if (result) {
          console.log('Apple redirect result handled successfully');
        }
      } catch (error) {
        console.error('Error handling Apple redirect result:', error);
      }
    };

    // Only check for redirect result on login page or when URL has auth parameters
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const hasAuthParams = url.searchParams.has('apiKey') || url.searchParams.has('authType');
      if (hasAuthParams || url.pathname === '/login') {
        handleRedirectResult();
      }
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
    signInWithApple,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 
'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  getRedirectResult,
  linkWithCredential,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import {
  clearPendingCredential,
  createProvider,
  credentialFromError,
  loadPendingCredential,
  savePendingCredential,
  usesRedirect,
  type PendingLink,
  type SocialProviderId,
} from '@/lib/authProviders';
import { authErrorCode } from '@/lib/authErrors';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  signup: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  signInWithProvider: (id: SocialProviderId) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  // Set when a social sign-in hit an email that already belongs to another sign-in method.
  pendingLink: PendingLink | null;
  redirectError: unknown;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function requireAuth() {
  if (!auth) throw new Error('Firebase not initialized. Please check your environment variables.');
  return auth;
}

// Create user profile in Firestore
const createUserProfile = async (user: User) => {
  if (!db) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    // Only create profile if it doesn't exist
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        emailVerified: user.emailVerified,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
};

const linkPendingCredential = async (user: User) => {
  const credential = loadPendingCredential();
  if (!credential) return;
  try {
    await linkWithCredential(user, credential);
  } catch (error) {
    console.error('Could not link pending sign-in method:', error);
  } finally {
    clearPendingCredential();
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingLink, setPendingLink] = useState<PendingLink | null>(null);
  const [redirectError, setRedirectError] = useState<unknown>(null);
  const [, setUserVersion] = useState(0);

  const handleSocialError = useCallback((error: unknown) => {
    if (authErrorCode(error) === 'auth/account-exists-with-different-credential') {
      const firebaseError = error as FirebaseError;
      const credential = credentialFromError(firebaseError);
      const email = (firebaseError.customData?.email as string | undefined) ?? null;
      setPendingLink(
        credential
          ? savePendingCredential(credential, email)
          : { email, providerLabel: 'this sign-in method' },
      );
    }
    throw error;
  }, []);

  function signup(email: string, password: string) {
    return createUserWithEmailAndPassword(requireAuth(), email, password).then(async (result) => {
      await sendEmailVerification(result.user).catch((error) => {
        console.error('Could not send verification email:', error);
      });
      return result;
    });
  }

  function login(email: string, password: string) {
    return signInWithEmailAndPassword(requireAuth(), email, password);
  }

  function logout() {
    return signOut(requireAuth());
  }

  async function signInWithProvider(id: SocialProviderId) {
    const firebaseAuth = requireAuth();
    const provider = createProvider(id);
    try {
      if (usesRedirect(id)) {
        await signInWithRedirect(firebaseAuth, provider);
      } else {
        await signInWithPopup(firebaseAuth, provider);
      }
    } catch (error) {
      handleSocialError(error);
    }
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(requireAuth(), email);
  }

  async function refreshUser() {
    await auth?.currentUser?.reload();
    setCurrentUser(auth?.currentUser ?? null);
    setUserVersion((version) => version + 1);
  }

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    getRedirectResult(auth).catch((error) => {
      try {
        handleSocialError(error);
      } catch {
        if (authErrorCode(error) !== 'auth/account-exists-with-different-credential') {
          setRedirectError(error);
        }
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        await createUserProfile(user);
        await linkPendingCredential(user);
        setPendingLink(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [handleSocialError]);

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    signInWithProvider,
    resetPassword,
    refreshUser,
    pendingLink,
    redirectError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

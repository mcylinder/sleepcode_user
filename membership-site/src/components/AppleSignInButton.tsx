'use client';

import { useEffect, useRef, useState } from 'react';
import { getAuth, signInWithCredential, OAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

declare global {
  interface Window {
    AppleID: {
      auth: {
        init: (config: any) => void;
        signIn: () => Promise<any>;
      };
    };
  }
}

interface AppleSignInButtonProps {
  onSuccess: (user: any) => void;
  onError: (error: any) => void;
  onLoadingChange: (loading: boolean) => void;
}

export default function AppleSignInButton({ onSuccess, onError, onLoadingChange }: AppleSignInButtonProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const nonceRef = useRef<string>('');

  // Generate nonce function
  const generateNonce = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Hash nonce function using Web Crypto API
  const hashNonce = async (nonce: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(nonce);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  useEffect(() => {
    // Load Apple's JavaScript SDK
    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    script.onload = async () => {
      await initializeAppleSignIn();
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const initializeAppleSignIn = async () => {
    if (typeof window.AppleID === 'undefined') {
      console.error('Apple ID SDK not loaded');
      return;
    }

    try {
      // Generate nonce for this session
      const unhashedNonce = generateNonce(10);
      const hashedNonce = await hashNonce(unhashedNonce);
      nonceRef.current = unhashedNonce;

      // Initialize Apple Sign-In
      window.AppleID.auth.init({
        clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || 'com.sleepcoding.web',
        scope: 'name email',
        redirectURI: `${window.location.origin}/api/apple-auth/callback`,
        state: 'apple-signin',
        nonce: hashedNonce
      });

      setIsInitialized(true);
      console.log('Apple Sign-In initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Apple Sign-In:', error);
      onError(error);
    }
  };

  const handleAppleSignIn = async () => {
    if (!isInitialized || !auth) {
      onError(new Error('Apple Sign-In not initialized or Firebase not available'));
      return;
    }

    try {
      onLoadingChange(true);
      console.log('Starting Apple Sign-In...');

      // Trigger Apple Sign-In
      const response = await window.AppleID.auth.signIn();
      console.log('Apple Sign-In response:', response);

      // Create Firebase credential
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({
        idToken: response.authorization.id_token,
        rawNonce: nonceRef.current,
      });

      // Sign in with Firebase
      const result = await signInWithCredential(auth, credential);
      console.log('Firebase sign-in successful:', result);
      
      onSuccess(result.user);
    } catch (error) {
      console.error('Apple Sign-In error:', error);
      onError(error);
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <button
      onClick={handleAppleSignIn}
      disabled={!isInitialized}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isInitialized ? 'Sign in with Apple' : 'Loading Apple Sign-In...'}
    </button>
  );
} 
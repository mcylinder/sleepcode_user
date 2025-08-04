'use client';

import { useState, useEffect, useCallback } from 'react';

interface AppleSignInButtonProps {
  onSuccess: (user: unknown) => void;
  onError: (error: unknown) => void;
  onLoadingChange: (loading: boolean) => void;
}

interface AppleIDConfig {
  clientId: string;
  scope: string;
  redirectURI: string;
  state: string;
  nonce: string;
}

interface AppleIDResponse {
  authorization: {
    id_token: string;
    code: string;
    state: string;
  };
}

declare global {
  interface Window {
    AppleID: {
      auth: {
        init: (config: AppleIDConfig) => void;
        signIn: () => Promise<AppleIDResponse>;
      };
    };
  }
}

export default function AppleSignInButton({ onSuccess, onError, onLoadingChange }: AppleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Apple Sign-In
  const initializeAppleSignIn = useCallback(async () => {
    try {
      // Get nonce from our backend
      const nonceResponse = await fetch('/api/apple-auth/nonce');
      const { hashedNonce, rawNonce } = await nonceResponse.json();

      // Load Apple's JavaScript SDK
      const script = document.createElement('script');
      script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
      script.onload = () => {
        // Initialize Apple Sign-In with Firebase-recommended configuration
        window.AppleID.auth.init({
          clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || 'sleepcoding.web.auth',
          scope: 'name email',
          redirectURI: 'https://sleepcodingbase.firebaseapp.com/__/auth/handler',
          state: '[STATE]', // Optional value that Apple will send back
          nonce: hashedNonce // The hashed nonce from our backend
        });
        setIsInitialized(true);
      };
      document.head.appendChild(script);

      // Store raw nonce for later use
      (window as { __APPLE_RAW_NONCE__?: string }).__APPLE_RAW_NONCE__ = rawNonce;
    } catch (error) {
      console.error('Failed to initialize Apple Sign-In:', error);
      onError(error);
    }
  }, [onError]);

  useEffect(() => {
    initializeAppleSignIn();
  }, [initializeAppleSignIn]);

  const handleAppleSignIn = async () => {
    if (isLoading || !isInitialized) return;

    try {
      setIsLoading(true);
      onLoadingChange(true);

      console.log('Starting Apple Sign-In with official SDK...');

      // Use Apple's official SDK to sign in
      const response = await window.AppleID.auth.signIn();

      console.log('Apple Sign-In response:', response);

      // Send the response to our backend for processing
      const backendResponse = await fetch('/api/apple-auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: response.authorization.id_token,
          code: response.authorization.code,
          state: response.authorization.state,
          rawNonce: (window as { __APPLE_RAW_NONCE__?: string }).__APPLE_RAW_NONCE__
        })
      });

      if (!backendResponse.ok) {
        throw new Error(`Backend error: ${backendResponse.status}`);
      }

      const userData = await backendResponse.json();
      console.log('Backend processed Apple Sign-In:', userData);

      onSuccess(userData);
    } catch (error) {
      console.error('Apple Sign-In failed:', error);
      
      // Filter out user cancellation errors
      if (error instanceof Error && error.message.includes('popup_closed')) {
        console.log('User cancelled Apple Sign-In');
        return;
      }
      
      onError(error);
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  };

  return (
    <button
      onClick={handleAppleSignIn}
      disabled={isLoading || !isInitialized}
      className="w-full flex items-center justify-center gap-3 bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M18.71 19.5c-.83 1.24-2.04 2.5-3.5 2.5-1.4 0-1.8-.8-3.5-.8-1.7 0-2.1.8-3.5.8-1.46 0-2.67-1.26-3.5-2.5C4.04 17.76 3 15.49 3 13.5c0-3.5 2.5-5.5 5-5.5 1.4 0 2.5.8 3.5.8 1 0 2.1-.8 3.5-.8 2.5 0 5 2 5 5.5 0 1.99-1.04 4.26-2.29 6z"
          />
          <path
            fill="currentColor"
            d="M13 3.5c.8-1.1 2.04-2.5 3.5-2.5 1.4 0 2.5.8 3.5.8 1 0 2.1-.8 3.5-.8 2.5 0 5 2 5 5.5 0 1.99-1.04 4.26-2.29 6-.83 1.24-2.04 2.5-3.5 2.5-1.4 0-1.8-.8-3.5-.8-1.7 0-2.1.8-3.5.8-1.46 0-2.67-1.26-3.5-2.5C4.04 17.76 3 15.49 3 13.5c0-3.5 2.5-5.5 5-5.5 1.4 0 2.5.8 3.5.8 1 0 2.1-.8 3.5-.8 2.5 0 5 2 5 5.5 0 1.99-1.04 4.26-2.29 6z"
          />
        </svg>
      )}
      {isLoading ? 'Signing in...' : 'Sign in with Apple'}
    </button>
  );
} 
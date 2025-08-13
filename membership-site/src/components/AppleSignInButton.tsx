'use client';

import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';

interface AppleSignInButtonProps {
  onError: (error: unknown) => void;
  onLoadingChange: (loading: boolean) => void;
}

// Generate a random nonce for Apple Sign-In
const generateNonce = (length: number): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

// SHA256 hash function for nonce
const sha256 = async (message: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export default function AppleSignInButton({ onError, onLoadingChange }: AppleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [appleIdInitialized, setAppleIdInitialized] = useState(false);

  useEffect(() => {
    // Check if Apple SDK is already loaded
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && (window as any).AppleID) {
      console.log('Apple Sign-In SDK already loaded');
      setAppleIdInitialized(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="appleid.auth.js"]');
    if (existingScript) {
      console.log('Apple Sign-In SDK script already exists');
      return;
    }

    // Load Apple's JavaScript SDK
    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    script.onload = () => {
      console.log('Apple Sign-In SDK loaded');
      setAppleIdInitialized(true);
    };
    script.onerror = () => {
      console.error('Failed to load Apple Sign-In SDK');
      onError(new Error('Failed to load Apple Sign-In SDK'));
    };
    document.head.appendChild(script);
  }, [onError]);

  const handleAppleSignIn = async () => {
    if (isLoading || !auth || !appleIdInitialized) {
      console.log('Apple Sign-In blocked:', { isLoading, hasAuth: !!auth, appleIdInitialized });
      return;
    }

    try {
      setIsLoading(true);
      onLoadingChange(true);

      console.log('Starting Apple Sign-In with Firebase...');

      // Generate nonce
      const unhashedNonce = generateNonce(10);
      const hashedNonce = await sha256(unhashedNonce);

      console.log('Generated nonce:', { unhashedNonce, hashedNonce });

      // Initialize Apple Sign-In
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== 'undefined' && (window as any).AppleID) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).AppleID.auth.init({
          clientId: 'RGGU95UTDS.me.sleepcoding', // Your Apple Service ID
          scope: 'name email',
          redirectURI: 'https://sleepcoding.me/_/auth/handler',
          state: 'state',
          nonce: hashedNonce
        });

        console.log('Apple Sign-In initialized');

        // Sign in with Apple - this will redirect to Apple's auth page
        console.log('Redirecting to Apple Sign-In...');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).AppleID.auth.signIn();
        
        // Note: The code below won't execute immediately because of the redirect
        // We need to handle the response after the redirect back from Apple
        console.log('This code will execute after redirect back from Apple');
      } else {
        throw new Error('Apple Sign-In SDK not available');
      }
    } catch (error) {
      console.error('Apple Sign-In failed:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code: (error as any)?.code || 'No code',
        stack: error instanceof Error ? error.stack : 'No stack'
      });
      
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
      disabled={isLoading || !auth || !appleIdInitialized}
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
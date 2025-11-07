'use client';

import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { signInWithRedirect, getRedirectResult, OAuthProvider } from 'firebase/auth';

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
  
  useEffect(() => {
    // If we used redirect, finalize the flow here and surface any errors
    if (auth) {
      getRedirectResult(auth)
        .then((result) => {
          if (result) {
            console.log('Apple Sign-In redirect result user:', result.user);
          }
        })
        .catch((error) => {
          console.error('Error getting Apple redirect result:', error);
          onError(error);
        });
    }
  }, [onError]);

  const handleAppleSignIn = async () => {
    if (isLoading || !auth) {
      console.log('Apple Sign-In blocked:', { isLoading, hasAuth: !!auth });
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

      // Create a new provider instance for this attempt and let Firebase manage state
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      provider.setCustomParameters({ nonce: hashedNonce });

      // Apple popup frequently closes immediately due to platform/browser
      // restrictions. Use redirect for reliability.
      await signInWithRedirect(auth, provider);
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
      disabled={isLoading || !auth}
      className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
      ) : (
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-2.04 2.5-3.5 2.5-1.4 0-1.8-.8-3.5-.8-1.7 0-2.1.8-3.5.8-1.46 0-2.67-1.26-3.5-2.5C4.04 17.76 3 15.49 3 13.5c0-3.5 2.5-5.5 5-5.5 1.4 0 2.5.8 3.5.8 1 0 2.1-.8 3.5-.8 2.5 0 5 2 5 5.5 0 1.99-1.04 4.26-2.29 6z"/>
        </svg>
      )}
      {isLoading ? 'Signing in...' : 'Continue with Apple'}
    </button>
  );
} 
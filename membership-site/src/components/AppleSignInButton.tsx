'use client';

import { useState, useEffect } from 'react';
import { auth, appleProvider } from '../lib/firebase';
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';

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
    // Handle redirect result on page load
    if (auth) {
      getRedirectResult(auth).catch((error) => {
        console.error('Error getting redirect result:', error);
        onError(error);
      });
    }
  }, [onError]);

  const handleAppleSignIn = async () => {
    if (isLoading || !auth || !appleProvider) {
      console.log('Apple Sign-In blocked:', { isLoading, hasAuth: !!auth, hasAppleProvider: !!appleProvider });
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

      // Configure Apple provider with scopes and nonce
      appleProvider.addScope('email');
      appleProvider.addScope('name');
      appleProvider.setCustomParameters({ nonce: hashedNonce });

      console.log('Apple provider configured, redirecting...');
      
      // Sign in with redirect - Firebase handles the state and callback
      await signInWithRedirect(auth, appleProvider);
      
      // Note: The code below won't execute immediately because of the redirect
      // The redirect result will be handled in the useEffect above
      console.log('Redirect initiated to Apple Sign-In');
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
      disabled={isLoading || !auth || !appleProvider}
      className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
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
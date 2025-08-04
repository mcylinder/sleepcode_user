'use client';

import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, appleProvider } from '../lib/firebase';

interface AppleSignInButtonProps {
  onSuccess: (user: unknown) => void;
  onError: (error: unknown) => void;
  onLoadingChange: (loading: boolean) => void;
}

export default function AppleSignInButton({ onSuccess, onError, onLoadingChange }: AppleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAppleSignIn = async () => {
    if (isLoading || !appleProvider || !auth) return;

    try {
      setIsLoading(true);
      onLoadingChange(true);

      console.log('Starting Apple Sign-In with Firebase...');

      // Use Firebase's built-in Apple provider
      appleProvider.addScope('name');
      appleProvider.addScope('email');

      const result = await signInWithPopup(auth, appleProvider);
      
      console.log('Apple Sign-In successful:', result);
      onSuccess(result.user);
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
      disabled={isLoading || !appleProvider || !auth}
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
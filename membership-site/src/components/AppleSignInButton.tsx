'use client';

import { useState } from 'react';
import { startAppleSignIn } from '@/lib/firebase';

interface AppleSignInButtonProps {
  onSuccess: (user: unknown) => void;
  onError: (error: unknown) => void;
  onLoadingChange: (loading: boolean) => void;
}

export default function AppleSignInButton({ onSuccess, onError, onLoadingChange }: AppleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAppleSignIn = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      onLoadingChange(true);

      console.log('Starting Apple Sign-In with Firebase...');

      // Use the existing Apple Sign-In function
      await startAppleSignIn();
      
      // Note: The redirect will happen, so we won't reach this point
      // The success will be handled by the redirect result handler
    } catch (error) {
      console.error('Apple Sign-In error:', error);
      
      // Only show error if it's not a user cancellation
      const errorCode = (error as { code?: string })?.code;
      if (errorCode !== 'auth/popup-closed-by-user' && errorCode !== 'auth/cancelled-popup-request') {
        onError(error);
      }
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  };



  return (
    <button
      onClick={handleAppleSignIn}
      disabled={isLoading}
      className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
    >
      <span className="mr-2">🍎</span>
      Continue with Apple
    </button>
  );
} 
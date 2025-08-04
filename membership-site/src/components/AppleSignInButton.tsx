'use client';

import { useState } from 'react';
import { signInWithPopup, OAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AppleSignInButtonProps {
  onSuccess: (user: unknown) => void;
  onError: (error: unknown) => void;
  onLoadingChange: (loading: boolean) => void;
}

export default function AppleSignInButton({ onSuccess, onError, onLoadingChange }: AppleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Generate cryptographically secure nonce
  const generateNonce = (length: number = 32): string => {
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  };

  // SHA256 hash function
  const sha256 = async (input: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleAppleSignIn = async () => {
    if (isLoading || !auth) return;

    try {
      setIsLoading(true);
      onLoadingChange(true);

      // Generate nonce for this session
      const rawNonce = generateNonce(32);
      const hashedNonce = await sha256(rawNonce);

      console.log('Starting Apple Sign-In with proper nonce handling...');

      // Create Apple OAuth provider with proper configuration
      const provider = new OAuthProvider('apple.com');
      
      // Set custom parameters as per Firebase docs
      provider.setCustomParameters({
        nonce: hashedNonce
      });

      // Use popup for better UX (no redirect issues)
      const result = await signInWithPopup(auth, provider);

      console.log('Apple Sign-In successful:', result);
      onSuccess(result.user);
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
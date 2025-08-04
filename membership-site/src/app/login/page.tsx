'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppleSignInButton from '@/components/AppleSignInButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup, signInWithGoogle, signInWithFacebook, currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
              router.push('/sessions');
    }
  }, [currentUser, router]);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError('Failed to ' + (isSignUp ? 'create account' : 'log in') + ': ' + errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError('Failed to sign in with Google: ' + errorMessage);
      setLoading(false);
    }
  }

  async function handleFacebookSignIn() {
    try {
      setError('');
      setLoading(true);
      await signInWithFacebook();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError('Failed to sign in with Facebook: ' + errorMessage);
      setLoading(false);
    }
  }

  const handleAppleSignInSuccess = (user: unknown) => {
    console.log('Apple Sign-In successful:', user);
    // The user will be automatically redirected by the useEffect that watches currentUser
  };

  const handleAppleSignInError = (error: unknown) => {
    console.error('Apple Sign-In error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    setError('Failed to sign in with Apple: ' + errorMessage);
    setLoading(false);
  };

  const handleAppleSignInLoading = (loading: boolean) => {
    setLoading(loading);
    // Clear any existing error when starting Apple Sign-In
    if (loading) {
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {isSignUp ? 'Create your account' : 'Sign in to your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3">
              {error}
            </div>
          )}

          {/* Social Sign-in Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="mr-2">G</span>
              Continue with Google
            </button>

            <button
              onClick={handleFacebookSignIn}
              disabled={loading}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="mr-2">f</span>
              Continue with Facebook
            </button>

            <AppleSignInButton
              onSuccess={handleAppleSignInSuccess}
              onError={handleAppleSignInError}
              onLoadingChange={handleAppleSignInLoading}
            />
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <form onSubmit={handleEmailSubmit} className="mt-6 space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field mt-1"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field mt-1"
                  placeholder="Enter your password"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={loading}
                className="text-sm text-cyan-700 hover:text-cyan-700 disabled:opacity-50"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
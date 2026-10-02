'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProviderIcon from '@/components/ProviderIcon';
import { SOCIAL_PROVIDERS, type SocialProviderId } from '@/lib/authProviders';
import { authErrorCode, authErrorMessage } from '@/lib/authErrors';

type Mode = 'signin' | 'signup' | 'reset';

const DEFAULT_DESTINATION = '/application';

function safeNext(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return DEFAULT_DESTINATION;
  return value;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<Mode>('signin');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [next, setNext] = useState(DEFAULT_DESTINATION);

  const { login, signup, signInWithProvider, resetPassword, currentUser, pendingLink, redirectError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNext(safeNext(params.get('next')));
    if (params.get('mode') === 'signup') setMode('signup');
  }, []);

  useEffect(() => {
    if (currentUser) {
      router.replace(next);
    }
  }, [currentUser, next, router]);

  useEffect(() => {
    if (redirectError) setError(authErrorMessage(redirectError) ?? '');
  }, [redirectError]);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError('');
    setNotice('');
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNotice('');

    if (mode === 'reset') {
      try {
        setLoading(true);
        await resetPassword(email);
        setNotice(`If an account exists for ${email}, a password reset link is on its way. Check your inbox.`);
      } catch (err) {
        setError(authErrorMessage(err) ?? '');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setLoading(true);
      if (mode === 'signup') {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(authErrorMessage(err) ?? '');
    } finally {
      setLoading(false);
    }
  }

  async function handleProviderSignIn(id: SocialProviderId) {
    try {
      setError('');
      setNotice('');
      setLoading(true);
      await signInWithProvider(id);
    } catch (err) {
      if (authErrorCode(err) === 'auth/account-exists-with-different-credential') return;
      setError(authErrorMessage(err) ?? '');
    } finally {
      setLoading(false);
    }
  }

  const heading = mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : 'Sign in to your account';

  return (
    <div className="min-h-screen bg-[#fcf0e8] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">{heading}</h2>
        {mode === 'signup' && (
          <p className="mt-2 text-center text-sm text-gray-600">Free accounts include our free sessions. Upgrade anytime.</p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:px-10 rounded-lg">
          {pendingLink && (
            <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 text-sm">
              {pendingLink.email ? <strong>{pendingLink.email}</strong> : 'That email'} already has a SleepCoding account
              that uses a different sign-in method. Sign in the way you did before, and {pendingLink.providerLabel} will be
              connected to your account automatically.
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>
          )}

          {notice && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 text-sm">{notice}</div>
          )}

          {mode !== 'reset' && (
            <>
              <div className="space-y-3">
                {SOCIAL_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderSignIn(provider.id)}
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ProviderIcon id={provider.id} />
                    Continue with {provider.label}
                  </button>
                ))}
              </div>

              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 text-gray-500 bg-white">Or use your email</span>
                </div>
              </div>
            </>
          )}

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

            {mode !== 'reset' && (
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => switchMode('reset')}
                      className="text-sm text-cyan-700 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field mt-1"
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                />
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
              {loading
                ? 'Loading...'
                : mode === 'signup'
                  ? 'Create Account'
                  : mode === 'reset'
                    ? 'Send reset link'
                    : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            {mode === 'reset' ? (
              <button onClick={() => switchMode('signin')} disabled={loading} className="text-sm text-cyan-700 hover:underline disabled:opacity-50">
                Back to sign in
              </button>
            ) : (
              <button
                onClick={() => switchMode(mode === 'signup' ? 'signin' : 'signup')}
                disabled={loading}
                className="text-sm text-cyan-700 hover:underline disabled:opacity-50"
              >
                {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

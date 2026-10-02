'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProviderIcon from '@/components/ProviderIcon';
import BackHeader from '@/components/ui/BackHeader';
import StatusText from '@/components/ui/StatusText';
import { ChevronRight } from '@/components/ui/icons';
import SiteFooter from '@/components/site/SiteFooter';
import { SOCIAL_PROVIDERS, type SocialProviderId } from '@/lib/authProviders';
import { authErrorCode, authErrorMessage } from '@/lib/authErrors';

type Mode = 'signin' | 'signup' | 'reset';

const DEFAULT_DESTINATION = '/application';

const HEADINGS: Record<Mode, { title: string; sub: string }> = {
  signin: { title: 'Welcome back.', sub: 'Log in to pick up where you left off.' },
  signup: { title: 'Create your account.', sub: 'Free accounts include the free sessions. No card needed.' },
  reset: { title: 'Reset your password.', sub: 'We\u2019ll email you a link to choose a new one.' },
};

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

  const heading = HEADINGS[mode];

  return (
    <div className="sc-frame">
      <BackHeader href="/" />

      <main className="mx-auto w-full max-w-[400px] flex-1 px-[30px] pt-10 wide:pt-[60px]">
        <div className="sc-eyebrow--muted">{mode === 'signup' ? 'Sign Up' : mode === 'reset' ? 'Password' : 'Log In'}</div>
        <h1 className="mt-[6px] text-[22px] font-semibold wide:text-[26px]">{heading.title}</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">{heading.sub}</p>

        <div className="mt-6 flex flex-col gap-3">
          {pendingLink && (
            <p className="text-[13px] leading-relaxed text-fg-muted">
              <span className="text-fg">{pendingLink.email ?? 'That email'}</span> already has a SleepCode account that
              uses a different sign-in method. Sign in the way you did before, and {pendingLink.providerLabel} will be
              connected automatically.
            </p>
          )}
          <StatusText status={error ? { type: 'error', text: error } : null} />
          <StatusText status={notice ? { type: 'success', text: notice } : null} />
        </div>

        {mode !== 'reset' && (
          <>
            <div className="mt-4 border-t border-line">
              {SOCIAL_PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleProviderSignIn(provider.id)}
                  disabled={loading}
                  className="sc-row sc-row--between w-full text-left text-[15px] font-medium disabled:opacity-50"
                >
                  <span className="flex items-center gap-3">
                    <ProviderIcon id={provider.id} className="h-4 w-4 text-fg" />
                    Continue with {provider.label}
                  </span>
                  <ChevronRight />
                </button>
              ))}
            </div>
            <div className="sc-eyebrow--muted mt-8">Or use your email</div>
          </>
        )}

        <form onSubmit={handleEmailSubmit} className="mt-4 flex flex-col gap-5">
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sc-input"
              placeholder="Email address"
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="sc-input"
                placeholder={mode === 'signup' ? 'Password (at least 6 characters)' : 'Password'}
              />
              {mode === 'signin' && (
                <button type="button" onClick={() => switchMode('reset')} className="sc-textbtn sc-textbtn--muted mt-3 text-[12px]">
                  Forgot password?
                </button>
              )}
            </div>
          )}

          <button type="submit" disabled={loading} className="sc-cta mt-2 w-full">
            {loading
              ? 'One moment\u2026'
              : mode === 'signup'
                ? 'Create Account'
                : mode === 'reset'
                  ? 'Send Reset Link'
                  : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center text-[13px] text-fg-muted">
          {mode === 'reset' ? (
            <button onClick={() => switchMode('signin')} disabled={loading} className="sc-textbtn">
              Back to log in
            </button>
          ) : mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <button onClick={() => switchMode('signin')} disabled={loading} className="sc-textbtn">Log in</button>
            </>
          ) : (
            <>
              New to SleepCode?{' '}
              <button onClick={() => switchMode('signup')} disabled={loading} className="sc-textbtn">Create an account</button>
            </>
          )}
        </div>
      </main>

      <SiteFooter compact />
    </div>
  );
}

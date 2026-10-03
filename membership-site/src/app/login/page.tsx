'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProviderIcon from '@/components/ProviderIcon';
import Logo from '@/components/ui/Logo';
import StatusText from '@/components/ui/StatusText';
import { ChevronRight } from '@/components/ui/icons';
import SiteFooter from '@/components/site/SiteFooter';
import { FEATURED_FREE_SESSION } from '@/lib/catalog';
import { SOCIAL_PROVIDERS, type SocialProviderId } from '@/lib/authProviders';
import { authErrorCode, authErrorMessage } from '@/lib/authErrors';

type Mode = 'signin' | 'signup' | 'reset';

const DEFAULT_DESTINATION = '/application';

const HEADINGS: Record<Mode, { title: string; sub: string }> = {
  signin: { title: 'Welcome back.', sub: 'Log in to pick up where you left off.' },
  signup: { title: 'Create your account.', sub: `A free account includes ${FEATURED_FREE_SESSION?.title ?? 'the free session'}. No card needed.` },
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
  const [formError, setFormError] = useState('');
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
    setFormError('');
    setNotice('');
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setFormError('');
    setNotice('');

    if (mode === 'reset') {
      try {
        setLoading(true);
        await resetPassword(email);
        setNotice(`If an account exists for ${email}, a password reset link is on its way. Check your inbox.`);
      } catch (err) {
        setFormError(authErrorMessage(err) ?? '');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (password.length < 6) {
      return setFormError('Password must be at least 6 characters');
    }

    try {
      setLoading(true);
      if (mode === 'signup') {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setFormError(authErrorMessage(err) ?? '');
    } finally {
      setLoading(false);
    }
  }

  async function handleProviderSignIn(id: SocialProviderId) {
    try {
      setError('');
      setFormError('');
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
      <header className="sc-px py-[22px]">
        <Logo />
      </header>

      <main className="mx-auto w-full max-w-[460px] flex-1 px-[var(--pad-x)] pb-[var(--pad-section)] pt-[clamp(20px,4vw,56px)]">
        <div className="sc-eyebrow">{mode === 'signup' ? 'Sign up' : mode === 'reset' ? 'Password' : 'Log in'}</div>
        <h1 className="sc-h-app mt-[14px]">{heading.title}</h1>
        <p className="mt-3 text-[17px] leading-[1.6] text-ink-muted">{heading.sub}</p>

        <div className="mt-6 flex flex-col gap-3">
          {pendingLink && (
            <p className="text-[15px] leading-[1.6] text-ink-muted">
              <span className="text-ink">{pendingLink.email ?? 'That email'}</span> already has a SleepCode account that
              uses a different sign-in method. Sign in the way you did before, and {pendingLink.providerLabel} will be
              connected automatically.
            </p>
          )}
          <StatusText status={error ? { type: 'error', text: error } : null} />
          <StatusText status={notice ? { type: 'success', text: notice } : null} />
        </div>

        {mode !== 'reset' && (
          <>
            <div className="mt-4 border-b border-hairline">
              {SOCIAL_PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleProviderSignIn(provider.id)}
                  disabled={loading}
                  className="sc-row sc-row--between min-h-[52px] w-full text-left text-[16px] font-medium disabled:opacity-50"
                >
                  <span className="flex items-center gap-3">
                    <ProviderIcon id={provider.id} className="h-4 w-4 text-ink" />
                    Continue with {provider.label}
                  </span>
                  <ChevronRight className="text-ink-muted" />
                </button>
              ))}
            </div>
            <div className="sc-eyebrow sc-eyebrow--muted mt-8">Or use your email</div>
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
                <button type="button" onClick={() => switchMode('reset')} className="sc-textbtn sc-textbtn--muted mt-3 min-h-[44px] text-[14px]">
                  Forgot password?
                </button>
              )}
            </div>
          )}

          <StatusText status={formError ? { type: 'error', text: formError } : null} />

          <button type="submit" disabled={loading} className="sc-btn mt-2 min-h-[48px] w-full">
            {loading
              ? 'One moment\u2026'
              : mode === 'signup'
                ? 'Create account'
                : mode === 'reset'
                  ? 'Send reset link'
                  : 'Log in'}
          </button>
        </form>

        <div className="mt-6 text-center text-[15px] text-ink-muted">
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

'use client';

import { useCallback, useRef, useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, reauthenticateWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createProvider, SOCIAL_PROVIDERS, type SocialProviderId } from '@/lib/authProviders';
import { authErrorCode, authErrorMessage } from '@/lib/authErrors';
import ProviderIcon from '@/components/ProviderIcon';

export class ReauthCancelled extends Error {
  constructor() {
    super('Sign-in cancelled');
  }
}

interface Pending {
  resolve: () => void;
  reject: (error: Error) => void;
}

// Firebase requires a recent sign-in before sensitive changes. `withRecentLogin` runs an action,
// and if Firebase rejects it for that reason, asks the user to sign in again and retries once.
export function useReauth() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef<Pending | null>(null);

  const reauthenticate = useCallback(() => {
    setPassword('');
    setError('');
    setOpen(true);
    return new Promise<void>((resolve, reject) => {
      pending.current = { resolve, reject };
    });
  }, []);

  const withRecentLogin = useCallback(
    async <T,>(action: () => Promise<T>): Promise<T> => {
      try {
        return await action();
      } catch (err) {
        if (authErrorCode(err) !== 'auth/requires-recent-login') throw err;
        await reauthenticate();
        return action();
      }
    },
    [reauthenticate],
  );

  function finish(success: boolean) {
    setOpen(false);
    if (success) pending.current?.resolve();
    else pending.current?.reject(new ReauthCancelled());
    pending.current = null;
  }

  async function run(step: () => Promise<unknown>) {
    try {
      setBusy(true);
      setError('');
      await step();
      finish(true);
    } catch (err) {
      setError(authErrorMessage(err) ?? '');
    } finally {
      setBusy(false);
    }
  }

  const user = auth?.currentUser ?? null;
  const providerIds = user?.providerData.map((p) => p.providerId) ?? [];
  const hasPassword = providerIds.includes('password');
  const socials = SOCIAL_PROVIDERS.filter((p) => providerIds.includes(p.id));

  const dialog = open && user ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-xl p-6">
        <h3 className="text-lg font-medium text-gray-900">Confirm it&apos;s you</h3>
        <p className="mt-1 text-sm text-gray-600">For your security, please sign in again to continue.</p>

        {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>}

        {hasPassword && user.email && (
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email!, password)));
            }}
          >
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Your password"
            />
            <button type="submit" disabled={busy} className="w-full btn-primary disabled:opacity-50">
              {busy ? 'Checking...' : 'Continue'}
            </button>
          </form>
        )}

        {socials.length > 0 && (
          <div className="mt-4 space-y-2">
            {socials.map((provider) => (
              <button
                key={provider.id}
                disabled={busy}
                onClick={() => run(() => reauthenticateWithPopup(user, createProvider(provider.id as SocialProviderId)))}
                className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <ProviderIcon id={provider.id} />
                Continue with {provider.label}
              </button>
            ))}
          </div>
        )}

        <button onClick={() => finish(false)} disabled={busy} className="mt-4 w-full text-sm text-gray-600 hover:text-gray-900">
          Cancel
        </button>
      </div>
    </div>
  ) : null;

  return { reauthenticate, withRecentLogin, dialog };
}

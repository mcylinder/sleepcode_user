'use client';

import { useCallback, useRef, useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, reauthenticateWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createProvider, SOCIAL_PROVIDERS, type SocialProviderId } from '@/lib/authProviders';
import { authErrorCode, authErrorMessage } from '@/lib/authErrors';
import ProviderIcon from '@/components/ProviderIcon';
import Sheet from '@/components/ui/Sheet';
import StatusText from '@/components/ui/StatusText';

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

  const dialog = user ? (
    <Sheet open={open} onClose={() => !busy && finish(false)} label="Confirm it's you">
      <div className="text-center">
        <div className="sc-eyebrow--muted">Security</div>
        <div className="mt-2 text-[19px] font-semibold">Confirm it&apos;s you</div>
        <p className="mt-2 text-[13px] text-fg-muted">For your security, please sign in again to continue.</p>
      </div>

      <StatusText status={error ? { type: 'error', text: error } : null} className="text-center" />

      {hasPassword && user.email && (
        <form
          className="flex flex-col gap-5"
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
            className="sc-input"
            placeholder="Your password"
            aria-label="Your password"
            autoFocus
          />
          <button type="submit" disabled={busy} className="sc-cta-filled">
            {busy ? 'Checking\u2026' : 'Continue'}
          </button>
        </form>
      )}

      {socials.length > 0 && (
        <div className="border-t border-line">
          {socials.map((provider) => (
            <button
              key={provider.id}
              disabled={busy}
              onClick={() => run(() => reauthenticateWithPopup(user, createProvider(provider.id as SocialProviderId)))}
              className="sc-row flex w-full items-center gap-3 text-left text-[15px] font-medium disabled:opacity-50"
            >
              <ProviderIcon id={provider.id} className="h-4 w-4 text-fg" />
              Continue with {provider.label}
            </button>
          ))}
        </div>
      )}

      <button onClick={() => finish(false)} disabled={busy} className="sc-textbtn sc-textbtn--muted self-center">
        Cancel
      </button>
    </Sheet>
  ) : null;

  return { reauthenticate, withRecentLogin, dialog };
}

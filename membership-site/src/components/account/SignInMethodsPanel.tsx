'use client';

import { useEffect, useState } from 'react';
import { linkWithPopup, linkWithRedirect, unlink } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { authErrorMessage } from '@/lib/authErrors';
import { createProvider, SOCIAL_PROVIDERS, usesRedirect, type SocialProviderId } from '@/lib/authProviders';
import ProviderIcon from '@/components/ProviderIcon';
import StatusText, { type Status } from '@/components/ui/StatusText';
import { ReauthCancelled } from './useReauth';

export default function SignInMethodsPanel({
  withRecentLogin,
}: {
  withRecentLogin: <T>(action: () => Promise<T>) => Promise<T>;
}) {
  const { currentUser, refreshUser, redirectError } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    if (redirectError) setStatus({ type: 'error', text: authErrorMessage(redirectError) ?? 'Something went wrong.' });
  }, [redirectError]);

  if (!currentUser) return null;
  const user = currentUser;

  const linked = new Set(user.providerData.map((p) => p.providerId));
  const canDisconnect = linked.size > 1;

  async function run(key: string, action: () => Promise<string | null>) {
    try {
      setBusy(key);
      setStatus(null);
      const message = await action();
      await refreshUser();
      if (message) setStatus({ type: 'success', text: message });
    } catch (err) {
      if (err instanceof ReauthCancelled) return;
      const message = authErrorMessage(err);
      if (message) setStatus({ type: 'error', text: message });
    } finally {
      setBusy(null);
    }
  }

  const connect = (id: SocialProviderId, label: string) =>
    run(id, async () => {
      const provider = createProvider(id);
      if (usesRedirect(id)) {
        await linkWithRedirect(user, provider);
        return null;
      }
      await linkWithPopup(user, provider);
      return `${label} is now connected. You can use it to sign in.`;
    });

  const disconnect = (id: string, label: string) =>
    run(id, async () => {
      await withRecentLogin(() => unlink(user, id));
      return `${label} has been disconnected.`;
    });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] text-fg-muted">Connect more than one so you can always get back into your account.</p>
      <ul>
        <li className="flex items-center justify-between py-3">
          <span className="flex items-center gap-3 text-[14px]">
            <ProviderIcon id="password" className="h-4 w-4 text-fg-muted" />
            Email and password
          </span>
          <span className="text-[12px] text-fg-faint">{linked.has('password') ? 'Connected' : 'Set a password'}</span>
        </li>
        {SOCIAL_PROVIDERS.map((provider) => {
          const isLinked = linked.has(provider.id);
          return (
            <li key={provider.id} className="flex items-center justify-between py-3">
              <span className="flex items-center gap-3 text-[14px]">
                <ProviderIcon id={provider.id} className="h-4 w-4 text-fg" />
                {provider.label}
              </span>
              {isLinked ? (
                <span className="flex items-center gap-4 text-[12px]">
                  <span className="text-fg-faint">Connected</span>
                  {canDisconnect && (
                    <button
                      onClick={() => disconnect(provider.id, provider.label)}
                      disabled={busy !== null}
                      className="sc-textbtn sc-textbtn--muted text-[12px]"
                    >
                      {busy === provider.id ? 'Working\u2026' : 'Disconnect'}
                    </button>
                  )}
                </span>
              ) : (
                <button
                  onClick={() => connect(provider.id, provider.label)}
                  disabled={busy !== null}
                  className="sc-textbtn text-[12px]"
                >
                  {busy === provider.id ? 'Connecting\u2026' : 'Connect'}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {linked.has('password') && canDisconnect && (
        <div>
          <button
            onClick={() => disconnect('password', 'Email and password sign-in')}
            disabled={busy !== null}
            className="sc-textbtn sc-textbtn--muted text-[12px]"
          >
            Remove password sign-in
          </button>
        </div>
      )}

      <StatusText status={status} />
    </div>
  );
}

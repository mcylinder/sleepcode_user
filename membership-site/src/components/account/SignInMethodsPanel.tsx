'use client';

import { useState } from 'react';
import { unlink } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { authErrorMessage } from '@/lib/authErrors';
import { PROVIDER_LABELS, type SocialProviderId } from '@/lib/authProviders';
import ProviderIcon from '@/components/ProviderIcon';
import StatusText, { type Status } from '@/components/ui/StatusText';
import { ReauthCancelled } from './useReauth';

// Lists only the methods already on the account. Disconnecting is allowed while another remains.
export default function SignInMethodsPanel({
  withRecentLogin,
}: {
  withRecentLogin: <T>(action: () => Promise<T>) => Promise<T>;
}) {
  const { currentUser, refreshUser } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);

  if (!currentUser) return null;
  const user = currentUser;

  const methods = user.providerData
    .map((p) => p.providerId)
    .filter((id): id is SocialProviderId | 'password' => id in PROVIDER_LABELS);
  const canDisconnect = methods.length > 1;

  async function disconnect(id: string) {
    const label = PROVIDER_LABELS[id];
    try {
      setBusy(id);
      setStatus(null);
      await withRecentLogin(() => unlink(user, id));
      await refreshUser();
      setStatus({ type: 'success', text: `${label} has been disconnected.` });
    } catch (err) {
      if (err instanceof ReauthCancelled) return;
      const message = authErrorMessage(err);
      if (message) setStatus({ type: 'error', text: message });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <ul>
        {methods.map((id) => (
          <li key={id} className="flex items-center justify-between py-3">
            <span className="flex items-center gap-3 text-[14px]">
              <ProviderIcon id={id} className={`h-4 w-4 ${id === 'password' ? 'text-ink-muted' : 'text-ink'}`} />
              {PROVIDER_LABELS[id]}
            </span>
            <span className="flex items-center gap-4 text-[12px]">
              <span className="text-ink-muted">Connected</span>
              {canDisconnect && (
                <button
                  onClick={() => disconnect(id)}
                  disabled={busy !== null}
                  className="sc-textbtn sc-textbtn--muted text-[12px]"
                >
                  {busy === id ? 'Working\u2026' : 'Disconnect'}
                </button>
              )}
            </span>
          </li>
        ))}
      </ul>
      <StatusText status={status} />
    </div>
  );
}

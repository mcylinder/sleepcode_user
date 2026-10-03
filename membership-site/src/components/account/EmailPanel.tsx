'use client';

import { useState } from 'react';
import { verifyBeforeUpdateEmail } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { authErrorMessage } from '@/lib/authErrors';
import { PROVIDER_LABELS } from '@/lib/authProviders';
import StatusText, { type Status } from '@/components/ui/StatusText';
import { ReauthCancelled } from './useReauth';

export default function EmailPanel({
  withRecentLogin,
}: {
  withRecentLogin: <T>(action: () => Promise<T>) => Promise<T>;
}) {
  const { currentUser } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  if (!currentUser) return null;
  const user = currentUser;

  const hasPassword = user.providerData.some((p) => p.providerId === 'password');
  const emailSource = user.providerData.find((p) => p.email === user.email && p.providerId !== 'password');

  if (!hasPassword) {
    return (
      <p className="text-[15px] leading-[1.6] text-ink-muted">
        {emailSource
          ? `Your email comes from your ${PROVIDER_LABELS[emailSource.providerId]} sign-in. To change it, update it with ${PROVIDER_LABELS[emailSource.providerId]}.`
          : 'Your email comes from the account you sign in with. To change it, update it there.'}
      </p>
    );
  }

  async function changeEmail(e: React.FormEvent) {
    e.preventDefault();
    const email = newEmail.trim();
    try {
      setBusy(true);
      setStatus(null);
      await withRecentLogin(() => verifyBeforeUpdateEmail(user, email));
      setNewEmail('');
      setStatus({ type: 'success', text: `We sent a confirmation link to ${email}. Your email changes once you click it.` });
    } catch (err) {
      if (err instanceof ReauthCancelled) return;
      setStatus({ type: 'error', text: authErrorMessage(err) ?? 'Something went wrong.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={changeEmail} className="flex flex-col gap-4">
      <p className="text-[15px] text-ink-muted">
        Currently <span className="text-ink">{user.email}</span>
        {user.emailVerified ? ' \u00b7 verified' : ''}
      </p>
      <div>
        <label htmlFor="newEmail" className="sr-only">New email address</label>
        <input
          id="newEmail"
          type="email"
          required
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="sc-input"
          placeholder="New email address"
        />
      </div>
      <div>
        <button type="submit" disabled={busy || !newEmail.trim()} className="sc-textbtn">
          {busy ? 'Sending\u2026' : 'Send confirmation link'}
        </button>
      </div>
      <StatusText status={status} />
    </form>
  );
}

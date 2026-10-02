'use client';

import { useState } from 'react';
import { EmailAuthProvider, linkWithCredential, updatePassword } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { authErrorMessage } from '@/lib/authErrors';
import StatusText, { type Status } from '@/components/ui/StatusText';
import { ReauthCancelled } from './useReauth';

export default function PasswordPanel({
  withRecentLogin,
}: {
  withRecentLogin: <T>(action: () => Promise<T>) => Promise<T>;
}) {
  const { currentUser, refreshUser, resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState<'save' | 'reset' | null>(null);
  const [status, setStatus] = useState<Status>(null);

  if (!currentUser) return null;
  const user = currentUser;
  const hasPassword = user.providerData.some((p) => p.providerId === 'password');

  async function run(key: 'save' | 'reset', action: () => Promise<string>) {
    try {
      setBusy(key);
      setStatus(null);
      setStatus({ type: 'success', text: await action() });
    } catch (err) {
      if (err instanceof ReauthCancelled) return;
      setStatus({ type: 'error', text: authErrorMessage(err) ?? 'Something went wrong.' });
    } finally {
      setBusy(null);
    }
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setStatus({ type: 'error', text: 'Please choose a password with at least 6 characters.' });
      return;
    }
    if (password !== confirm) {
      setStatus({ type: 'error', text: 'The two passwords don\u2019t match.' });
      return;
    }
    run('save', async () => {
      if (hasPassword) {
        await withRecentLogin(() => updatePassword(user, password));
      } else {
        await withRecentLogin(() => linkWithCredential(user, EmailAuthProvider.credential(user.email!, password)));
        await refreshUser();
      }
      setPassword('');
      setConfirm('');
      return hasPassword ? 'Password updated.' : 'Password set. You can now sign in with your email and password.';
    });
  }

  const sendReset = () =>
    run('reset', async () => {
      await resetPassword(user.email!);
      return `We sent a password reset link to ${user.email}.`;
    });

  if (!user.email) {
    return <p className="text-[13px] text-fg-muted">Add an email address to your account before setting a password.</p>;
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      <p className="text-[13px] text-fg-muted">
        {hasPassword
          ? 'Change the password you use to sign in with your email.'
          : `Set a password so you can also sign in with ${user.email}.`}
      </p>
      <input
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="sc-input"
        placeholder={hasPassword ? 'New password' : 'Password'}
        aria-label={hasPassword ? 'New password' : 'Password'}
      />
      <input
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="sc-input"
        placeholder="Confirm password"
        aria-label="Confirm password"
      />
      <div className="flex flex-wrap gap-6">
        <button type="submit" disabled={busy !== null || !password} className="sc-textbtn">
          {busy === 'save' ? 'Saving\u2026' : hasPassword ? 'Change password' : 'Set password'}
        </button>
        {hasPassword && (
          <button type="button" onClick={sendReset} disabled={busy !== null} className="sc-textbtn sc-textbtn--muted">
            {busy === 'reset' ? 'Sending\u2026' : 'Email me a reset link'}
          </button>
        )}
      </div>
      <StatusText status={status} />
    </form>
  );
}

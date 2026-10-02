'use client';

import { useState } from 'react';
import { sendEmailVerification, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { authErrorMessage } from '@/lib/authErrors';
import StatusText, { type Status } from '@/components/ui/StatusText';

export default function IdentityBlock() {
  const { currentUser, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName ?? '');
  const [busy, setBusy] = useState<'name' | 'verify' | null>(null);
  const [status, setStatus] = useState<Status>(null);

  if (!currentUser) return null;
  const user = currentUser;

  async function run(key: 'name' | 'verify', action: () => Promise<string>) {
    try {
      setBusy(key);
      setStatus(null);
      setStatus({ type: 'success', text: await action() });
    } catch (err) {
      setStatus({ type: 'error', text: authErrorMessage(err) ?? 'Something went wrong.' });
    } finally {
      setBusy(null);
    }
  }

  const saveName = () =>
    run('name', async () => {
      const name = displayName.trim();
      await updateProfile(user, { displayName: name || null });
      if (db) await updateDoc(doc(db, 'users', user.uid), { displayName: name || null, updatedAt: serverTimestamp() });
      await refreshUser();
      setEditing(false);
      return 'Name saved.';
    });

  const resendVerification = () =>
    run('verify', async () => {
      await sendEmailVerification(user);
      return `Verification email sent to ${user.email}.`;
    });

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="sc-eyebrow--muted">Account</div>
          <h1 className="mt-[6px] truncate text-[22px] font-semibold wide:text-[26px]">
            {user.displayName || 'Your account'}
          </h1>
          <p className="mt-[3px] truncate text-[13px] text-fg-muted">{user.email ?? 'No email on file'}</p>
        </div>
        {!editing && (
          <button
            onClick={() => {
              setDisplayName(user.displayName ?? '');
              setStatus(null);
              setEditing(true);
            }}
            className="mt-[2px] flex-shrink-0 text-[12px] text-fg-muted hover:text-fg"
          >
            Edit
          </button>
        )}
      </div>

      {user.email && !user.emailVerified && (
        <p className="mt-2 text-[12px] text-fg-faint">
          Email not verified &middot;{' '}
          <button onClick={resendVerification} disabled={busy !== null} className="sc-textbtn text-[12px]">
            {busy === 'verify' ? 'Sending\u2026' : 'Resend link'}
          </button>
        </p>
      )}

      {editing && (
        <form
          className="mt-4 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            saveName();
          }}
        >
          <div>
            <label htmlFor="displayName" className="sc-label">Name</label>
            <input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="sc-input"
              placeholder="Your name"
              maxLength={80}
              autoFocus
            />
          </div>
          <div className="flex gap-6">
            <button
              type="submit"
              disabled={busy !== null || displayName.trim() === (user.displayName ?? '')}
              className="sc-textbtn"
            >
              {busy === 'name' ? 'Saving\u2026' : 'Save'}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="sc-textbtn sc-textbtn--muted">
              Cancel
            </button>
          </div>
        </form>
      )}

      <StatusText status={status} className="mt-3" />
    </div>
  );
}

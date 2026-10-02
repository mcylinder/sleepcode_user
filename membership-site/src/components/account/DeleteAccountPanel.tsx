'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMembership } from '@/hooks/useMembership';
import { authedFetch } from '@/lib/authedFetch';
import StatusText, { type Status } from '@/components/ui/StatusText';
import { ReauthCancelled } from './useReauth';

const CONFIRM_WORD = 'DELETE';

export default function DeleteAccountPanel({ reauthenticate }: { reauthenticate: () => Promise<void> }) {
  const { logout } = useAuth();
  const { isMember } = useMembership();
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function deleteAccount(e: React.FormEvent) {
    e.preventDefault();
    try {
      setBusy(true);
      setStatus(null);
      await reauthenticate();
      await authedFetch('/api/account/delete', {}, { freshToken: true });
      await logout().catch(() => undefined);
      window.location.replace('/');
    } catch (err) {
      if (err instanceof ReauthCancelled) {
        setBusy(false);
        return;
      }
      setStatus({ type: 'error', text: err instanceof Error ? err.message : 'Something went wrong.' });
      setBusy(false);
    }
  }

  return (
    <form onSubmit={deleteAccount} className="flex flex-col gap-4">
      <p className="text-[13px] leading-relaxed text-fg-muted">
        Permanently delete your SleepCode account and everything saved with it. This can&apos;t be undone.
        {isMember && ' Your membership is cancelled immediately and you won\u2019t be charged again.'}
      </p>
      <div>
        <label htmlFor="confirmDelete" className="sc-label">Type {CONFIRM_WORD} to confirm</label>
        <input
          id="confirmDelete"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          className="sc-input"
          autoComplete="off"
        />
      </div>
      <div>
        <button type="submit" disabled={typed !== CONFIRM_WORD || busy} className="sc-textbtn">
          {busy ? 'Deleting\u2026' : 'Permanently delete my account'}
        </button>
      </div>
      <StatusText status={status} />
    </form>
  );
}

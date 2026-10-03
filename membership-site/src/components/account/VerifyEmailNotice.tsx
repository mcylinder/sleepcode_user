'use client';

import { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { authErrorMessage } from '@/lib/authErrors';
import StatusText, { type Status } from '@/components/ui/StatusText';

export default function VerifyEmailNotice() {
  const { currentUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  if (!currentUser?.email || currentUser.emailVerified) return null;
  const user = currentUser;

  async function resend() {
    try {
      setBusy(true);
      setStatus(null);
      await sendEmailVerification(user);
      setStatus({ type: 'success', text: `Verification email sent to ${user.email}.` });
    } catch (err) {
      setStatus({ type: 'error', text: authErrorMessage(err) ?? 'Something went wrong.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="-mt-2 flex flex-col gap-2 pb-4">
      <p className="text-[14px] text-ink-muted">
        Email not verified &middot;{' '}
        <button type="button" onClick={resend} disabled={busy} className="sc-textbtn text-[14px]">
          {busy ? 'Sending\u2026' : 'Resend link'}
        </button>
      </p>
      <StatusText status={status} />
    </div>
  );
}

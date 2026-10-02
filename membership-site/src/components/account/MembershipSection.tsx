'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMembership } from '@/hooks/useMembership';
import { authedFetch } from '@/lib/authedFetch';
import { SESSIONS } from '@/lib/catalog';
import { PRICES } from '@/lib/membership';
import StatusText, { type Status } from '@/components/ui/StatusText';
import { LockIcon } from '@/components/ui/icons';
import { AccountSection, formatDate } from './Section';

const PAYMENT_PROBLEM_STATUSES = ['past_due', 'unpaid', 'incomplete'];

export default function MembershipSection({ justCheckedOut }: { justCheckedOut: boolean }) {
  const { membership, isMember, loading } = useMembership();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const counts = { free: SESSIONS.filter((s) => s.free).length, total: SESSIONS.length };

  async function openPortal() {
    try {
      setBusy(true);
      setStatus(null);
      const { url } = await authedFetch<{ url: string }>('/api/billing/portal', {});
      window.location.href = url;
    } catch (err) {
      setStatus({ type: 'error', text: err instanceof Error ? err.message : 'Something went wrong.' });
      setBusy(false);
    }
  }

  const hasPaymentProblem = !!membership && PAYMENT_PROBLEM_STATUSES.includes(membership.status);
  const hasBillingHistory = !!membership && membership.status !== 'none';

  let tier = 'Free';
  let notes: string[] = [];
  let action: React.ReactNode = null;

  if (loading) {
    tier = '\u00a0';
    notes = ['Checking your membership\u2026'];
  } else if (isMember && membership) {
    tier = 'SleepCode+';
    if (membership.interval) {
      notes.push(
        `${membership.interval === 'year' ? 'Yearly' : 'Monthly'} \u00b7 ${PRICES[membership.interval].amount} ${PRICES[membership.interval].label}`,
      );
    }
    if (membership.currentPeriodEnd) {
      notes.push(
        membership.cancelAtPeriodEnd
          ? `Ends ${formatDate(membership.currentPeriodEnd)}. You won\u2019t be charged again.`
          : `Renews ${formatDate(membership.currentPeriodEnd)}.`,
      );
    }
    notes.push('Every session is unlocked.');
    action = (
      <>
        <button onClick={openPortal} disabled={busy} className="sc-cta">
          {busy ? 'Opening\u2026' : 'Manage Billing'}
        </button>
        <p className="mt-3 text-[12px] text-fg-faint">Change plan, update your card, see invoices, or cancel.</p>
      </>
    );
  } else if (hasPaymentProblem) {
    notes = ['There\u2019s a problem with your last payment. Update your card to keep every session unlocked.'];
    action = (
      <button onClick={openPortal} disabled={busy} className="sc-cta">
        {busy ? 'Opening\u2026' : 'Update Payment Method'}
      </button>
    );
  } else {
    notes = [
      counts.total > 0
        ? `${counts.free} of ${counts.total} sessions unlocked.`
        : 'The free sessions are unlocked.',
    ];
    if (justCheckedOut) notes.push('Thanks! We\u2019re confirming your payment. This updates in a few seconds.');
    action = (
      <>
        <Link href="/pricing" className="sc-cta">Upgrade to SleepCode+</Link>
        {hasBillingHistory && (
          <div className="mt-4">
            <button onClick={openPortal} disabled={busy} className="sc-textbtn sc-textbtn--muted text-[12px]">
              {busy ? 'Opening\u2026' : 'View past invoices'}
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <AccountSection title="Membership">
      <div className="border-b border-line pb-5 pt-2 wide:pb-[22px]">
        <div className="flex items-baseline justify-between">
          <div className="text-[17px] font-semibold">{tier}</div>
          {!loading && !isMember && <LockIcon />}
        </div>
        {notes.map((note) => (
          <p key={note} className="mt-1 text-[13px] text-fg-muted">{note}</p>
        ))}
        {action && <div className="mt-4">{action}</div>}
        <StatusText status={status} className="mt-3" />
      </div>
    </AccountSection>
  );
}

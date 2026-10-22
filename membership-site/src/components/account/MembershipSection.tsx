'use client';

import { useMembership } from '@/hooks/useMembership';
import { useBilling } from '@/lib/useBilling';
import { FEATURED_FREE_SESSION, sessionLabel } from '@/lib/catalog';
import { PRICES } from '@/lib/membership';
import StatusText from '@/components/ui/StatusText';
import { AccountSection, formatDate } from './Section';

const PAYMENT_PROBLEM_STATUSES = ['past_due', 'unpaid', 'incomplete'];

function PlanRow({ name, detail, children }: { name: string; detail?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-t border-[rgba(44,38,32,0.16)] py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span className="text-[18px] font-semibold">{name}</span>
        {detail && <span className="text-[14px] text-ink-muted">{detail}</span>}
      </div>
      {children}
    </div>
  );
}

const Note = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[15px] leading-[1.6] text-ink-muted">{children}</p>
);

// Beta: free plan only (no upgrade CTA). Existing SleepCode+ members can still manage billing.
export default function MembershipSection({ justCheckedOut }: { justCheckedOut: boolean }) {
  const { membership, isMember, loading } = useMembership();
  const { busy, error, openPortal } = useBilling();

  const hasPaymentProblem = !!membership && PAYMENT_PROBLEM_STATUSES.includes(membership.status);
  const hasBillingHistory = !!membership && membership.status !== 'none';
  const errorText = error && <StatusText status={{ type: 'error', text: error }} />;
  const freeLabel = FEATURED_FREE_SESSION ? sessionLabel(FEATURED_FREE_SESSION) : 'Open Door · Optimism';

  let body: React.ReactNode;
  if (loading) {
    body = (
      <PlanRow name={'\u00a0'}>
        <Note>Checking your membership&hellip;</Note>
      </PlanRow>
    );
  } else if (isMember && membership) {
    const plan = membership.interval ? PRICES[membership.interval] : null;
    body = (
      <PlanRow
        name="SleepCode+"
        detail={plan ? `${membership.interval === 'year' ? 'Yearly' : 'Monthly'} \u00b7 ${plan.amount} ${plan.label}` : undefined}
      >
        <Note>
          {membership.currentPeriodEnd &&
            (membership.cancelAtPeriodEnd
              ? `Ends ${formatDate(membership.currentPeriodEnd)}. You won\u2019t be charged again. `
              : `Renews ${formatDate(membership.currentPeriodEnd)}. `)}
          Every session is unlocked.
        </Note>
        <div className="flex flex-wrap items-center gap-[14px]">
          <button type="button" onClick={openPortal} disabled={busy} className="sc-btn-outline">
            {busy ? 'Opening\u2026' : 'Manage billing'}
          </button>
          <span className="text-[14px] text-ink-muted">Change plan, update your card, see invoices, or cancel.</span>
        </div>
        {errorText}
      </PlanRow>
    );
  } else if (hasPaymentProblem) {
    body = (
      <PlanRow name="SleepCode+" detail="Payment problem">
        <Note>There&rsquo;s a problem with your last payment. Update your card to keep every session unlocked.</Note>
        <div>
          <button type="button" onClick={openPortal} disabled={busy} className="sc-btn">
            {busy ? 'Opening\u2026' : 'Update payment method'}
          </button>
        </div>
        {errorText}
      </PlanRow>
    );
  } else {
    body = (
      <PlanRow name="Free plan" detail={freeLabel}>
        {justCheckedOut ? (
          <Note>Thanks! We&rsquo;re confirming your payment. This updates in a few seconds.</Note>
        ) : (
          <Note>{freeLabel} is included. More sessions are coming soon.</Note>
        )}
        {hasBillingHistory && (
          <button type="button" onClick={openPortal} disabled={busy} className="sc-textbtn sc-textbtn--muted self-start text-[14px]">
            View past invoices
          </button>
        )}
        {errorText}
      </PlanRow>
    );
  }

  return (
    <AccountSection title="Membership" accent>
      {body}
    </AccountSection>
  );
}

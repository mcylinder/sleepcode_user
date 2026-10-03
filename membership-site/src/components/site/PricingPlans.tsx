'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useMembership } from '@/hooks/useMembership';
import { useBilling } from '@/lib/useBilling';
import { FEATURED_FREE_SESSION, MEMBER_ONLY_COUNT, SESSIONS, moreSessionsLabel } from '@/lib/catalog';
import { PRICES, type BillingInterval } from '@/lib/membership';
import BillingToggle from '@/components/ui/BillingToggle';
import PlayLink from '@/components/ui/PlayLink';
import StatusText from '@/components/ui/StatusText';

// Free and SleepCode+ side by side. With `resumeCheckout`, visitors who picked a plan before
// signing in come back here with ?checkout=month|year and go straight to Stripe.
export default function PricingPlans({ resumeCheckout = false }: { resumeCheckout?: boolean }) {
  const { currentUser } = useAuth();
  const { isMember, loading: membershipLoading } = useMembership();
  const { busy, error, startCheckout } = useBilling();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('year');
  const resumed = useRef(false);
  const free = FEATURED_FREE_SESSION;
  const price = PRICES[billingInterval];

  useEffect(() => {
    if (!resumeCheckout || !currentUser || membershipLoading || resumed.current) return;
    const requested = new URLSearchParams(window.location.search).get('checkout');
    if (requested !== 'month' && requested !== 'year') return;
    resumed.current = true;
    window.history.replaceState(null, '', window.location.pathname);
    setBillingInterval(requested);
    if (!isMember) startCheckout(requested);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeCheckout, currentUser, isMember, membershipLoading]);

  const signupThenCheckout = `/login?mode=signup&next=${encodeURIComponent(`/pricing?checkout=${billingInterval}`)}`;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-x-12">
      <div className="flex flex-col gap-[14px] border-t border-hairline-strong py-[26px]">
        <span className="flex min-h-[36px] items-center text-[15px] font-semibold">Free</span>
        <span className="text-[44px] font-medium leading-tight tracking-[-0.03em]">$0</span>
        <p className="text-[16px] leading-[1.6] text-ink-muted">
          {free
            ? `${free.title}, our most-played session.`
            : 'A free session.'}
        </p>
        {free && (
          <PlayLink session={free} className="sc-link self-start">
            Play it now
          </PlayLink>
        )}
      </div>

      <div className="flex flex-col gap-[14px] border-t border-hairline-strong py-[26px]">
        <div className="flex min-h-[36px] flex-wrap items-center justify-between gap-3">
          <span className="text-[15px] font-semibold">SleepCode+</span>
          <BillingToggle value={billingInterval} onChange={setBillingInterval} />
        </div>
        <span className="text-[44px] font-medium leading-tight tracking-[-0.03em]">
          {price.amount}
          <span className="text-[17px] font-normal tracking-normal text-ink-muted"> {price.label}</span>
        </span>
        <p className="text-[16px] leading-[1.6] text-ink-muted">
          {free ? `${free.title} plus ${moreSessionsLabel(MEMBER_ONLY_COUNT)}` : 'Every session'}, each written for a
          specific goal. {price.note}
        </p>
        <ul aria-label="Sessions included with SleepCode+" className="border-b border-hairline">
          {SESSIONS.map((session, i) => (
            <li
              key={session.id}
              className="grid grid-cols-[28px_1fr_auto] items-baseline gap-3 border-t border-hairline py-[9px] text-[15px]"
            >
              <span className="font-mono text-[12px] text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-medium">{session.title}</span>
              <span className="text-[13px] text-ink-muted">{session.free ? 'Free' : session.theme}</span>
            </li>
          ))}
        </ul>
        <div className="self-start">
          {!currentUser ? (
            <Link href={signupThenCheckout} className="sc-btn-outline">Start SleepCode+</Link>
          ) : isMember ? (
            <Link href="/account" className="sc-btn-outline">Manage your membership</Link>
          ) : (
            <button
              type="button"
              onClick={() => startCheckout(billingInterval)}
              disabled={busy || membershipLoading}
              className="sc-btn-outline"
            >
              {busy ? 'Opening checkout\u2026' : 'Upgrade to SleepCode+'}
            </button>
          )}
        </div>
        {error && <StatusText status={{ type: 'error', text: error }} />}
      </div>
    </div>
  );
}

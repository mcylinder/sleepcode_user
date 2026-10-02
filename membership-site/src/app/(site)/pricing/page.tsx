'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useMembership } from '@/hooks/useMembership';
import { authedFetch } from '@/lib/authedFetch';
import { PRICES, type BillingInterval } from '@/lib/membership';
import StatusText from '@/components/ui/StatusText';

const FREE_FEATURES = [
  'A handful of sessions, free permanently',
  'Voice and pulse blend, repeat control',
  'Session timer and Night Shade',
  'Works in your phone\u2019s browser',
];

const MEMBER_FEATURES = [
  'Every session in the catalogue',
  'New sessions as they\u2019re added',
  'No ads, no gimmicks',
  'Cancel any time',
];

const FAQS = [
  {
    question: 'Can I cancel any time?',
    answer:
      'Yes. Go to your account and choose Manage billing. You keep every session until the end of the period you\u2019ve already paid for, and you won\u2019t be charged again.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'There\u2019s no trial, and you don\u2019t need one. A free account includes the free sessions, so you can hear how SleepCode works before you join.',
  },
  {
    question: 'Can I switch between monthly and yearly?',
    answer: 'Yes. Choose Manage billing in your account. Stripe adjusts the price for the time left on your current plan.',
  },
  {
    question: 'How do I pay?',
    answer: 'All major credit and debit cards. Payments are processed by Stripe; we never see or store your card details.',
  },
];

const YEARLY_SAVINGS_PERCENT = Math.round((1 - 49 / (7 * 12)) * 100);

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 border-t border-line">
      {items.map((item) => (
        <li key={item} className="sc-row text-[14px] text-fg-muted">{item}</li>
      ))}
    </ul>
  );
}

export default function PricingPage() {
  const { currentUser } = useAuth();
  const { isMember, loading: membershipLoading } = useMembership();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('year');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const autoCheckoutStarted = useRef(false);

  async function goTo(endpoint: string, body: unknown) {
    try {
      setBusy(true);
      setError('');
      const { url } = await authedFetch<{ url: string }>(endpoint, body);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setBusy(false);
    }
  }

  const startCheckout = (chosen: BillingInterval) => goTo('/api/billing/checkout', { interval: chosen });

  // Visitors who picked a plan before signing in come back here with ?checkout=month|year.
  useEffect(() => {
    if (!currentUser || membershipLoading || autoCheckoutStarted.current) return;
    const requested = new URLSearchParams(window.location.search).get('checkout');
    if (requested !== 'month' && requested !== 'year') return;
    autoCheckoutStarted.current = true;
    window.history.replaceState(null, '', '/pricing');
    setBillingInterval(requested);
    if (!isMember) startCheckout(requested);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, isMember, membershipLoading]);

  const price = PRICES[billingInterval];
  const signupThenCheckout = `/login?mode=signup&next=${encodeURIComponent(`/pricing?checkout=${billingInterval}`)}`;

  return (
    <div className="mx-auto w-full max-w-[1060px] px-[30px] pt-10 wide:px-[60px] wide:pt-[70px]">
      <div className="max-w-[480px]">
        <div className="sc-eyebrow">SleepCode+</div>
        <h1 className="mt-[10px] text-[27px] font-semibold leading-[1.25] tracking-[-0.01em] wide:text-[40px] wide:leading-[1.2]">
          One membership.<br />Every session.
        </h1>
        <p className="mt-[14px] text-[14px] leading-[1.55] text-fg-muted wide:text-[15px] wide:leading-[1.6]">
          A handful of sessions are free with an account. SleepCode+ unlocks the full catalogue as it grows.
        </p>
      </div>

      <div className="mt-9 flex gap-[22px] text-[13px]" role="radiogroup" aria-label="Billing period">
        {(['month', 'year'] as BillingInterval[]).map((option) => (
          <button
            key={option}
            role="radio"
            aria-checked={billingInterval === option}
            onClick={() => setBillingInterval(option)}
            className={billingInterval === option ? 'font-semibold text-fg' : 'text-fg-faint hover:text-fg-muted'}
          >
            {option === 'month' ? 'Monthly' : `Yearly \u00b7 save ${YEARLY_SAVINGS_PERCENT}%`}
          </button>
        ))}
      </div>

      {error && <StatusText status={{ type: 'error', text: error }} className="mt-6" />}

      <div className="mt-8 grid gap-12 wide:grid-cols-2 wide:gap-[60px]">
        <section>
          <div className="sc-eyebrow--muted">Free</div>
          <div className="mt-3 text-[34px] font-semibold leading-none">$0</div>
          <p className="mt-2 text-[13px] text-fg-faint">Free account required</p>
          <FeatureList items={FREE_FEATURES} />
          <div className="mt-6 text-[13px]">
            {currentUser ? (
              <span className="text-fg-faint">{isMember ? 'Included in your membership' : 'Your current plan'}</span>
            ) : (
              <Link href="/login?mode=signup" className="sc-textbtn">Create a free account</Link>
            )}
          </div>
        </section>

        <section>
          <div className="sc-eyebrow--muted">SleepCode+</div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[34px] font-semibold leading-none">{price.amount}</span>
            <span className="text-[14px] text-fg-muted">{price.label}</span>
          </div>
          <p className="mt-2 text-[13px] text-fg-faint">
            {billingInterval === 'year' ? 'About $4.08 a month, billed yearly' : 'Billed monthly'}
          </p>
          <FeatureList items={MEMBER_FEATURES} />
          <div className="mt-6">
            {!currentUser ? (
              <Link href={signupThenCheckout} className="sc-cta">Join SleepCode+</Link>
            ) : isMember ? (
              <Link href="/account" className="sc-textbtn">You&apos;re a member. Manage it in your account</Link>
            ) : (
              <button onClick={() => startCheckout(billingInterval)} disabled={busy || membershipLoading} className="sc-cta">
                {busy ? 'Opening checkout\u2026' : `Join SleepCode+ \u00b7 ${price.amount}`}
              </button>
            )}
          </div>
        </section>
      </div>

      <section className="mt-16 wide:mt-[84px] wide:max-w-[560px]">
        <div className="sc-eyebrow mb-1">Membership Questions</div>
        <dl>
          {FAQS.map((faq, i) => (
            <div key={faq.question} className={`sc-row ${i === FAQS.length - 1 ? 'sc-row--last' : ''}`}>
              <dt className="text-[15px] font-semibold">{faq.question}</dt>
              <dd className="mt-[6px] text-[14px] leading-[1.6] text-fg-muted">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useMembership } from '@/hooks/useMembership';
import { authedFetch } from '@/lib/authedFetch';
import { PRICES, type BillingInterval } from '@/lib/membership';

const FREE_FEATURES = [
  'Free sessions to try SleepCoding',
  'Voices, music, and environment presets',
  'Sleep timer and voice/soundscape mixing',
  'Works in your phone\u2019s browser',
];

const MEMBER_FEATURES = [
  'Every session in the library',
  'New sessions as they\u2019re added',
  'Voices, music, and environment presets',
  'Sleep timer and voice/soundscape mixing',
  'Cancel anytime',
];

const YEARLY_SAVINGS_PERCENT = Math.round((1 - 49 / (7 * 12)) * 100);

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start">
      <div className="flex-shrink-0">
        <svg className="h-6 w-6 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="ml-3 text-sm text-gray-700">{children}</p>
    </li>
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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">Pick what supports you</h1>
          <p className="mt-4 text-xl text-gray-600">Start free. Become a member to unlock every session.</p>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="inline-flex border border-[#9098a1] bg-white p-1 rounded-full">
            {(['month', 'year'] as BillingInterval[]).map((option) => (
              <button
                key={option}
                onClick={() => setBillingInterval(option)}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
                  billingInterval === option ? 'bg-[#4e88dd] text-white' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {option === 'month' ? 'Monthly' : `Yearly (save ${YEARLY_SAVINGS_PERCENT}%)`}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-6 max-w-4xl mx-auto bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>
        )}

        <div className="mt-10 max-w-4xl mx-auto grid gap-8 lg:grid-cols-2 lg:gap-x-8">
          {/* Free */}
          <div className="bg-[#dfeaf0] border border-[#9098a1] shadow-sm overflow-hidden rounded-lg">
            <div className="px-6 py-8 flex flex-col h-full">
              <h3 className="text-2xl font-semibold text-gray-900">Free</h3>
              <p className="mt-4 text-gray-600">Try SleepCoding at no cost</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$0</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">Free account required</p>
              <ul className="mt-8 space-y-4 flex-grow">
                {FREE_FEATURES.map((feature) => (
                  <CheckItem key={feature}>{feature}</CheckItem>
                ))}
              </ul>
              <div className="mt-8">
                {currentUser ? (
                  <div className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-500">
                    {isMember ? 'Included in your membership' : 'Your current plan'}
                  </div>
                ) : (
                  <Link
                    href="/login?mode=signup"
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Create a free account
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Membership */}
          <div className="bg-[#dfeaf0] border-2 border-[#4e88dd] shadow-sm relative overflow-hidden rounded-lg">
            <div className="px-6 py-8 flex flex-col h-full">
              <h3 className="text-2xl font-semibold text-gray-900">Membership</h3>
              <p className="mt-4 text-gray-600">Unlimited access to every session</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">{price.amount}</span>
                <span className="text-base font-medium text-gray-500">/{billingInterval === 'year' ? 'year' : 'month'}</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {billingInterval === 'year' ? 'About $4.08/month, billed annually' : 'Billed monthly'}
              </p>
              <ul className="mt-8 space-y-4 flex-grow">
                {MEMBER_FEATURES.map((feature) => (
                  <CheckItem key={feature}>{feature}</CheckItem>
                ))}
              </ul>
              <div className="mt-8">
                {!currentUser ? (
                  <Link
                    href={signupThenCheckout}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium text-white bg-[#4e88dd] hover:bg-[#340c35]"
                  >
                    Become a member
                  </Link>
                ) : isMember ? (
                  <Link
                    href="/account"
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium text-white bg-[#4e88dd] hover:bg-[#340c35]"
                  >
                    You&apos;re a member: manage in your account
                  </Link>
                ) : (
                  <button
                    onClick={() => startCheckout(billingInterval)}
                    disabled={busy || membershipLoading}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium text-white bg-[#4e88dd] hover:bg-[#340c35] disabled:opacity-50"
                  >
                    {busy ? 'Opening checkout...' : `Become a member, ${price.amount}/${billingInterval === 'year' ? 'year' : 'month'}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Membership Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-[#dfeaf0] p-6 shadow-sm rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Can I cancel my membership anytime?</h3>
              <p className="text-gray-600">
                Yes. Go to your account and choose Manage billing. You keep access to every session until the end of the
                period you&apos;ve already paid for, and you won&apos;t be charged again.
              </p>
            </div>
            <div className="bg-[#dfeaf0] p-6 shadow-sm rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">
                We don&apos;t offer a trial, but you don&apos;t need one. A free account lets you listen to our free
                sessions, so you can experience how SleepCoding works before you join.
              </p>
            </div>
            <div className="bg-[#dfeaf0] p-6 shadow-sm rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Can I switch between monthly and yearly?</h3>
              <p className="text-gray-600">
                Yes. Choose Manage billing in your account to switch plans. Stripe adjusts the price for the time
                remaining on your current plan.
              </p>
            </div>
            <div className="bg-[#dfeaf0] p-6 shadow-sm rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">How do I pay?</h3>
              <p className="text-gray-600">
                We accept all major credit and debit cards. Payments are processed securely by Stripe, and we never see
                or store your card details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

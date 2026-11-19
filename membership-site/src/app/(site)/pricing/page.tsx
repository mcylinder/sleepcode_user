import type { Metadata } from 'next';
import FaqList from '@/components/site/FaqList';
import PricingPlans from '@/components/site/PricingPlans';
import { PRICING_FAQ } from '@/data/faq';
import { CONTACT_EMAIL, pageMeta } from '@/lib/site';
import { SESSIONS } from '@/lib/catalog';

export const metadata: Metadata = pageMeta(
  'Pricing',
  'Start free with Fresh Start. SleepCode+ opens all 84 sessions, plus new ones as they arrive.',
);

export default function PricingPage() {
  return (
    <>
      <section className="sc-px flex max-w-[760px] flex-col gap-[18px] pb-[clamp(32px,4vw,48px)] pt-[clamp(28px,5vw,72px)]">
        <span className="sc-eyebrow">Pricing</span>
        <h1 className="sc-h-page">
          <span className="block text-ink-muted">Start free.</span> <span className="block">Go further with SleepCode+.</span>
        </h1>
        <p className="sc-lead">
          Sign up free and Fresh Start is yours. SleepCode+ opens all {SESSIONS.length} sessions, plus new ones as
          they arrive.
        </p>
      </section>
      <section className="sc-px pb-[var(--pad-section)]">
        <PricingPlans resumeCheckout />
      </section>
      <section className="sc-band sc-section grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-start gap-[clamp(28px,5vw,72px)]">
        <span className="sc-eyebrow">Membership questions</span>
        <div className="min-w-[min(100%,300px)] wide:col-span-2">
          <FaqList groups={PRICING_FAQ} />
          <p className="pt-[22px] text-[15px] text-ink-muted">
            Another question? Email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="sc-link">{CONTACT_EMAIL}</a>
          </p>
        </div>
      </section>
    </>
  );
}

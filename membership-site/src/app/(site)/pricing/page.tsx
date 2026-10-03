import type { Metadata } from 'next';
import FaqList from '@/components/site/FaqList';
import PricingPlans from '@/components/site/PricingPlans';
import { PRICING_FAQ } from '@/data/faq';

export const metadata: Metadata = { title: 'Pricing \u2014 SleepCode' };

export default function PricingPage() {
  return (
    <>
      <section className="sc-px flex max-w-[760px] flex-col gap-[18px] pb-[clamp(32px,4vw,48px)] pt-[clamp(28px,5vw,72px)]">
        <span className="sc-eyebrow">Pricing</span>
        <h1 className="sc-h-page">Plain pricing.</h1>
        <p className="sc-lead">
          One session is free to keep. SleepCode+ adds every other session, including new ones as they&rsquo;re added.
          Cancel any time.
        </p>
      </section>
      <section className="sc-px pb-[var(--pad-section)]">
        <PricingPlans resumeCheckout />
      </section>
      <section className="sc-band sc-section grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-start gap-[clamp(28px,5vw,72px)]">
        <span className="sc-eyebrow">Membership questions</span>
        <div className="min-w-[min(100%,300px)] wide:col-span-2">
          <FaqList groups={PRICING_FAQ} />
        </div>
      </section>
    </>
  );
}

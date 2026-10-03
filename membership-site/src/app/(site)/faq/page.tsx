import type { Metadata } from 'next';
import FaqList from '@/components/site/FaqList';
import { FAQ_GROUPS } from '@/data/faq';
import { CONTACT_EMAIL } from '@/lib/site';

export const metadata: Metadata = { title: 'FAQ \u2014 SleepCode' };

export default function FAQPage() {
  return (
    <div className="sc-px grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-start gap-[clamp(28px,5vw,72px)] pb-[var(--pad-section)] pt-[clamp(28px,5vw,72px)]">
      <div className="flex flex-col gap-[18px]">
        <span className="sc-eyebrow">FAQ</span>
        <h1 className="sc-h-page">Questions, answered plainly.</h1>
        <p className="max-w-[26em] text-[17px] leading-[1.6] text-ink-muted">
          If something isn&rsquo;t covered here, write to us. A person reads every message.
        </p>
        <a href={`mailto:${CONTACT_EMAIL}`} className="sc-link self-start">{CONTACT_EMAIL}</a>
      </div>
      <div className="min-w-[min(100%,300px)] wide:col-span-2">
        <FaqList groups={FAQ_GROUPS} />
      </div>
    </div>
  );
}

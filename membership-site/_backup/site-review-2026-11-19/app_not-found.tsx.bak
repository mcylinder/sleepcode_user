import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import Rings from '@/components/ui/Rings';
import { CONTACT_EMAIL } from '@/lib/site';

export const metadata: Metadata = { title: 'Page not found \u2014 SleepCode' };

export default function NotFound() {
  return (
    <div className="sc-frame">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <section className="sc-px grid flex-1 grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-[clamp(32px,5vw,72px)] pb-[clamp(48px,8vw,110px)] pt-[clamp(28px,6vw,80px)]">
          <div className="flex flex-col gap-6">
            <span className="sc-eyebrow">
              <span className="font-mono">404</span> &middot; Page not found
            </span>
            <h1 className="sc-h-hero">This page has drifted off.</h1>
            <p className="max-w-[30em] text-[clamp(17px,1.5vw,19px)] leading-[1.6] text-ink-muted">
              The link may be old, or the address may have a typo. Head back to the home page and pick up from there.
            </p>
            <div className="flex flex-wrap items-center gap-[18px]">
              <Link href="/" className="sc-btn sc-btn--lg">Back to home</Link>
            </div>
            <p className="text-[15px] leading-[1.6] text-ink-muted">
              Looking for something specific? Email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="sc-link">{CONTACT_EMAIL}</a> and we&rsquo;ll help you find it.
            </p>
          </div>
          <div className="w-full max-w-[360px] justify-self-center">
            <Rings color="var(--accent)" restOpacity={0.3} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

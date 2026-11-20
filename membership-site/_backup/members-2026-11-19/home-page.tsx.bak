import type { Metadata } from 'next';
import Link from 'next/link';
import HeroCta from '@/components/site/HeroCta';
import HomeSessions from '@/components/site/HomeSessions';
import HeroRings from '@/components/site/HeroRings';
import SampleProvider from '@/components/site/SampleProvider';

export const metadata: Metadata = {
  title: {
    absolute: 'SleepCode — Supraliminal audio for specific goals',
  },
};

const STEPS = [
  {
    title: 'Choose one goal.',
    body: (
      <>
        A steadier mood, focus at work, confidence when it counts. Each{' '}
        <Link href="/library" className="sc-link">
          session
        </Link>{' '}
        is created for one specific goal.
      </>
    ),
  },
  {
    title: 'Hear it, then make it yours.',
    body: 'The instructor says each line and gives you space to say it back to yourself. Session after session, the words move from instruction to instinct.',
  },
  {
    title: 'A steady pulse.',
    body: 'A soft 111 Hz tone keeps time with the affirmations and gives your attention a quiet place to rest.',
  },
  {
    title: 'Side to side.',
    body: 'Inspired by the alternating left-right sound used in bilateral audio, the pulse travels between your ears. Follow it, or let it fade into the background. Adjust the width to whatever feels comfortable.',
  },
];


export default function LandingPage() {
  return (
    <SampleProvider>
      <section className="sc-px grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-[clamp(32px,5vw,72px)] pb-[clamp(48px,8vw,110px)] pt-[clamp(28px,6vw,80px)]">
        <div className="flex flex-col gap-6">
          <span className="sc-eyebrow">Supraliminal audio for specific goals</span>
          <h1 className="sc-h-hero">
            <span className="block text-ink-muted">Change starts with your words.</span>{' '}
            <span className="block">Make room for a better thought.</span>
          </h1>
          <HeroCta />
        </div>
        <div className="w-full max-w-[min(64vw,380px)] justify-self-center">
          <HeroRings />
        </div>
      </section>

      <section id="how-it-works" className="sc-band sc-section flex scroll-mt-4 flex-col gap-10">
        <div className="flex max-w-[640px] flex-col gap-[14px]">
          <span className="sc-eyebrow">How it works</span>
          <h2 className="sc-h-section">Simple to use. Clear by design.</h2>
          <p className="text-[17px] leading-[1.6] text-ink-muted">
            SleepCode isn&rsquo;t a sleep aid. Listen as the day winds down, or whenever you find a quiet
            moment. You choose what to work on.
          </p>
        </div>
        <ol className="grid grid-cols-1 gap-x-10 sm:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-[10px] border-t border-hairline-strong pb-[26px] pt-[22px]">
              <span className="font-mono text-[13px] text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="text-[20px] font-semibold leading-[1.25] tracking-[-0.01em]">{step.title}</h3>
              <p className="text-[16px] leading-[1.6] text-ink-muted">{step.body}</p>
            </li>
          ))}
        </ol>
        <Link href="/how-to-listen" className="sc-link self-start text-[16px]">
          Read the full listening guide
        </Link>
      </section>

      <section id="sessions" className="sc-section flex scroll-mt-4 flex-col gap-9">
        <div className="flex flex-col gap-[14px]">
          <span className="sc-eyebrow">Sessions</span>
          <h2 className="sc-h-section">Find the right session for you.</h2>
        </div>
        <HomeSessions />
      </section>
    </SampleProvider>
  );
}

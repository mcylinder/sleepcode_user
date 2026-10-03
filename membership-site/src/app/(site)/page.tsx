import Link from 'next/link';
import Rings from '@/components/ui/Rings';
import HeroCta from '@/components/site/HeroCta';
import PricingPlans from '@/components/site/PricingPlans';

const STEPS = [
  {
    title: 'Choose one goal.',
    body: 'A steadier mood, focus at work, confidence when it counts. Each session is created for one specific goal.',
  },
  {
    title: 'Hear it in the first person.',
    body: 'Each line is written in the first person (for example, \u201cI finish what I start\u201d), so it feels like your own internal dialogue rather than an instruction.',
  },
  {
    title: 'Listen, and repeat.',
    body: 'A slow 111 Hz tone pulses with each statement. It gives you a subtle, hypnotic focal point that helps you absorb the statements as you drift from conscious to asleep. Adjust the balance to match how active your mind is as you fall asleep.',
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="sc-px grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-[clamp(32px,5vw,72px)] pb-[clamp(48px,8vw,110px)] pt-[clamp(28px,6vw,80px)]">
        <div className="flex flex-col gap-6">
          <span className="sc-eyebrow">Supraliminal audio for specific goals</span>
          <h1 className="sc-h-hero">Attitudes are habits. Habits can be recoded.</h1>
          <p className="max-w-[30em] text-[clamp(17px,1.5vw,19px)] leading-[1.6] text-ink-muted">
            SleepCode sessions are supraliminal: one calm voice, speaking in the first person over a slow pulse, says
            clearly and often how you&rsquo;d like to think about a goal. You hear every word.
          </p>
          <HeroCta />
        </div>
        <div className="w-full max-w-[420px] justify-self-center">
          <Rings color="var(--accent)" restOpacity={0.55} />
        </div>
      </section>

      <section id="how-it-works" className="sc-band sc-section flex scroll-mt-4 flex-col gap-10">
        <div className="flex max-w-[640px] flex-col gap-[14px]">
          <span className="sc-eyebrow">How it works</span>
          <h2 className="sc-h-section">Simple to use. Clear about what it is.</h2>
        </div>
        <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-x-10">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-[10px] border-t border-[rgba(44,38,32,0.2)] pb-[26px] pt-[22px]">
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

      <section className="sc-section grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-start gap-[clamp(28px,5vw,72px)]">
        <div className="flex flex-col gap-[18px]">
          <span className="sc-eyebrow">Why this exists</span>
          <div className="sc-placeholder aspect-[4/5] w-full max-w-[300px]">founder portrait</div>
        </div>
        <div className="flex max-w-[620px] flex-col gap-5 text-[clamp(17px,1.6vw,20px)] leading-[1.6]">
          <p className="text-[clamp(24px,2.6vw,32px)] font-medium leading-[1.25] tracking-[-0.02em]">
          I always knew. I just kept talking myself out of it.
          </p>
          <p className="text-ink-muted">
            I tried the books, the journals, the subliminal tracks. The subliminal ones asked me to trust messages I
            couldn&rsquo;t hear, and I never could.
          </p>
          <p className="text-ink-muted">
          I tried many different approaches, and one worked best: hearing, plainly and often, the sentences I wanted
            to believe, in a calm voice, as if they were already mine. SleepCode is that, made carefully and openly,
            for anyone working on something that matters to them.
          </p>
          <p className="text-[15px]">- Peter D.</p>
        </div>
      </section>

      <section id="pricing" className="sc-band sc-section flex scroll-mt-4 flex-col gap-9">
        <div className="flex flex-col gap-[14px]">
          <span className="sc-eyebrow">Pricing</span>
          <h2 className="sc-h-section">Plain pricing.</h2>
        </div>
        <PricingPlans />
        <Link href="/pricing" className="sc-link self-start text-[16px]">
          See pricing details and questions
        </Link>
      </section>
    </>
  );
}

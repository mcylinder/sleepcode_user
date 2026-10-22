import Link from 'next/link';
import Rings from '@/components/ui/Rings';
import HeroCta from '@/components/site/HeroCta';
import HomeSessions from '@/components/site/HomeSessions';
import HomeSample from '@/components/site/HomeSample';

const STEPS = [
  {
    title: 'Choose one goal.',
    body: 'A steadier mood, focus at work, confidence when it counts. Each session is created for one specific goal.',
  },
  {
    title: 'Hear it in the first person.',
    body: 'Each statement is phrased with "I" ("I finish what I start") so you hear it as a statement about yourself, not a command to follow.',
  },
  {
    title: 'Follow the pulse.',
    body: 'A soft 111 Hz pulse, matched to the rhythm of the statements, gives your attention somewhere to rest, so they land without you analyzing them. Each statement is followed by a short pause.',
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
            Supraliminal means nothing is hidden. Pick a goal, press play as you drift off, and one calm voice speaks
            clear statements about it, set to a steady pulse.
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
          <p className="text-[17px] leading-[1.6] text-ink-muted">
            SleepCode isn&rsquo;t a sleep aid. You listen as you fall asleep because that&rsquo;s when your mind is
            quietest. The goal is the one you choose.
          </p>
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

      <HomeSample />

      <section id="sessions" className="sc-band sc-section flex scroll-mt-4 flex-col gap-9">
        <div className="flex flex-col gap-[14px]">
          <span className="sc-eyebrow">Sessions</span>
          <h2 className="sc-h-section">One free session now. More on the way.</h2>
        </div>
        <HomeSessions />
      </section>
    </>
  );
}

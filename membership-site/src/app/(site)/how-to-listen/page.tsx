import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How to listen \u2014 SleepCode',
  description: 'A few practical notes on getting the most from a SleepCode session.',
};

const SECTIONS = [
  {
    id: 'choose-one-goal',
    title: 'Choose one goal',
    body: 'Pick the session closest to what you are working on and stay with it for a while. Switching often makes repetition harder.',
  },
  {
    id: 'find-your-blend',
    title: 'Find your blend',
    body: 'The Instruction and Pulse slider sets how the voice sits against the pulse. Start around 60/40 and adjust until the words are easy to follow.',
  },
  {
    id: 'repeat-or-set-a-length',
    title: 'Repeat or set a length',
    body: 'Choose 1\u00d7, 2\u00d7 or 4\u00d7 repeats, or set a session length in hours and minutes. The countdown appears once a length is set.',
  },
  {
    id: 'keep-the-volume-low',
    title: 'Keep the volume low',
    body: 'A comfortable speaking volume is enough. Headphones help in shared rooms, but a speaker works fine.',
  },
  {
    id: 'dim-the-screen',
    title: 'Dim the screen',
    body: 'Night shade turns the screen fully black while the session keeps playing. Tap anywhere to wake it.',
  },
];

const num = (i: number) => String(i + 1).padStart(2, '0');

export default function HowToListenPage() {
  return (
    <>
      <div className="sc-px flex max-w-[760px] flex-col gap-[18px] pb-[clamp(32px,4vw,48px)] pt-[clamp(28px,5vw,72px)]">
        <span className="sc-eyebrow">Guide</span>
        <h1 className="sc-h-page">How to listen</h1>
        <p className="sc-lead">
          A few practical notes on getting the most from a session. None of it is required. Use what fits your day.
        </p>
      </div>

      <div className="sc-px grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] items-start gap-[clamp(28px,5vw,72px)] pb-[var(--pad-section)]">
        <nav className="flex flex-col wide:sticky wide:top-5" aria-label="On this page">
          <span className="sc-eyebrow sc-eyebrow--muted pb-[10px]">
            On this page
          </span>
          {SECTIONS.map((section, i) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="grid grid-cols-[30px_1fr] border-t border-hairline py-[10px] text-[15px]"
            >
              <span className="font-mono text-[12px] leading-[1.7] text-ink-muted">{num(i)}</span>
              <span>{section.title}</span>
            </a>
          ))}
        </nav>

        <div className="flex min-w-[min(100%,300px)] max-w-[680px] flex-col gap-[clamp(36px,4vw,52px)] wide:col-span-3">
          {SECTIONS.map((section, i) => (
            <section
              key={section.id}
              id={section.id}
              className="flex scroll-mt-5 flex-col gap-3 border-t border-[rgba(44,38,32,0.2)] pt-[22px]"
            >
              <span className="font-mono text-[13px] text-ink-muted">{num(i)}</span>
              <h2 className="text-[clamp(22px,2.2vw,27px)] font-semibold leading-[1.25] tracking-[-0.015em]">
                {section.title}
              </h2>
              <p className="text-[17px] leading-[1.7] text-ink-body">{section.body}</p>
            </section>
          ))}
          <div className="flex flex-col gap-[10px] border-y border-hairline-strong py-[22px]">
            <span className="text-[16px] font-semibold">A note on care</span>
            <p className="text-[16px] leading-[1.65] text-ink-muted">
              SleepCode is a tool for everyday habits of mind. It isn&rsquo;t medical treatment and isn&rsquo;t a
              substitute for professional support. If you&rsquo;re struggling, please talk to someone qualified.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

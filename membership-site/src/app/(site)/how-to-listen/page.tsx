import type { Metadata } from 'next';
import { pageMeta } from '@/lib/site';
import ListenCta from '@/components/site/ListenCta';
import { MixIcon, MoonIcon, RepeatIcon, SpeakerIcon, StopwatchIcon, WidthIcon } from '@/components/ui/icons';

export const metadata: Metadata = pageMeta(
  'How to listen',
  'A few practical notes on getting the most from a SleepCode session.',
);

// The rings from the logo: stands for "one goal".
function GoalGlyph({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// A miniature of the player's "Sessions this week" row.
function WeekGlyph() {
  const days = [1, 1, 0, 1, 0];
  return (
    <svg width={40} height={6} viewBox="0 0 40 6" aria-hidden="true">
      {days.map((on, i) => (
        <circle
          key={i}
          cx={3 + i * 8.5}
          cy={3}
          r={1.9}
          fill={on ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={1.1}
        />
      ))}
    </svg>
  );
}

type Item = { id: string; title: string; body: string; glyph: React.ReactNode };

// Names match the player: Level, Mix, Width, Repeat, Length, Night shade.
const GROUPS: { id: string; title: string; items: Item[] }[] = [
  {
    id: 'start-here',
    title: 'Start here',
    items: [
      {
        id: 'choose-one-goal',
        title: 'One goal',
        glyph: <GoalGlyph />,
        body: 'Choose the session that fits your goal and make it a habit. The more regularly you hear the same words, the more natural they can start to feel.',
      },
    ],
  },
  {
    id: 'adjust-the-sound',
    title: 'Adjust the sound',
    items: [
      {
        id: 'level',
        title: 'Level',
        glyph: <SpeakerIcon size={26} level={50} />,
        body: 'A comfortable speaking volume is enough. On a smartphone, set the ringer to “on” to hear the session audio. Do Not Disturb can be active.',
      },
      {
        id: 'mix',
        title: 'Mix',
        glyph: <MixIcon size={26} instruction={70} />,
        body: 'Mix balances the voice against the pulse. The pulse is there to gently carry the words, so start with the voice easy to hear, then find the balance you prefer.',
      },
      {
        id: 'width',
        title: 'Width',
        glyph: <WidthIcon size={26} width={66} />,
        body: 'Width sets how far the pulse alternates between your ears, from narrow to wide. This left-right rhythm is a form of auditory bilateral stimulation, which many people use to settle, ease physical tension and feel calmer.',
      },
      {
        id: 'repeat',
        title: 'Repeat',
        glyph: <RepeatIcon size={24} />,
        body: 'Repeat plays each affirmation once, twice or four times. Use whichever feels right.',
      },
      {
        id: 'length',
        title: 'Length',
        glyph: <StopwatchIcon size={24} />,
        body: 'Length sets how long the session runs.',
      },
    ],
  },
  {
    id: 'while-you-listen',
    title: 'While you listen',
    items: [
      {
        id: 'sessions-this-week',
        title: 'Sessions this week',
        glyph: <WeekGlyph />,
        body: 'The dots in the player light up on the days you listen, a quick look at how your week is going.',
      },
      {
        id: 'night-shade',
        title: 'Night shade',
        glyph: <MoonIcon size={24} />,
        body: 'Night shade turns the screen fully black while the session keeps playing. Tap anywhere to wake it.',
      },
    ],
  },
];

export default function HowToListenPage() {
  return (
    <div className="sc-px flex max-w-[760px] flex-col pb-[var(--pad-section)] pt-[clamp(28px,5vw,72px)]">
      <div className="flex flex-col gap-[18px] pb-[clamp(36px,5vw,56px)]">
        <h1 className="sc-h-page">How to listen</h1>
        <p className="sc-lead">A few practical notes for getting the most from a session.</p>
      </div>

      <div className="flex flex-col gap-[clamp(40px,5vw,60px)]">
        {GROUPS.map((group) => (
          <section key={group.id} id={group.id} aria-labelledby={`${group.id}-h`} className="flex scroll-mt-5 flex-col gap-2">
            <h2
              id={`${group.id}-h`}
              className="border-b border-hairline-strong pb-3 text-[clamp(22px,2.2vw,27px)] font-semibold leading-[1.25] tracking-[-0.015em]"
            >
              {group.title}
            </h2>
            <ul className="flex flex-col">
              {group.items.map((item) => (
                <li
                  key={item.id}
                  id={item.id}
                  className="grid scroll-mt-5 grid-cols-[40px_1fr] items-start gap-x-[14px] sm:grid-cols-[52px_1fr] sm:gap-x-[18px] border-b border-hairline py-[18px] last:border-b-0"
                >
                  <span
                    className="grid h-[40px] w-[40px] place-items-center rounded-[12px] sm:h-[52px] sm:w-[52px] sm:rounded-[14px] bg-surface text-accent"
                    aria-hidden="true"
                  >
                    {item.glyph}
                  </span>
                  <div className="flex flex-col gap-1 pt-[3px]">
                    <h3 className="text-[18px] font-semibold leading-[1.35]">{item.title}</h3>
                    <p className="text-[16px] leading-[1.65] text-ink-body">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <ListenCta />

        <p className="text-[14px] leading-[1.6] text-ink-muted">
          <span className="font-semibold text-ink-body">A note on care. </span>
          SleepCode is a tool for everyday habits of mind. It isn&rsquo;t medical treatment and isn&rsquo;t a substitute
          for professional support. If you&rsquo;re having a hard time, please reach out to a qualified professional.
        </p>
      </div>
    </div>
  );
}

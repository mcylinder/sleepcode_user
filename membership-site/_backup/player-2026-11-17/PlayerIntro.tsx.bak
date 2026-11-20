'use client';

import Link from 'next/link';
import { markPlayerIntroSeen } from '@/lib/visitFlags';

const TIPS = [
  {
    title: 'Set a length.',
    body: 'Choose how long it runs, up to 10 hours. It stops on its own.',
  },
  {
    title: 'Voice.',
    body: 'Set how much voice you hear over the pulse.',
  },
  {
    title: 'Pulse width.',
    body: 'Spreads the pulse from the center to both ears; wider works best with headphones.',
  },
  {
    title: 'Choose repeats.',
    body: 'Hear each affirmation once, twice or four times.',
  },
  {
    title: 'Keep it low.',
    body: 'A quiet, comfortable volume is enough.',
  },
  {
    title: 'Go dark.',
    body: 'Night shade blacks out the screen. Tap anywhere to wake it.',
  },
];

// First-visit tips as an inline strip. Does not block play.
export default function PlayerIntro({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  const dismiss = () => {
    markPlayerIntroSeen();
    onClose();
  };

  return (
    <div
      className="w-full rounded-[16px] border border-p-chip-border bg-p-sheet px-4 py-4 text-p-fg"
      role="region"
      aria-labelledby="player-intro-title"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 id="player-intro-title" className="text-[16px] font-semibold tracking-[-0.01em]">
          Before you start
        </h2>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-[13px] font-semibold text-p-accent"
        >
          Got it
        </button>
      </div>
      <ul className="mt-3 flex flex-col gap-2.5">
        {TIPS.map((tip) => (
          <li key={tip.title} className="flex flex-col gap-0.5">
            <span className="text-[13px] font-semibold">{tip.title}</span>
            <span className="text-[13px] leading-[1.45] text-p-muted">{tip.body}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/how-to-listen"
        className="mt-3 inline-block text-[13px] font-medium text-p-muted underline underline-offset-4"
      >
        Full listening guide
      </Link>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { markPlayerIntroSeen } from '@/lib/visitFlags';

const TIPS = [
  {
    title: 'Set a length.',
    body: 'Choose how long it runs, up to 10 hours. It stops on its own.',
  },
  {
    title: 'Find your balance.',
    body: 'Slide toward Instruction to hear the words more, toward Pulse to hear the beat more.',
  },
  {
    title: 'Choose repeats.',
    body: 'Hear each statement once, twice or four times.',
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

// In-player first-visit help. Does not stop audio. Esc / outside / Got it dismisses.
export default function PlayerIntro({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        markPlayerIntroSeen();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const dismiss = () => {
    markPlayerIntroSeen();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[rgba(6,10,10,0.72)] px-4 pb-[calc(24px+env(safe-area-inset-bottom,0px))] pt-10 sm:items-center sm:pb-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-intro-title"
      onClick={dismiss}
    >
      <div
        className="w-full max-w-[420px] rounded-[18px] bg-p-sheet p-6 text-p-fg shadow-[0_24px_60px_-28px_rgba(0,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="player-intro-title" className="text-[20px] font-semibold tracking-[-0.015em]">
          Before you start
        </h2>
        <ul className="mt-5 flex flex-col gap-4">
          {TIPS.map((tip) => (
            <li key={tip.title} className="flex flex-col gap-1">
              <span className="text-[15px] font-semibold">{tip.title}</span>
              <span className="text-[14px] leading-[1.55] text-p-muted">{tip.body}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button type="button" onClick={dismiss} className="min-h-[44px] rounded-full bg-p-accent px-5 text-[15px] font-semibold text-p-on-accent">
            Got it
          </button>
          <Link href="/how-to-listen" className="text-[14px] font-medium text-p-muted underline underline-offset-4">
            Full listening guide
          </Link>
        </div>
      </div>
    </div>
  );
}

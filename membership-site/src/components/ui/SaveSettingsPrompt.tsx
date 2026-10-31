'use client';

import Link from 'next/link';
import { dismissAccountPrompt } from '@/lib/visitFlags';

// Centered card after a session ends (or on the next visit after mid-session leave).
// Never shown during playback or Night shade.
export default function SaveSettingsPrompt({
  open,
  onClose,
  nextHref,
}: {
  open: boolean;
  onClose: () => void;
  nextHref: string;
}) {
  if (!open) return null;

  const dismiss = () => {
    dismissAccountPrompt();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-[rgba(6,10,10,0.55)] px-4"
      role="status"
      aria-live="polite"
      onClick={dismiss}
    >
      <div
        className="w-full max-w-[400px] rounded-[18px] border border-p-chip-border bg-p-sheet p-6 text-p-fg shadow-[0_24px_60px_-28px_rgba(0,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2">
          <span className="text-[18px] font-semibold tracking-[-0.015em]">Pick up where you left off.</span>
          <span className="text-[14px] leading-[1.55] text-p-muted">
            A free account keeps your settings and progress wherever you listen.
          </span>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link
            href={`/login?mode=signup&next=${encodeURIComponent(nextHref)}`}
            className="min-h-[44px] rounded-full bg-p-accent px-5 text-[14px] font-semibold leading-[44px] text-p-on-accent"
          >
            Create free account
          </Link>
          <button type="button" onClick={dismiss} className="min-h-[44px] text-[14px] font-medium text-p-muted">
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

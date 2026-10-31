'use client';

import { useEffect } from 'react';
import type { ScriptConcept } from '@/lib/audio/playPlan';

const num = (n: number) => String(n).padStart(2, '0');

// In-player list of every statement (from the session's manifest). Audio keeps playing.
// Esc, the Close button, or a tap outside the panel dismisses it.
export default function StatementsOverlay({
  open,
  onClose,
  title,
  concepts,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  concepts: ScriptConcept[];
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const count = concepts.reduce((n, c) => n + c.lines.length, 0);

  return (
    <div
      className="fixed inset-0 z-40 flex justify-center bg-[rgba(4,7,7,0.9)] px-4 pt-[calc(16px+env(safe-area-inset-top,0px))] pb-[calc(16px+env(safe-area-inset-bottom,0px))]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="statements-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-full w-full max-w-[560px] flex-col text-p-fg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-4 pt-2">
          <div className="flex flex-col gap-1">
            <h2 id="statements-title" className="text-[20px] font-semibold tracking-[-0.015em]">
              Transcript
            </h2>
            <p className="text-[13px] text-p-muted">
              {title} &middot; {count} statements, played in a shuffled order
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] shrink-0 rounded-full border border-p-chip-border px-4 text-[14px] font-medium"
          >
            Close
          </button>
        </div>

        <ol className="flex-1 overflow-y-auto overscroll-contain pb-6">
          {concepts.map((concept, i) => (
            <li
              key={concept.id}
              className="grid grid-cols-[28px_1fr] gap-3 border-t border-[rgba(255,255,255,0.08)] py-4"
            >
              <span className="pt-[3px] font-mono text-[12px] text-p-muted">{num(i + 1)}</span>
              <div className="flex flex-col gap-[6px]">
                {concept.title && <span className="text-[12px] font-semibold text-p-muted">{concept.title}</span>}
                {concept.lines.map((line, j) => (
                  <p key={j} className="text-[16px] leading-[1.55]">
                    {line}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

const TRANSITION_MS = 700;

// Bottom sheet: the scrim fades in while the panel rises 40px. `tone` picks the sand site
// palette or the dark player palette. Stays mounted through the closing fade.
export default function Sheet({
  open,
  onClose,
  label,
  tone = 'site',
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  tone?: 'site' | 'player';
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }
    setShown(false);
    const timer = setTimeout(() => setMounted(false), TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const player = tone === 'player';
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      style={{
        background: player ? 'var(--p-scrim)' : 'rgba(44, 38, 32, 0.42)',
        opacity: shown ? 1 : 0,
        pointerEvents: shown ? 'auto' : 'none',
        transition: `opacity ${TRANSITION_MS}ms ease`,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`sc-sheet-panel box-border flex w-full max-w-[520px] flex-col gap-5 rounded-t-[22px] px-6 pb-[calc(34px+env(safe-area-inset-bottom,0px))] pt-[22px] ${
          player ? 'bg-p-sheet text-p-fg' : 'bg-bg text-ink'
        }`}
        style={{
          transform: shown ? 'translateY(0)' : 'translateY(40px)',
          transition: `transform ${TRANSITION_MS}ms var(--ease-sheet)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Title row with a Cancel action, shared by every sheet.
export function SheetHeader({ title, onCancel, tone = 'site' }: { title: string; onCancel: () => void; tone?: 'site' | 'player' }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[18px] font-semibold">{title}</span>
      <button
        type="button"
        onClick={onCancel}
        className={`min-h-[44px] text-[15px] font-medium ${tone === 'player' ? 'text-p-muted' : 'text-ink-muted'}`}
      >
        Cancel
      </button>
    </div>
  );
}

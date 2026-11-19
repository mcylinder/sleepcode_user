'use client';

import { useEffect, useRef } from 'react';

const ROW = 44;
const VISIBLE = 5;

// A scroll wheel like a phone's timer picker. Swipe or scroll to spin; it snaps to the
// nearest row. Tap a row to jump to it. Arrow keys step through values.
export default function WheelPicker({
  options,
  value,
  onChange,
  format,
  label,
  unit,
}: {
  options: number[];
  value: number;
  onChange: (value: number) => void;
  format: (value: number) => string;
  label: string;
  unit: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const index = Math.max(0, options.indexOf(value));

  // Keep the wheel on the current value (first render, or when it changes from outside).
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const target = index * ROW;
    if (Math.abs(el.scrollTop - target) > 2) el.scrollTop = target;
  }, [index]);

  useEffect(() => () => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
  }, []);

  const onScroll = () => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const el = listRef.current;
      if (!el) return;
      const i = Math.min(options.length - 1, Math.max(0, Math.round(el.scrollTop / ROW)));
      if (options[i] !== value) onChange(options[i]);
    }, 90);
  };

  const step = (delta: number) => {
    const i = Math.min(options.length - 1, Math.max(0, index + delta));
    listRef.current?.scrollTo({ top: i * ROW, behavior: 'smooth' });
    onChange(options[i]);
  };

  return (
    <div className="relative flex-1" style={{ height: ROW * VISIBLE }}>
      {/* Selection band */}
      <div
        className="pointer-events-none absolute inset-x-0 rounded-[12px] bg-[rgba(231,225,214,0.08)]"
        style={{ top: ROW * 2, height: ROW }}
      />
      <span
        className="pointer-events-none absolute right-3 z-10 flex items-center text-[14px] text-p-muted"
        style={{ top: ROW * 2, height: ROW }}
      >
        {unit}
      </span>
      <div
        ref={listRef}
        role="spinbutton"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={options[0]}
        aria-valuemax={options[options.length - 1]}
        aria-valuenow={value}
        aria-valuetext={`${format(value)} ${unit}`}
        onScroll={onScroll}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') step(1);
          else if (e.key === 'ArrowUp') step(-1);
          else return;
          e.preventDefault();
        }}
        className="sc-no-scrollbar h-full snap-y snap-mandatory overflow-y-scroll overscroll-contain rounded-[12px] outline-none focus-visible:outline-2 focus-visible:outline-p-accent"
        style={{
          paddingTop: ROW * 2,
          paddingBottom: ROW * 2,
          maskImage: 'linear-gradient(to bottom, transparent, #000 30%, #000 70%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 30%, #000 70%, transparent)',
        }}
      >
        {options.map((option, i) => {
          const selected = i === index;
          return (
            <button
              key={option}
              type="button"
              tabIndex={-1}
              onClick={() => step(i - index)}
              className={`flex w-full snap-center items-center justify-center font-mono tabular-nums transition-colors ${
                selected ? 'text-[26px] text-p-fg' : 'text-[20px] text-p-muted'
              }`}
              style={{ height: ROW }}
            >
              {format(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

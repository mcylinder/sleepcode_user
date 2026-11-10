'use client';

import { useCallback, useRef } from 'react';
import { SpeakerIcon } from '@/components/ui/icons';

function valueFromClientX(clientX: number, el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0) return 0;
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  return Math.round(ratio * 100);
}

function ContentRow({ volume, className }: { volume: number; className: string }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-between px-[18px] ${className}`}>
      <SpeakerIcon size={22} level={volume} />
      <span className="text-[18px] font-semibold tabular-nums">{volume}%</span>
    </div>
  );
}

export default function VolumeFill({
  volume,
  onChange,
}: {
  volume: number;
  onChange: (volume: number) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromEvent = useCallback(
    (clientX: number) => {
      const el = barRef.current;
      if (!el) return;
      onChange(valueFromClientX(clientX, el));
    },
    [onChange],
  );

  return (
    <div
      ref={barRef}
      role="slider"
      tabIndex={0}
      aria-label="Volume"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={volume}
      aria-valuetext={`${volume}%`}
      className="relative h-[60px] touch-none overflow-hidden rounded-[18px] bg-p-well outline-none"
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        setFromEvent(e.clientX);
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        setFromEvent(e.clientX);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          onChange(Math.min(100, volume + 5));
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          onChange(Math.max(0, volume - 5));
        } else if (e.key === 'Home') {
          e.preventDefault();
          onChange(0);
        } else if (e.key === 'End') {
          e.preventDefault();
          onChange(100);
        }
      }}
    >
      <ContentRow volume={volume} className="text-p-fg" />
      <div
        className="absolute inset-0 bg-p-accent"
        style={{ clipPath: `inset(0 ${100 - volume}% 0 0)` }}
        aria-hidden="true"
      >
        <ContentRow volume={volume} className="text-p-on-accent" />
      </div>
    </div>
  );
}

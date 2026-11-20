'use client';

import { useCallback, useRef } from 'react';
import { PulseIcon, VoiceIcon } from '@/components/ui/icons';

const N = 20;

function lerpChannel(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function lerpRgb(a: [number, number, number], b: [number, number, number], t: number): string {
  return `rgb(${lerpChannel(a[0], b[0], t)}, ${lerpChannel(a[1], b[1], t)}, ${lerpChannel(a[2], b[2], t)})`;
}

// Voice (teal): brightest next to the voice icon (left), deepening to the right.
function voiceColor(i: number): string {
  const t = 1 - i / (N - 1);
  return lerpRgb([56, 96, 92], [176, 224, 218], t);
}

// Pulse (gray): brightest next to the pulse icon (right), deepening to the left.
function pulseColor(i: number): string {
  const t = i / (N - 1);
  return lerpRgb([62, 72, 70], [168, 174, 171], t);
}

// Site (light page): same boundary logic, ink/accent palette.
function siteVoiceColor(i: number): string {
  const t = 1 - i / (N - 1);
  return lerpRgb([45, 90, 84], [90, 140, 132], t);
}

function sitePulseColor(i: number): string {
  const t = i / (N - 1);
  return lerpRgb([180, 176, 168], [120, 118, 112], t);
}

function valueFromClientX(clientX: number, el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0) return 0;
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  return Math.min(100, Math.max(0, Math.round(ratio * N) * 5));
}

export default function VoiceSteps({
  instruction,
  onChange,
  tone = 'player',
  showHeader = true,
}: {
  instruction: number;
  onChange: (instruction: number) => void;
  tone?: 'site' | 'player';
  showHeader?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const player = tone === 'player';
  const voiceSteps = Math.round(instruction / 5);

  const setFromEvent = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      onChange(valueFromClientX(clientX, el));
    },
    [onChange],
  );

  return (
    <div className="flex flex-col gap-3">
      <span className={`text-[14px] ${player ? 'text-p-muted' : 'text-ink-muted'}`}>Voice to pulse blend</span>
      {showHeader && (
        <div className={`text-[20px] font-semibold tabular-nums ${player ? 'text-p-fg' : 'text-ink'}`}>
          {instruction}%
        </div>
      )}
      <div className="flex items-center gap-2.5">
        <VoiceIcon size={22} className={player ? 'text-p-accent' : 'text-accent'} />
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label="Voice level"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={instruction}
          aria-valuetext={`Voice ${instruction}%`}
          className="flex h-8 flex-1 touch-none gap-[3px] outline-none"
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
              onChange(Math.min(100, instruction + 5));
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
              e.preventDefault();
              onChange(Math.max(0, instruction - 5));
            } else if (e.key === 'Home') {
              e.preventDefault();
              onChange(0);
            } else if (e.key === 'End') {
              e.preventDefault();
              onChange(100);
            }
          }}
        >
          {Array.from({ length: N }, (_, i) => {
            const teal = i < voiceSteps;
            const background = player
              ? teal
                ? voiceColor(i)
                : pulseColor(i)
              : teal
                ? siteVoiceColor(i)
                : sitePulseColor(i);
            return <div key={i} className="h-full flex-1 rounded-[4px]" style={{ background }} />;
          })}
        </div>
        <PulseIcon size={22} className={player ? 'text-p-fg' : 'text-ink'} />
      </div>
    </div>
  );
}

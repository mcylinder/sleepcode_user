'use client';

import { useRef } from 'react';

const STEP = 5;

// Instruction / Pulse blend. `instruction` is 0-100; Pulse is the remainder. The track runs
// from all instruction (left) to all pulse (right). Drag anywhere on it, or use the arrow keys.
export default function BlendSlider({
  instruction,
  onChange,
  tone,
}: {
  instruction: number;
  onChange: (instruction: number) => void;
  tone: 'site' | 'player';
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const player = tone === 'player';
  const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value)));
  const pulse = 100 - instruction;

  const setFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    onChange(clamp(100 - ((clientX - rect.left) / rect.width) * 100));
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className={`flex justify-between text-[13px] ${player ? 'text-p-muted' : 'text-ink-muted'}`}>
        <span>
          Instruction <span className="font-mono">{instruction}%</span>
        </span>
        <span>
          Pulse <span className="font-mono">{pulse}%</span>
        </span>
      </div>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Pulse share of the blend"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pulse}
        aria-valuetext={`Instruction ${instruction}%, pulse ${pulse}%`}
        className={`relative flex h-6 cursor-pointer touch-none items-center rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 ${
          player ? 'focus-visible:outline-p-accent' : 'focus-visible:outline-accent'
        }`}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) setFromClientX(e.clientX);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange(clamp(instruction + STEP));
          else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange(clamp(instruction - STEP));
          else return;
          e.preventDefault();
        }}
      >
        <div className={`absolute inset-x-0 h-[2px] ${player ? 'bg-p-track' : 'bg-hairline-strong'}`} />
        <div className={`absolute left-0 h-[2px] ${player ? 'bg-p-accent' : 'bg-accent'}`} style={{ width: `${pulse}%` }} />
        <div
          className={`absolute -ml-2 h-4 w-4 rounded-full ${player ? 'bg-p-fg' : 'bg-ink'}`}
          style={{ left: `${pulse}%` }}
        />
      </div>
    </div>
  );
}

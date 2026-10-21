'use client';

import { useRef } from 'react';

const STEP = 5;
// 0 at bottom, increasing clockwise over 270°. Top gap is a hard stop.
const START_DEG = 90;
const SWEEP_DEG = 270;
const JUMP_LIMIT = 50;

function clampVolume(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function clockwiseFromStart(deg: number) {
  let d = deg - START_DEG;
  if (d < 0) d += 360;
  return d;
}

function valueFromPoint(clientX: number, clientY: number, rect: DOMRect, previous: number) {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const deg = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
  const fromStart = clockwiseFromStart(deg);

  // Dead zone: hold whichever end this drag was already against. Never cross 0 ↔ 100.
  if (fromStart > SWEEP_DEG) return previous <= 50 ? 0 : 100;

  const next = clampVolume((fromStart / SWEEP_DEG) * 100);
  if (Math.abs(next - previous) > JUMP_LIMIT) return previous <= 50 ? 0 : 100;
  return next;
}

// Solid disc that rotates. A thin radial mark reaches the rim; the value lives in the label.
export default function VolumeKnob({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragValue = useRef(clampVolume(value));
  const volume = clampVolume(value);
  const turn = (volume / 100) * SWEEP_DEG;

  const setFromEvent = (clientX: number, clientY: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const next = valueFromPoint(clientX, clientY, rect, dragValue.current);
    dragValue.current = next;
    onChange(next);
  };

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label="Volume"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={volume}
      aria-valuetext={`${volume}%`}
      className="relative h-[64px] w-[64px] flex-none touch-none outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-p-accent"
      onPointerDown={(e) => {
        dragValue.current = volume;
        e.currentTarget.setPointerCapture(e.pointerId);
        setFromEvent(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) setFromEvent(e.clientX, e.clientY);
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange(clampVolume(volume - STEP));
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange(clampVolume(volume + STEP));
        else if (e.key === 'Home') onChange(0);
        else if (e.key === 'End') onChange(100);
        else return;
        e.preventDefault();
      }}
    >
      <div
        className="absolute inset-0 rounded-full bg-p-accent"
        style={{ transform: `rotate(${turn}deg)` }}
        aria-hidden="true"
      >
        <span className="absolute bottom-0 left-1/2 h-[22px] w-px -translate-x-1/2 bg-p-on-accent" />
      </div>
    </div>
  );
}

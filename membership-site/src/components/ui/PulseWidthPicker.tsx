'use client';

import { PULSE_WIDTH_OPTIONS, pulseWidthLabel, type PulseWidth } from '@/lib/audio/pulseWidth';

export default function PulseWidthPicker({
  selected,
  onSelect,
  tone = 'site',
}: {
  selected: PulseWidth;
  onSelect: (width: PulseWidth) => void;
  tone?: 'site' | 'player';
}) {
  const player = tone === 'player';
  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label="Pulse width">
      {PULSE_WIDTH_OPTIONS.map((width) => {
        const isSelected = width === selected;
        return (
          <button
            key={width}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(width)}
            className={`flex min-h-[48px] items-center rounded-[14px] border px-4 text-left text-[16px] font-semibold ${
              isSelected
                ? player
                  ? 'border-p-accent bg-p-accent/15 text-p-fg'
                  : 'border-accent bg-accent/10 text-ink'
                : player
                  ? 'border-p-chip-border bg-transparent text-p-fg'
                  : 'border-hairline bg-bg-alt text-ink'
            }`}
          >
            {pulseWidthLabel(width)}
          </button>
        );
      })}
    </div>
  );
}

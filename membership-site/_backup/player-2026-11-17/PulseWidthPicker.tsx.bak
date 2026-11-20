'use client';

import { PulseWidthGlyph } from '@/components/ui/icons';
import { PULSE_WIDTH_OPTIONS, pulseWidthLabel, type PulseWidth } from '@/lib/audio/pulseWidth';

export default function PulseWidthPicker({
  selected,
  onSelect,
  tone = 'site',
  layout = 'list',
}: {
  selected: PulseWidth;
  onSelect: (width: PulseWidth) => void;
  tone?: 'site' | 'player';
  layout?: 'list' | 'glyphs';
}) {
  const player = tone === 'player';

  if (layout === 'glyphs') {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className={`text-[14px] ${player ? 'text-p-muted' : 'text-ink-muted'}`}>Pulse width</span>
          <span className={`text-[13px] leading-snug ${player ? 'text-p-muted' : 'text-ink-muted'}`}>
            Spreads the pulse from the center to both ears; wider works best with headphones.
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Pulse width">
          {PULSE_WIDTH_OPTIONS.map((width) => {
            const isSelected = width === selected;
            return (
              <button
                key={width}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelect(width)}
                className={`flex h-[60px] flex-col items-center justify-center gap-2 rounded-xl border text-[13px] ${
                  isSelected
                    ? player
                      ? 'border-transparent bg-p-fg font-semibold text-p-on-accent'
                      : 'border-transparent bg-ink font-semibold text-on-accent'
                    : player
                      ? 'border-p-chip-border bg-transparent text-p-fg'
                      : 'border-hairline bg-transparent text-ink'
                }`}
              >
                <PulseWidthGlyph
                  width={width}
                  track={
                    isSelected
                      ? player
                        ? 'rgba(14, 22, 21, 0.28)'
                        : 'rgba(20, 24, 22, 0.28)'
                      : undefined
                  }
                  fill={isSelected ? (player ? 'var(--p-on-accent)' : 'var(--ink)') : undefined}
                />
                {pulseWidthLabel(width)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

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
            className={`flex min-h-[48px] items-center gap-3 rounded-[14px] border px-4 text-left text-[16px] font-semibold ${
              isSelected
                ? player
                  ? 'border-p-accent bg-p-accent/15 text-p-fg'
                  : 'border-accent bg-accent/10 text-ink'
                : player
                  ? 'border-p-chip-border bg-transparent text-p-fg'
                  : 'border-hairline bg-bg-alt text-ink'
            }`}
          >
            <PulseWidthGlyph
              width={width}
              track={player ? 'var(--p-step-outline)' : 'var(--hairline-strong)'}
              fill={player ? 'var(--p-accent)' : 'var(--accent)'}
            />
            {pulseWidthLabel(width)}
          </button>
        );
      })}
    </div>
  );
}

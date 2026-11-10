'use client';

import {
  PulseWidthGlyph,
  RepeatIcon,
  SpeakerIcon,
  StopwatchIcon,
  VoiceIcon,
} from '@/components/ui/icons';
import PulseWidthPicker from '@/components/ui/PulseWidthPicker';
import VoiceSteps from '@/components/ui/VoiceSteps';
import VolumeFill from '@/components/ui/VolumeFill';
import { pulseWidthLabel, type PulseWidth } from '@/lib/audio/pulseWidth';
import {
  REPEAT_OPTIONS,
  REPEAT_TILE_LABELS,
  fmtLength,
  type RepeatCount,
} from '@/lib/playerPrefs';

export type PlayerPanel = 'voice' | 'width' | 'repeat' | 'volume' | null;

const REPEAT_DOTS: Record<RepeatCount, number> = { 1: 1, 2: 2, 4: 4 };

export default function PlayerTiles({
  open,
  onOpenChange,
  lengthMinutes,
  instruction,
  pulseWidth,
  repeat,
  volume,
  onOpenLength,
  onInstruction,
  onPulseWidth,
  onRepeat,
  onVolume,
}: {
  open: PlayerPanel;
  onOpenChange: (panel: PlayerPanel) => void;
  lengthMinutes: number | null;
  instruction: number;
  pulseWidth: PulseWidth;
  repeat: RepeatCount;
  volume: number;
  onOpenLength: () => void;
  onInstruction: (value: number) => void;
  onPulseWidth: (value: PulseWidth) => void;
  onRepeat: (value: RepeatCount) => void;
  onVolume: (value: number) => void;
}) {
  const toggle = (panel: Exclude<PlayerPanel, null>) => {
    onOpenChange(open === panel ? null : panel);
  };

  const tileClass = (active: boolean) =>
    `flex h-[72px] flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl text-p-fg ${
      active
        ? 'border-[1.5px] border-p-accent bg-p-tile-active'
        : 'border border-p-panel-border bg-p-panel'
    }`;

  return (
    <div className="flex w-full flex-col gap-2.5">
      {open && (
        <div className="flex flex-col gap-3 rounded-[18px] border border-p-panel-border bg-p-panel p-4">
          {open === 'voice' && (
            <VoiceSteps instruction={instruction} onChange={onInstruction} tone="player" />
          )}
          {open === 'width' && (
            <PulseWidthPicker selected={pulseWidth} onSelect={onPulseWidth} tone="player" layout="glyphs" />
          )}
          {open === 'repeat' && (
            <div className="flex flex-col gap-3">
              <span className="text-[14px] text-p-muted">Repeat each affirmation</span>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Repeat each affirmation">
                {REPEAT_OPTIONS.map((count) => {
                  const selected = repeat === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => onRepeat(count)}
                      className={`flex h-[60px] flex-col items-center justify-center gap-1.5 rounded-xl border text-[14px] ${
                        selected
                          ? 'border-transparent bg-p-fg font-semibold text-p-on-accent'
                          : 'border-p-chip-border bg-transparent text-p-fg'
                      }`}
                    >
                      <span className="flex gap-1" aria-hidden="true">
                        {Array.from({ length: REPEAT_DOTS[count] }, (_, i) => (
                          <span
                            key={i}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: selected ? 'var(--p-on-accent)' : 'var(--p-fg)' }}
                          />
                        ))}
                      </span>
                      {count === 1 ? 'Once' : count === 2 ? 'Twice' : 'Four times'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {open === 'volume' && <VolumeFill volume={volume} onChange={onVolume} />}
        </div>
      )}

      <div className="flex gap-2">
        <button type="button" onClick={onOpenLength} className={tileClass(false)} aria-label="Session length">
          <StopwatchIcon size={18} />
          <span className="text-[13px] leading-none">{fmtLength(lengthMinutes)}</span>
        </button>
        <button
          type="button"
          aria-expanded={open === 'voice'}
          onClick={() => toggle('voice')}
          className={tileClass(open === 'voice')}
        >
          <VoiceIcon size={18} className="text-p-accent" />
          <span className="text-[13px] leading-none tabular-nums">{instruction}%</span>
        </button>
        <button
          type="button"
          aria-expanded={open === 'width'}
          onClick={() => toggle('width')}
          className={tileClass(open === 'width')}
        >
          <PulseWidthGlyph width={pulseWidth} />
          <span className="text-[13px] leading-none">{pulseWidthLabel(pulseWidth)}</span>
        </button>
        <button
          type="button"
          aria-expanded={open === 'repeat'}
          onClick={() => toggle('repeat')}
          className={tileClass(open === 'repeat')}
        >
          <RepeatIcon size={18} />
          <span className="text-[13px] leading-none">{REPEAT_TILE_LABELS[repeat]}</span>
        </button>
        <button
          type="button"
          aria-expanded={open === 'volume'}
          onClick={() => toggle('volume')}
          className={tileClass(open === 'volume')}
        >
          <SpeakerIcon size={18} level={volume} />
          <span className="text-[13px] leading-none tabular-nums">{volume}%</span>
        </button>
      </div>
    </div>
  );
}

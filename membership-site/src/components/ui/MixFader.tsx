'use client';

import type { BackgroundGroup } from '@/lib/backgrounds';
import { backgroundShare, mixReadout } from '@/lib/playerPrefs';
import { MusicNoteIcon, NatureIcon, PulseIcon, VoiceIcon } from './icons';

function GroupIcon({ group, size = 16 }: { group: BackgroundGroup; size?: number }) {
  if (group === 'nature') return <NatureIcon size={size} />;
  if (group === 'music') return <MusicNoteIcon size={size} />;
  return <PulseIcon size={size} />;
}

export default function MixFader({
  voiceMix,
  backgroundName,
  backgroundGroup,
  onChange,
  disabled = false,
}: {
  voiceMix: number;
  backgroundName: string;
  backgroundGroup: BackgroundGroup;
  onChange: (voiceMix: number) => void;
  disabled?: boolean;
}) {
  const bgShare = backgroundShare(voiceMix);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between gap-3 text-[13px] text-p-muted">
        <span className="flex items-center gap-1.5 font-medium text-p-fg">
          <VoiceIcon size={16} />
          Voice
        </span>
        <span className="font-mono text-[12px] tabular-nums text-p-muted">{mixReadout(voiceMix)}</span>
        <span className="flex items-center gap-1.5 font-medium text-p-fg">
          {backgroundName}
          <GroupIcon group={backgroundGroup} size={16} />
        </span>
      </div>
      <div className="relative h-[22px]">
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-p-track" />
        <div
          className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-p-accent"
          style={{ width: `${bgShare}%` }}
        />
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={bgShare}
          disabled={disabled}
          aria-label="Mix voice and background"
          aria-valuetext={mixReadout(voiceMix)}
          onChange={(e) => onChange(100 - Number(e.target.value))}
          className="absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none bg-transparent disabled:cursor-default [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-p-fg [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,.5)] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-p-fg"
        />
      </div>
    </div>
  );
}

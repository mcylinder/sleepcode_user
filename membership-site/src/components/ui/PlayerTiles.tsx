'use client';

import { MixIcon, RepeatIcon, SpeakerIcon, StopwatchIcon, WidthIcon } from '@/components/ui/icons';
import { REPEAT_TILE_LABELS, type RepeatCount } from '@/lib/playerPrefs';
import { pulseWidthLabel, type PulseWidth } from '@/lib/audio/pulseWidth';

// Every player control opens the same bottom sheet; this type names which one is open.
export type PlayerPanel = 'length' | 'sound' | 'repeat' | 'narrator' | null;

type TileId = Exclude<PlayerPanel, 'narrator' | null>;

// The three everyday controls. Each tile shows the same two lines: what it is, and its value.
export default function PlayerTiles({
  open,
  onOpen,
  lengthLabel,
  lengthTitle = 'Length',
  repeat,
  volume,
  instruction,
  pulseWidth,
}: {
  open: PlayerPanel;
  onOpen: (panel: TileId) => void;
  lengthLabel: string;
  lengthTitle?: string;
  repeat: RepeatCount;
  volume: number;
  instruction: number;
  pulseWidth: PulseWidth;
}) {
  const soundSpoken = `Level ${volume}%, mix voice ${instruction} pulse ${100 - instruction}, width ${pulseWidthLabel(pulseWidth)}`;
  const tiles: { id: TileId; label: string; value: React.ReactNode; spoken: string; icon: React.ReactNode }[] = [
    { id: 'length', label: lengthTitle, value: lengthLabel, spoken: lengthLabel, icon: <StopwatchIcon size={18} /> },
    {
      id: 'sound',
      label: 'Sound',
      value: null,
      spoken: soundSpoken,
      icon: (
        <span className="flex items-start gap-[12px] pb-[2px] sm:gap-[18px]">
          {[
            { name: 'Level', glyph: <SpeakerIcon size={18} level={volume} /> },
            { name: 'Mix', glyph: <MixIcon size={18} instruction={instruction} /> },
            { name: 'Width', glyph: <WidthIcon size={18} width={pulseWidth} /> },
          ].map((part) => (
            <span key={part.name} className="flex flex-col items-center gap-[6px]">
              {part.glyph}
              <span className="text-[10px] leading-none text-p-muted">{part.name}</span>
            </span>
          ))}
        </span>
      ),
    },
    {
      id: 'repeat',
      label: 'Repetition',
      value: REPEAT_TILE_LABELS[repeat],
      spoken: REPEAT_TILE_LABELS[repeat],
      icon: <RepeatIcon size={18} />,
    },
  ];

  return (
    <div className="grid w-full grid-cols-3 gap-2">
      {tiles.map((tile) => {
        const active = open === tile.id;
        return (
          <button
            key={tile.id}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={active}
            aria-label={`${tile.label}: ${tile.spoken}`}
            onClick={() => onOpen(tile.id)}
            className={`flex h-[96px] min-w-0 flex-col items-center justify-center gap-[9px] rounded-2xl text-p-fg ${
              active ? 'border-[1.5px] border-p-accent bg-p-tile-active' : 'border border-p-panel-border bg-p-panel'
            }`}
          >
            <span className="text-p-accent">{tile.icon}</span>
            <span className="text-[11px] uppercase leading-none tracking-[0.08em] text-p-muted">{tile.label}</span>
            {tile.value !== null && (
              <span className="max-w-full truncate px-1 text-[13px] leading-none tabular-nums">{tile.value}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}


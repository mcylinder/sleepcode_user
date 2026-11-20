'use client';

import type { Voice } from '@/lib/catalog';

// Shared voice list for the first-play sheet and Account → Defaults.
export default function VoicePicker({
  voices,
  selectedId,
  onSelect,
  tone = 'site',
}: {
  voices: Voice[];
  selectedId: string | null;
  onSelect: (voiceId: string) => void;
  tone?: 'site' | 'player';
}) {
  const player = tone === 'player';
  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label="Voice">
      {voices.map((voice) => {
        const selected = voice.id === selectedId;
        return (
          <button
            key={voice.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(voice.id)}
            className={`flex min-h-[56px] flex-col items-start gap-1 rounded-[14px] border px-4 py-3 text-left ${
              selected
                ? player
                  ? 'border-p-accent bg-p-accent/15'
                  : 'border-accent bg-accent/10'
                : player
                  ? 'border-p-chip-border bg-transparent'
                  : 'border-hairline bg-bg-alt'
            }`}
          >
            <span className={`text-[16px] font-semibold ${player ? 'text-p-fg' : 'text-ink'}`}>{voice.name}</span>
            <span className={`text-[13px] leading-snug ${player ? 'text-p-muted' : 'text-ink-muted'}`}>
              {voice.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}

'use client';

import Rings from '@/components/ui/Rings';
import { PauseIcon, PlayIcon } from '@/components/ui/icons';
import { FEATURED_FREE_SESSION } from '@/lib/catalog';
import { SAMPLE_SECONDS, useSample } from './SampleProvider';

// The brand rings, now a working preview: press the centre to hear the free session.
export default function HeroRings() {
  const { ready, playing, toggle } = useSample();
  const free = FEATURED_FREE_SESSION;
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Rings color="var(--accent)" restOpacity={0.55} glowing={playing} shimmer={!playing} halo>
        <button
          type="button"
          onClick={() => void toggle()}
          disabled={!ready}
          aria-label={playing ? 'Stop sample' : `Hear a ${SAMPLE_SECONDS}-second sample`}
          className="grid h-[clamp(64px,8vw,84px)] w-[clamp(64px,8vw,84px)] place-items-center rounded-full bg-accent text-on-accent transition-opacity disabled:opacity-40"
        >
          {playing ? <PauseIcon size={24} /> : <PlayIcon size={24} className="translate-x-[2px]" />}
        </button>
      </Rings>
      <span className="text-[14px] text-ink-muted" aria-live="polite">
        {playing
          ? free ? `Playing an excerpt of \u2018${free.title}\u2019` : 'Playing an excerpt'
          : ready
            ? free ? `Hear an excerpt of \u2018${free.title}\u2019` : 'Hear an excerpt'
            : 'Preparing an excerpt…'}
      </span>
    </div>
  );
}

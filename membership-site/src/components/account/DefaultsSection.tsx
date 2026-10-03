'use client';

import { useEffect, useState } from 'react';
import BlendSlider from '@/components/ui/BlendSlider';
import {
  DEFAULT_PREFS,
  REPEAT_OPTIONS,
  loadPlayerPrefs,
  savePlayerPrefs,
  type PlayerPrefs,
} from '@/lib/playerPrefs';
import { AccountSection, ExpandableRow } from './Section';

// The same preferences the player saves; editing here changes what the player starts with.
export default function DefaultsSection() {
  const [prefs, setPrefs] = useState<PlayerPrefs>(DEFAULT_PREFS);
  const [open, setOpen] = useState<'repeat' | 'blend' | null>(null);

  useEffect(() => {
    setPrefs(loadPlayerPrefs());
  }, []);

  const update = (patch: Partial<PlayerPrefs>) => {
    const next = { ...loadPlayerPrefs(), ...patch };
    savePlayerPrefs(next);
    setPrefs(next);
  };
  const toggle = (row: 'repeat' | 'blend') => setOpen((current) => (current === row ? null : row));

  return (
    <AccountSection title="Defaults">
      <ExpandableRow
        label="Default repeats"
        value={`${prefs.repeat}\u00d7`}
        open={open === 'repeat'}
        onToggle={() => toggle('repeat')}
      >
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Default repeats">
          {REPEAT_OPTIONS.map((count) => (
            <button
              key={count}
              type="button"
              role="radio"
              aria-checked={prefs.repeat === count}
              onClick={() => update({ repeat: count })}
              className={`sc-pill min-h-[40px] font-mono ${prefs.repeat === count ? 'is-selected' : ''}`}
            >
              {count}&times;
            </button>
          ))}
        </div>
      </ExpandableRow>
      <ExpandableRow
        label="Instruction / pulse blend"
        value={`${prefs.instruction} / ${100 - prefs.instruction}`}
        open={open === 'blend'}
        onToggle={() => toggle('blend')}
      >
        <BlendSlider instruction={prefs.instruction} onChange={(instruction) => update({ instruction })} tone="site" />
      </ExpandableRow>
    </AccountSection>
  );
}

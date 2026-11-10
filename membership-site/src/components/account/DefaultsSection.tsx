'use client';

import { useEffect, useRef, useState } from 'react';
import BlendSlider from '@/components/ui/BlendSlider';
import PulseWidthPicker from '@/components/ui/PulseWidthPicker';
import VoicePicker from '@/components/ui/VoicePicker';
import { buildPlayPlan, type SessionManifest } from '@/lib/audio/playPlan';
import { PulseWidthPreview } from '@/lib/audio/PulseWidthPreview';
import { pulseWidthLabel, type PulseWidth } from '@/lib/audio/pulseWidth';
import { FEATURED_FREE_SESSION, VOICES, findVoice, mediaVoiceId } from '@/lib/catalog';
import { fetchSessionMedia } from '@/lib/authedFetch';
import {
  DEFAULT_PREFS,
  REPEAT_OPTIONS,
  loadPlayerPrefs,
  savePlayerPrefs,
  type PlayerPrefs,
} from '@/lib/playerPrefs';
import { AccountSection, ExpandableRow } from './Section';

type DefaultsRow = 'voice' | 'repeat' | 'blend' | 'width';

// The same preferences the player saves; editing here changes what the player starts with.
export default function DefaultsSection() {
  const [prefs, setPrefs] = useState<PlayerPrefs>(DEFAULT_PREFS);
  const [open, setOpen] = useState<DefaultsRow | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewRef = useRef<PulseWidthPreview | null>(null);

  useEffect(() => {
    setPrefs(loadPlayerPrefs());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const free = FEATURED_FREE_SESSION;
      const voiceId = mediaVoiceId(loadPlayerPrefs().voiceId);
      if (!free || !voiceId) return;
      try {
        const signed = await fetchSessionMedia(free.id, voiceId);
        const fileUrl = (name: string) => `${signed.baseUrl}${encodeURIComponent(name)}?${signed.query}`;
        const response = await fetch(fileUrl('manifest.json'));
        if (!response.ok) return;
        const manifest = (await response.json()) as SessionManifest;
        const plan = buildPlayPlan(manifest, fileUrl);
        if (!cancelled) setPreviewUrl(plan.pulseUrl);
      } catch {
        // Choices still save without preview audio.
      }
    })();
    return () => {
      cancelled = true;
      previewRef.current?.dispose();
      previewRef.current = null;
    };
  }, []);

  const update = (patch: Partial<PlayerPrefs>) => {
    const next = { ...loadPlayerPrefs(), ...patch };
    savePlayerPrefs(next);
    setPrefs(next);
    if (open === 'width' && (patch.volume !== undefined || patch.instruction !== undefined)) {
      previewRef.current?.setPrefsVolume(next.volume, next.instruction);
    }
  };

  async function startWidthPreview(url: string | null) {
    const preview = previewRef.current ?? new PulseWidthPreview();
    previewRef.current = preview;
    const current = loadPlayerPrefs();
    preview.setPrefsVolume(current.volume, current.instruction);
    preview.setWidth(current.pulseWidth);
    if (!url) return;
    try {
      await preview.start(url);
    } catch {
      // Silent failure; row still works.
    }
  }

  useEffect(() => {
    if (open !== 'width' || !previewUrl) return;
    void startWidthPreview(previewUrl);
  }, [open, previewUrl]);

  const toggle = (row: DefaultsRow) => {
    setOpen((current) => {
      const next = current === row ? null : row;
      if (current === 'width' && next !== 'width') previewRef.current?.stop();
      return next;
    });
  };

  function chooseWidth(pulseWidth: PulseWidth) {
    previewRef.current?.setWidth(pulseWidth);
    update({ pulseWidth });
  }

  const voiceName = findVoice(prefs.voiceId)?.name ?? 'Not set';

  return (
    <AccountSection title="Defaults">
      <ExpandableRow
        label="Voice"
        value={voiceName}
        open={open === 'voice'}
        onToggle={() => toggle('voice')}
      >
        <VoicePicker
          voices={VOICES}
          selectedId={prefs.voiceId}
          onSelect={(voiceId) => update({ voiceId })}
          tone="site"
        />
      </ExpandableRow>
      <ExpandableRow
        label="Each statement"
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
        label="Instruction / Pulse"
        value={`${prefs.instruction} / ${100 - prefs.instruction}`}
        open={open === 'blend'}
        onToggle={() => toggle('blend')}
      >
        <BlendSlider instruction={prefs.instruction} onChange={(instruction) => update({ instruction })} tone="site" />
      </ExpandableRow>
      <ExpandableRow
        label="Pulse width"
        value={pulseWidthLabel(prefs.pulseWidth)}
        open={open === 'width'}
        onToggle={() => toggle('width')}
      >
        <PulseWidthPicker selected={prefs.pulseWidth} onSelect={chooseWidth} tone="site" />
      </ExpandableRow>
    </AccountSection>
  );
}

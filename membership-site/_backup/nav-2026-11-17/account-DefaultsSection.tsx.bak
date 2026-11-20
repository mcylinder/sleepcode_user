'use client';

import { useEffect, useRef, useState } from 'react';
import PulseWidthPicker from '@/components/ui/PulseWidthPicker';
import VoicePicker from '@/components/ui/VoicePicker';
import VoiceSteps from '@/components/ui/VoiceSteps';
import { buildPlayPlan, type SessionManifest } from '@/lib/audio/playPlan';
import { PulseWidthPreview } from '@/lib/audio/PulseWidthPreview';
import { pulseWidthLabel, type PulseWidth } from '@/lib/audio/pulseWidth';
import { FEATURED_FREE_SESSION, VOICES, findVoice, mediaVoiceId } from '@/lib/catalog';
import { fetchSessionMedia } from '@/lib/authedFetch';
import {
  DEFAULT_PREFS,
  REPEAT_LABELS,
  REPEAT_OPTIONS,
  loadPlayerPrefs,
  savePlayerPrefs,
  type PlayerPrefs,
} from '@/lib/playerPrefs';
import { AccountSection, ExpandableRow } from './Section';

type DefaultsRow = 'voice' | 'repeat' | 'blend' | 'width';

const REPEAT_DOTS: Record<(typeof REPEAT_OPTIONS)[number], number> = { 1: 1, 2: 2, 4: 4 };

// The same preferences the player uses. Edits are draft until Save.
export default function DefaultsSection() {
  const [prefs, setPrefs] = useState<PlayerPrefs>(DEFAULT_PREFS);
  const [draft, setDraft] = useState<PlayerPrefs>(DEFAULT_PREFS);
  const [open, setOpen] = useState<DefaultsRow | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewRef = useRef<PulseWidthPreview | null>(null);

  useEffect(() => {
    const saved = loadPlayerPrefs();
    setPrefs(saved);
    setDraft(saved);
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

  async function startWidthPreview(url: string | null, current: PlayerPrefs) {
    const preview = previewRef.current ?? new PulseWidthPreview();
    previewRef.current = preview;
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
    void startWidthPreview(previewUrl, draft);
  }, [open, previewUrl]);

  const toggle = (row: DefaultsRow) => {
    setOpen((current) => {
      const next = current === row ? null : row;
      if (current === 'width' && next !== 'width') previewRef.current?.stop();
      if (next) {
        const saved = loadPlayerPrefs();
        setPrefs(saved);
        setDraft(saved);
      } else {
        // Closing without Save discards draft.
        setDraft(prefs);
      }
      return next;
    });
  };

  const patchDraft = (patch: Partial<PlayerPrefs>) => {
    setDraft((current) => {
      const next = { ...current, ...patch };
      if (open === 'width') {
        if (patch.pulseWidth !== undefined) previewRef.current?.setWidth(patch.pulseWidth);
        if (patch.volume !== undefined || patch.instruction !== undefined) {
          previewRef.current?.setPrefsVolume(next.volume, next.instruction);
        }
      }
      return next;
    });
  };

  const saveOpen = () => {
    savePlayerPrefs(draft);
    setPrefs(draft);
    if (open === 'width') previewRef.current?.stop();
    setOpen(null);
  };

  const dirty = JSON.stringify(draft) !== JSON.stringify(prefs);
  const voiceName = findVoice(prefs.voiceId)?.name ?? 'Not set';
  const draftVoiceName = findVoice(draft.voiceId)?.name ?? 'Not set';

  return (
    <AccountSection title="Defaults">
      <ExpandableRow
        label="Voice"
        value={open === 'voice' ? draftVoiceName : voiceName}
        open={open === 'voice'}
        onToggle={() => toggle('voice')}
      >
        <VoicePicker
          voices={VOICES}
          selectedId={draft.voiceId}
          onSelect={(voiceId) => patchDraft({ voiceId })}
          tone="site"
        />
        <SaveDefaultsButton disabled={!dirty} onSave={saveOpen} />
      </ExpandableRow>
      <ExpandableRow
        label="Repeat each affirmation"
        value={REPEAT_LABELS[open === 'repeat' ? draft.repeat : prefs.repeat]}
        open={open === 'repeat'}
        onToggle={() => toggle('repeat')}
      >
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Repeat each affirmation">
          {REPEAT_OPTIONS.map((count) => {
            const selected = draft.repeat === count;
            return (
              <button
                key={count}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => patchDraft({ repeat: count })}
                className={`sc-pill flex min-h-[48px] flex-col items-center justify-center gap-1.5 text-[14px] ${
                  selected ? 'is-selected font-semibold' : ''
                }`}
              >
                <span className="flex gap-1" aria-hidden="true">
                  {Array.from({ length: REPEAT_DOTS[count] }, (_, i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: selected ? 'var(--on-accent)' : 'var(--ink)' }}
                    />
                  ))}
                </span>
                {REPEAT_LABELS[count]}
              </button>
            );
          })}
        </div>
        <SaveDefaultsButton disabled={!dirty} onSave={saveOpen} />
      </ExpandableRow>
      <ExpandableRow
        label="Voice blend"
        value={`${open === 'blend' ? draft.instruction : prefs.instruction}%`}
        open={open === 'blend'}
        onToggle={() => toggle('blend')}
      >
        <VoiceSteps
          instruction={draft.instruction}
          onChange={(instruction) => patchDraft({ instruction })}
          tone="site"
        />
        <SaveDefaultsButton disabled={!dirty} onSave={saveOpen} />
      </ExpandableRow>
      <ExpandableRow
        label="Pulse width"
        value={pulseWidthLabel(open === 'width' ? draft.pulseWidth : prefs.pulseWidth)}
        open={open === 'width'}
        onToggle={() => toggle('width')}
      >
        <PulseWidthPicker
          selected={draft.pulseWidth}
          onSelect={(pulseWidth: PulseWidth) => patchDraft({ pulseWidth })}
          tone="site"
          layout="list"
        />
        <SaveDefaultsButton disabled={!dirty} onSave={saveOpen} />
      </ExpandableRow>
    </AccountSection>
  );
}

function SaveDefaultsButton({ disabled, onSave }: { disabled: boolean; onSave: () => void }) {
  return (
    <div className="flex justify-end pt-1">
      <button type="button" onClick={onSave} disabled={disabled} className="sc-btn disabled:opacity-40">
        Save
      </button>
    </div>
  );
}

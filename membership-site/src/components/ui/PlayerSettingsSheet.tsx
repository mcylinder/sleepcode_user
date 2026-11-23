'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  findMusic,
  findNature,
  isReady,
  listMusic,
  listNature,
  PULSE_WIDTH_CARDS,
  pulseSubhead,
  type BackgroundGroup,
  type BackgroundSelection,
} from '@/lib/backgrounds';
import { VOICES } from '@/lib/catalog';
import { fetchBackgroundMedia } from '@/lib/authedFetch';
import { narratorPreviewUrl } from '@/lib/narratorPreview';
import { DEFAULT_PULSE_WIDTH, PULSE_WIDTH_OPTIONS, pulseWidthLabel, type PulseWidth } from '@/lib/audio/pulseWidth';
import { REPEAT_OPTIONS, type PlayerPrefs } from '@/lib/playerPrefs';
import { MusicNoteIcon, NatureIcon, PlayIcon, PulseIcon } from './icons';
import Sheet, { SheetHeader } from './Sheet';

type View = 'settings' | 'background';
type BgTab = 'pulse' | 'nature' | 'music';

const BG_OPTIONS: {
  tab: BgTab;
  group: BackgroundGroup;
  label: string;
  icon: ReactNode;
}[] = [
  { tab: 'pulse', group: 'pulse', label: 'Pulse', icon: <PulseIcon size={18} /> },
  { tab: 'nature', group: 'nature', label: 'Environment', icon: <NatureIcon size={18} /> },
  { tab: 'music', group: 'music', label: 'Music', icon: <MusicNoteIcon size={18} /> },
];

function backgroundDetail(prefs: PlayerPrefs, group: BackgroundGroup): string {
  if (group === 'pulse') {
    if (prefs.background.group === 'pulse') return pulseWidthLabel(prefs.background.width);
    return 'Bilateral audio';
  }
  if (group === 'nature') {
    if (prefs.background.group === 'nature') return findNature(prefs.background.id)?.name ?? 'Choose a sound';
    return 'Nature sounds';
  }
  if (prefs.background.group === 'music') return findMusic(prefs.background.id)?.name ?? 'Choose a piece';
  return 'Ambient pieces';
}

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-p-accent" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PlayerSettingsSheet({
  open,
  onClose,
  prefs,
  onChange,
  onSelectBackground,
  decodingId,
}: {
  open: boolean;
  onClose: () => void;
  prefs: PlayerPrefs;
  onChange: (patch: Partial<PlayerPrefs>) => void;
  /** Load/apply a Nature or Music (or Pulse) selection; may be async decode. */
  onSelectBackground: (selection: BackgroundSelection) => void | Promise<void>;
  decodingId?: string | null;
}) {
  const [view, setView] = useState<View>('settings');
  const [tab, setTab] = useState<BgTab>('pulse');
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [previewingBg, setPreviewingBg] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unduckRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!open) {
      setView('settings');
      stopPreview();
    }
  }, [open]);

  function stopPreview() {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    audioRef.current = null;
    setPreviewingVoice(null);
    setPreviewingBg(null);
    unduckRef.current?.();
    unduckRef.current = null;
  }

  async function playUrl(url: string, kind: 'voice' | 'bg', id: string) {
    stopPreview();
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'none';
    audio.src = url;
    audioRef.current = audio;
    if (kind === 'voice') setPreviewingVoice(id);
    else setPreviewingBg(id);
    audio.onended = () => stopPreview();
    try {
      await audio.play();
    } catch {
      stopPreview();
    }
  }

  async function previewNarrator(voiceId: string) {
    if (previewingVoice === voiceId) {
      stopPreview();
      return;
    }
    try {
      const url = await narratorPreviewUrl(voiceId);
      if (!url) return;
      await playUrl(url, 'voice', voiceId);
    } catch {
      stopPreview();
    }
  }

  async function previewBackground(path: string, id: string) {
    if (previewingBg === id) {
      stopPreview();
      return;
    }
    try {
      const signed = await fetchBackgroundMedia();
      const relative = path.replace(/^background\//, '');
      const url = `${signed.baseUrl}${relative}?${signed.query}`;
      await playUrl(url, 'bg', id);
    } catch {
      stopPreview();
    }
  }

  function openBackground(tab: BgTab) {
    setTab(tab);
    setView('background');
    // Switching to Pulse applies it immediately (width picker is the adjustment).
    if (tab === 'pulse' && prefs.background.group !== 'pulse') {
      void onSelectBackground({ group: 'pulse', width: DEFAULT_PULSE_WIDTH });
    }
  }

  return (
    <Sheet open={open} onClose={onClose} label="Settings" tone="player" fullHeight>
      {view === 'settings' ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-none">
            <SheetHeader title="Settings" onCancel={onClose} tone="player" actionLabel="Done" />
          </div>
          <div className="mt-2 flex min-h-0 flex-1 flex-col gap-10 overflow-y-auto pb-2">
            <section className="flex flex-col gap-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-p-muted">Narrator</p>
              <div className="overflow-hidden rounded-[14px] border border-hairline bg-p-panel">
                {VOICES.map((voice) => {
                  const selected = prefs.voiceId === voice.id || (!prefs.voiceId && voice === VOICES[0]);
                  const previewing = previewingVoice === voice.id;
                  return (
                    <div
                      key={voice.id}
                      className={`flex items-center gap-3 border-t border-hairline px-4 py-3.5 first:border-t-0 ${
                        selected ? 'bg-[var(--selected-bg)]' : ''
                      }`}
                    >
                      <button
                        type="button"
                        aria-label={`Preview ${voice.name}`}
                        onClick={() => void previewNarrator(voice.id)}
                        className={`grid h-[34px] w-[34px] flex-none place-items-center rounded-full border ${
                          previewing
                            ? 'border-p-accent bg-p-accent text-p-on-accent'
                            : 'border-hairline-strong text-p-fg'
                        }`}
                      >
                        <PlayIcon size={11} />
                      </button>
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 flex-col text-left"
                        onClick={() => onChange({ voiceId: voice.id })}
                      >
                        <span className={`text-[15px] font-medium ${previewing ? 'text-p-accent' : ''}`}>
                          {voice.name}
                        </span>
                        <span className="text-[12.5px] text-p-muted">{voice.description}</span>
                      </button>
                      {selected ? <Check /> : null}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-p-muted">Background</p>
              <div className="overflow-hidden rounded-[14px] border border-hairline bg-p-panel">
                {BG_OPTIONS.map((option) => {
                  const selected = prefs.background.group === option.group;
                  return (
                    <button
                      key={option.tab}
                      type="button"
                      onClick={() => openBackground(option.tab)}
                      aria-current={selected ? 'true' : undefined}
                      className={`flex w-full items-center gap-3 border-t border-hairline px-4 py-3.5 text-left first:border-t-0 ${
                        selected ? 'bg-[var(--selected-bg)]' : ''
                      }`}
                    >
                      <span className={selected ? 'text-p-accent' : 'text-p-muted'}>{option.icon}</span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="text-[15px] font-medium">{option.label}</span>
                        <span className="text-[12.5px] text-p-muted">
                          {backgroundDetail(prefs, option.group)}
                        </span>
                      </span>
                      {selected ? <Check /> : <span className="text-p-muted">›</span>}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-p-muted">Repeat</p>
              <div className="flex gap-1 rounded-[12px] border border-hairline bg-p-panel p-[3px]">
                {REPEAT_OPTIONS.map((count) => {
                  const on = prefs.repeat === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => onChange({ repeat: count })}
                      className={`flex-1 rounded-[9px] py-2.5 text-[13px] ${
                        on
                          ? 'bg-p-tile-active text-p-fg shadow-[inset_0_0_0_1px_var(--hairline-strong)]'
                          : 'text-p-muted'
                      }`}
                    >
                      {count === 1 ? 'Once' : count === 2 ? 'Twice' : '4×'}
                    </button>
                  );
                })}
              </div>
              <p className="px-0.5 text-[12.5px] leading-snug text-p-muted">
                How many times each affirmation plays before the next.
              </p>
            </section>

            {/* Spacing toggle deferred: Off clipped the pulse underlay. Keep pause On until
                SessionEngine can trim gaps without cutting bilateral pulse. Prefs/engine
                still support spacing for a future pass. */}
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-none items-center justify-between gap-3">
            <button type="button" onClick={() => setView('settings')} className="min-h-[44px] text-[15px] text-p-muted">
              ‹ Settings
            </button>
            <span className="text-[18px] font-semibold">Background</span>
            <button type="button" onClick={onClose} className="min-h-[44px] text-[15px] font-medium text-p-accent">
              Done
            </button>
          </div>

          <div className="mt-4 flex flex-none gap-1 rounded-[12px] border border-hairline bg-p-panel p-[3px]">
            {BG_OPTIONS.map((item) => (
              <button
                key={item.tab}
                type="button"
                onClick={() => setTab(item.tab)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-[9px] py-2 text-[13px] ${
                  tab === item.tab
                    ? 'bg-p-tile-active text-p-fg shadow-[inset_0_0_0_1px_var(--hairline-strong)]'
                    : 'text-p-muted'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-5 min-h-0 flex-1 overflow-y-auto pb-2">
            {tab === 'pulse' && (
              <div>
                <div className="mb-3.5">
                  <h4 className="text-[17px] font-medium">Pulse</h4>
                  <p className="mt-0.5 text-[13px] text-p-muted">{pulseSubhead()}</p>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {PULSE_WIDTH_CARDS.map((card) => {
                    const width = card.pulseWidth as PulseWidth;
                    const selected =
                      prefs.background.group === 'pulse' && prefs.background.width === width;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => void onSelectBackground({ group: 'pulse', width })}
                        className={`flex flex-col gap-3 rounded-[14px] border px-3.5 pb-3.5 pt-4 text-left ${
                          selected
                            ? 'border-p-accent bg-[var(--selected-bg)]'
                            : 'border-hairline bg-p-panel'
                        }`}
                      >
                        <PulseWidthViz width={width} />
                        <span className="flex items-center justify-between text-[14px]">
                          <span>
                            {card.label}
                            {card.subLabel ? (
                              <span className="ml-1.5 text-[12px] text-p-muted">{card.subLabel}</span>
                            ) : null}
                          </span>
                          {selected ? <Check /> : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3.5 text-[12.5px] leading-snug text-p-muted">
                  The pulse moves between your ears. Wider settings work best with headphones.
                </p>
              </div>
            )}

            {tab === 'nature' && (
              <BgList
                items={listNature()}
                selectedId={prefs.background.group === 'nature' ? prefs.background.id : null}
                previewingId={previewingBg}
                decodingId={decodingId}
                onPreview={(item) => void previewBackground(item.path, item.id)}
                onSelect={(item) => void onSelectBackground({ group: 'nature', id: item.id })}
              />
            )}

            {tab === 'music' && (
              <BgList
                items={listMusic()}
                selectedId={prefs.background.group === 'music' ? prefs.background.id : null}
                previewingId={previewingBg}
                decodingId={decodingId}
                onPreview={(item) => void previewBackground(item.path, item.id)}
                onSelect={(item) => void onSelectBackground({ group: 'music', id: item.id })}
              />
            )}
          </div>
        </div>
      )}
    </Sheet>
  );
}

function PulseWidthViz({ width }: { width: PulseWidth }) {
  const idx = PULSE_WIDTH_OPTIONS.indexOf(width);
  const left = [44, 30, 16, 3][idx] ?? 30;
  const right = [null, 58, 72, 85][idx];
  return (
    <div className="relative h-[22px] w-full">
      <span className="absolute bottom-0 left-0 top-0 w-0.5 bg-hairline-strong" />
      <span className="absolute bottom-0 right-0 top-0 w-0.5 bg-hairline-strong" />
      <span
        className="absolute top-[7px] h-2 rounded bg-p-accent opacity-85"
        style={{ left: `${left}%`, width: '12%' }}
      />
      {right != null ? (
        <span
          className="absolute top-[7px] h-2 rounded bg-p-accent opacity-40"
          style={{ left: `${right}%`, width: '12%' }}
        />
      ) : null}
    </div>
  );
}

function BgList({
  items,
  selectedId,
  previewingId,
  decodingId,
  onPreview,
  onSelect,
}: {
  items: { id: string; name: string; path: string; ready?: boolean }[];
  selectedId: string | null;
  previewingId: string | null;
  decodingId?: string | null;
  onPreview: (item: { id: string; name: string; path: string; ready?: boolean }) => void;
  onSelect: (item: { id: string; name: string; path: string; ready?: boolean }) => void;
}) {
  return (
    <div className="overflow-x-hidden rounded-[14px] border border-hairline bg-p-panel">
      {items.map((item) => {
        const ready = isReady(item);
        const selected = selectedId === item.id;
        const previewing = previewingId === item.id;
        const decoding = decodingId === item.id;
        return (
          <div
            key={item.id}
            className={`flex items-center gap-3 border-t border-hairline px-4 py-3.5 first:border-t-0 ${
              selected ? 'bg-[var(--selected-bg)]' : ''
            } ${ready ? '' : 'opacity-45'}`}
          >
            <button
              type="button"
              disabled={!ready}
              aria-label={previewing ? `Stop previewing ${item.name}` : `Preview ${item.name}`}
              onClick={() => onPreview(item)}
              className={`grid h-[34px] w-[34px] flex-none place-items-center rounded-full border ${
                previewing
                  ? 'border-p-accent bg-p-accent text-p-on-accent'
                  : 'border-hairline-strong text-p-fg'
              }`}
            >
              {previewing ? (
                <span className="flex h-3 items-end gap-0.5" aria-hidden="true">
                  <i className="inline-block w-0.5 animate-pulse bg-current" style={{ height: 6 }} />
                  <i className="inline-block w-0.5 animate-pulse bg-current" style={{ height: 11 }} />
                  <i className="inline-block w-0.5 animate-pulse bg-current" style={{ height: 8 }} />
                </span>
              ) : (
                <PlayIcon size={11} />
              )}
            </button>
            <button
              type="button"
              disabled={!ready || decoding}
              className="flex min-w-0 flex-1 text-left"
              onClick={() => onSelect(item)}
            >
              <span
                className={`text-[15px] font-medium ${
                  previewing || decoding ? 'text-p-accent' : ''
                }`}
              >
                {decoding ? `${item.name}…` : item.name}
              </span>
            </button>
            {selected ? <Check /> : null}
          </div>
        );
      })}
    </div>
  );
}

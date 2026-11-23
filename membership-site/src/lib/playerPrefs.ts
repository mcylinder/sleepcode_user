import {
  DEFAULT_BACKGROUND,
  type BackgroundSelection,
} from '@/lib/backgrounds';
import { DEFAULT_PULSE_WIDTH, normalizePulseWidth, type PulseWidth } from '@/lib/audio/pulseWidth';
import { mediaVoiceId } from '@/lib/catalog';

export const REPEAT_OPTIONS = [1, 2, 4] as const;
export type RepeatCount = (typeof REPEAT_OPTIONS)[number];

export const LENGTH_HOURS = Array.from({ length: 11 }, (_, i) => i);
export const LENGTH_MINUTES = [0, 10, 20, 30, 40, 50];

export const PREFS_VERSION = 2;

export interface PlayerPrefs {
  version: number;
  /** Voice share 0–100. Background share is `100 - voiceMix`. Default 75. */
  voiceMix: number;
  /** Fixed master percent (no UI). Default 80 → gain 0.8. */
  volume: number;
  repeat: RepeatCount;
  voiceId: string | null;
  background: BackgroundSelection;
  /** true = pause between affirmations (current timing). */
  spacing: boolean;
}

export const DEFAULT_PREFS: PlayerPrefs = {
  version: PREFS_VERSION,
  voiceMix: 75,
  volume: 80,
  repeat: 2,
  voiceId: null,
  background: DEFAULT_BACKGROUND,
  spacing: true,
};

function roundVoiceMix(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value / 5) * 5));
}

const PREFS_KEY = 'sleepcode_player_prefs';

interface StoredPrefs {
  version?: number;
  voiceMix?: number;
  instruction?: number;
  blend?: number;
  volume?: number;
  repeat?: number;
  voiceId?: string | null;
  pulseWidth?: unknown;
  background?: unknown;
  spacing?: unknown;
}

function parseBackground(raw: StoredPrefs): BackgroundSelection {
  const bg = raw.background;
  if (bg && typeof bg === 'object') {
    const obj = bg as { group?: string; width?: unknown; id?: unknown };
    if (obj.group === 'pulse') {
      return { group: 'pulse', width: normalizePulseWidth(obj.width) };
    }
    if ((obj.group === 'nature' || obj.group === 'music') && typeof obj.id === 'string') {
      return { group: obj.group, id: obj.id };
    }
  }
  if (raw.pulseWidth !== undefined) {
    return { group: 'pulse', width: normalizePulseWidth(raw.pulseWidth) };
  }
  return DEFAULT_BACKGROUND;
}

export function loadPlayerPrefs(): PlayerPrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') as StoredPrefs;
    const isV2 = raw.version === PREFS_VERSION;
    // v2: use stored voiceMix. Older prefs: reset to 75 (no blend migration).
    const voiceMix = isV2 && typeof raw.voiceMix === 'number' ? roundVoiceMix(raw.voiceMix) : DEFAULT_PREFS.voiceMix;
    const volume =
      typeof raw.volume === 'number' ? Math.min(100, Math.max(0, Math.round(raw.volume))) : DEFAULT_PREFS.volume;
    const repeat = REPEAT_OPTIONS.includes(raw.repeat as RepeatCount)
      ? (raw.repeat as RepeatCount)
      : DEFAULT_PREFS.repeat;
    const voiceId = mediaVoiceId(typeof raw.voiceId === 'string' ? raw.voiceId : null);
    const background = parseBackground(raw);
    const spacing = typeof raw.spacing === 'boolean' ? raw.spacing : DEFAULT_PREFS.spacing;
    return { version: PREFS_VERSION, voiceMix, volume, repeat, voiceId, background, spacing };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePlayerPrefs(prefs: PlayerPrefs): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...prefs, version: PREFS_VERSION }));
  } catch {
    // Storage unavailable; preferences reset next visit.
  }
}

/** Background share 0–100 for Mix fader fill/knob. */
export function backgroundShare(voiceMix: number): number {
  return 100 - Math.min(100, Math.max(0, voiceMix));
}

export function mixReadout(voiceMix: number): string {
  const v = Math.min(100, Math.max(0, Math.round(voiceMix)));
  return `${v} · ${100 - v}`;
}

/** Pulse width when background is Pulse; otherwise default Narrow. */
export function prefsPulseWidth(prefs: PlayerPrefs): PulseWidth {
  return prefs.background.group === 'pulse' ? prefs.background.width : DEFAULT_PULSE_WIDTH;
}

// Engine balance: 0 = all voice, 100 = all background (legacy SessionEngine.setBalance).
export function engineBalance(voiceMix: number): number {
  return 100 - voiceMix;
}

export function formatHoursMinutes(totalMinutes: number): string {
  return `${Math.floor(totalMinutes / 60)}:${String(totalMinutes % 60).padStart(2, '0')}`;
}

export function fmtLength(lengthMinutes: number | null): string {
  if (lengthMinutes === null || lengthMinutes <= 0) return 'Length';
  if (lengthMinutes < 60) return `${lengthMinutes} min`;
  if (lengthMinutes % 60 === 0) return `${lengthMinutes / 60} hr`;
  const h = Math.floor(lengthMinutes / 60);
  const m = lengthMinutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

export function formatRemainingTitle(remainingSec: number): string {
  const totalMin = Math.max(0, Math.ceil(remainingSec / 60));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}hr`);
  if (m > 0 || h === 0) parts.push(`${m}min`);
  return `Session length: ${parts.join(' ')} remaining`;
}

/** Player clock: `m:ss` under an hour, `h:mm:ss` at or above. */
export function formatPlaybackClock(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Length CTA countdown: `H:MM`. */
export function formatLengthCountdown(remainingSec: number): string {
  const totalMin = Math.max(0, Math.ceil(remainingSec / 60));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

/** Length CTA idle label: `30m` / `2h`. */
export function formatLengthIdle(lengthSec: number): string {
  const min = Math.round(lengthSec / 60);
  if (min < 60) return `${min}m`;
  if (min % 60 === 0) return `${min / 60}h`;
  return formatLengthCountdown(lengthSec);
}

export const REPEAT_LABELS: Record<RepeatCount, string> = {
  1: 'Once',
  2: 'Twice',
  4: 'Four times',
};

export const REPEAT_TILE_LABELS: Record<RepeatCount, string> = {
  1: 'Once',
  2: 'Twice',
  4: '4 times',
};

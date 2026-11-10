import { DEFAULT_PULSE_WIDTH, normalizePulseWidth, type PulseWidth } from '@/lib/audio/pulseWidth';
import { resolveVoiceId } from '@/lib/catalog';

export const REPEAT_OPTIONS = [1, 2, 4] as const;
export type RepeatCount = (typeof REPEAT_OPTIONS)[number];

export const LENGTH_HOURS = Array.from({ length: 11 }, (_, i) => i);
export const LENGTH_MINUTES = [0, 10, 20, 30, 40, 50];
const MAX_LENGTH_MINUTES = 10 * 60 + 50;

// Shared by the player and Account > Defaults; changing either updates both.
export interface PlayerPrefs {
  // Instruction share, 0-100. Pulse is the remainder.
  instruction: number;
  // Overall level, 0-100.
  volume: number;
  repeat: RepeatCount;
  // Last session length chosen; null = no end time.
  lengthMinutes: number | null;
  // Global voice; null until the listener picks one.
  voiceId: string | null;
  // Pulse stereo image: 0 Center … 100 Full. Default Narrow (33).
  pulseWidth: PulseWidth;
}

// Single default for signed-in and signed-out (Instruction 75 / Pulse 25; 5% Voice steps).
export const DEFAULT_PREFS: PlayerPrefs = {
  instruction: 75,
  volume: 80,
  repeat: 2,
  lengthMinutes: null,
  voiceId: null,
  pulseWidth: DEFAULT_PULSE_WIDTH,
};

function roundInstruction(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value / 5) * 5));
}

const PREFS_KEY = 'sleepcode_player_prefs';

interface StoredPrefs extends Partial<PlayerPrefs> {
  // Earlier versions stored the pulse share and a timer.
  blend?: number;
  timerMinutes?: number | null;
}

export function loadPlayerPrefs(): PlayerPrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') as StoredPrefs;
    const instructionRaw =
      typeof raw.instruction === 'number' ? raw.instruction : typeof raw.blend === 'number' ? 100 - raw.blend : null;
    const instruction =
      instructionRaw === null ? DEFAULT_PREFS.instruction : roundInstruction(instructionRaw);
    const volume =
      typeof raw.volume === 'number' ? Math.min(100, Math.max(0, Math.round(raw.volume))) : DEFAULT_PREFS.volume;
    const repeat = REPEAT_OPTIONS.includes(raw.repeat as RepeatCount) ? (raw.repeat as RepeatCount) : DEFAULT_PREFS.repeat;
    const lengthRaw = raw.lengthMinutes ?? raw.timerMinutes;
    const lengthMinutes =
      typeof lengthRaw === 'number' && lengthRaw > 0 ? Math.min(MAX_LENGTH_MINUTES, Math.round(lengthRaw)) : null;
    const voiceId = resolveVoiceId(typeof raw.voiceId === 'string' ? raw.voiceId : null);
    const pulseWidth = normalizePulseWidth(raw.pulseWidth);
    return { instruction, volume, repeat, lengthMinutes, voiceId, pulseWidth };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePlayerPrefs(prefs: PlayerPrefs): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Storage unavailable; preferences reset next visit.
  }
}

// Engine balance: 0 = all instruction, 100 = all pulse.
export function engineBalance(instruction: number): number {
  return 100 - instruction;
}

// H:MM
export function formatHoursMinutes(totalMinutes: number): string {
  return `${Math.floor(totalMinutes / 60)}:${String(totalMinutes % 60).padStart(2, '0')}`;
}

// Timer tile label: null → "Length", <60 → "45 min", whole hours → "8 hr", else "1:30".
export function fmtLength(lengthMinutes: number | null): string {
  if (lengthMinutes === null || lengthMinutes <= 0) return 'Length';
  if (lengthMinutes < 60) return `${lengthMinutes} min`;
  if (lengthMinutes % 60 === 0) return `${lengthMinutes / 60} hr`;
  const h = Math.floor(lengthMinutes / 60);
  const m = lengthMinutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

// Sheet title when a countdown is active, e.g. "Session length: 3hr 2min remaining".
export function formatRemainingTitle(remainingSec: number): string {
  const totalMin = Math.max(0, Math.ceil(remainingSec / 60));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}hr`);
  if (m > 0 || h === 0) parts.push(`${m}min`);
  return `Session length: ${parts.join(' ')} remaining`;
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

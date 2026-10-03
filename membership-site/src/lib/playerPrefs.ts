export const REPEAT_OPTIONS = [1, 2, 4] as const;
export type RepeatCount = (typeof REPEAT_OPTIONS)[number];

export const LENGTH_HOURS = Array.from({ length: 11 }, (_, i) => i);
export const LENGTH_MINUTES = [0, 10, 20, 30, 40, 50];
const MAX_LENGTH_MINUTES = 10 * 60 + 50;

// Shared by the player and Account > Defaults; changing either updates both.
export interface PlayerPrefs {
  // Instruction share, 0-100. Pulse is the remainder.
  instruction: number;
  repeat: RepeatCount;
  // Last session length chosen; null = no end time.
  lengthMinutes: number | null;
}

export const DEFAULT_PREFS: PlayerPrefs = { instruction: 60, repeat: 2, lengthMinutes: null };

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
      instructionRaw === null ? DEFAULT_PREFS.instruction : Math.min(100, Math.max(0, Math.round(instructionRaw)));
    const repeat = REPEAT_OPTIONS.includes(raw.repeat as RepeatCount) ? (raw.repeat as RepeatCount) : DEFAULT_PREFS.repeat;
    const lengthRaw = raw.lengthMinutes ?? raw.timerMinutes;
    const lengthMinutes =
      typeof lengthRaw === 'number' && lengthRaw > 0 ? Math.min(MAX_LENGTH_MINUTES, Math.round(lengthRaw)) : null;
    return { instruction, repeat, lengthMinutes };
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

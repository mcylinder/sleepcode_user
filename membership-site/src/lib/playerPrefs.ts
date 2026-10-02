export const REPEAT_OPTIONS = [1, 2, 4] as const;
export type RepeatCount = (typeof REPEAT_OPTIONS)[number];

export const TIMER_PRESETS = [15, 30, 45, 60, 90, 120, 150, 180, 240, 480];

export interface PlayerPrefs {
  // 0 = all instruction, 100 = all pulse.
  blend: number;
  repeat: RepeatCount;
  // null = no timer; the session loops until paused.
  timerMinutes: number | null;
}

export const DEFAULT_PREFS: PlayerPrefs = { blend: 50, repeat: 1, timerMinutes: null };

const PREFS_KEY = 'sleepcode_player_prefs';

export function loadPlayerPrefs(): PlayerPrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') as Partial<PlayerPrefs>;
    const blend = typeof raw.blend === 'number' ? Math.min(100, Math.max(0, Math.round(raw.blend))) : DEFAULT_PREFS.blend;
    const repeat = REPEAT_OPTIONS.includes(raw.repeat as RepeatCount) ? (raw.repeat as RepeatCount) : DEFAULT_PREFS.repeat;
    const timerMinutes =
      typeof raw.timerMinutes === 'number' && raw.timerMinutes > 0 ? raw.timerMinutes : DEFAULT_PREFS.timerMinutes;
    return { blend, repeat, timerMinutes };
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

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

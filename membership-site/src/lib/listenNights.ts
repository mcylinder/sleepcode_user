const KEY = 'sleepcode_listen_nights';
const KEEP = 14;
const DAY_START_HOUR = 4;

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Local "night" date: before 4am counts as the previous calendar day.
export function nightDateKey(now = new Date()): string {
  const d = new Date(now);
  if (d.getHours() < DAY_START_HOUR) d.setDate(d.getDate() - 1);
  return formatDate(d);
}

export function loadListenNights(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]') as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.filter((x): x is string => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x));
  } catch {
    return [];
  }
}

export function recordListenNight(now = new Date()): void {
  if (typeof window === 'undefined') return;
  const key = nightDateKey(now);
  const nights = loadListenNights().filter((d) => d !== key);
  nights.push(key);
  nights.sort();
  try {
    localStorage.setItem(KEY, JSON.stringify(nights.slice(-KEEP)));
  } catch {
    // Storage unavailable.
  }
}

// Oldest → today (7 nights), with weekday letters and listened flags.
export function lastSevenNights(now = new Date()): { date: string; letter: string; listened: boolean; isToday: boolean }[] {
  const listened = new Set(loadListenNights());
  const todayKey = nightDateKey(now);
  const days: { date: string; letter: string; listened: boolean; isToday: boolean }[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now);
    if (d.getHours() < DAY_START_HOUR) d.setDate(d.getDate() - 1);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const date = formatDate(d);
    days.push({
      date,
      letter: 'SMTWTFS'[d.getDay()],
      listened: listened.has(date),
      isToday: date === todayKey,
    });
  }
  return days;
}

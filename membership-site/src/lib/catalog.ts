import sessionsData from '@/data/sessions.json';

// Each session's audio lives in the media bucket under session/{id}/.
export interface Session {
  id: string;
  title: string;
  theme: string;
  description: string;
  free: boolean;
}

export const SESSIONS: Session[] = sessionsData;

export const THEMES: string[] = Array.from(new Set(SESSIONS.map((session) => session.theme).filter(Boolean)));

// The session the marketing pages offer to play for free.
export const FEATURED_FREE_SESSION: Session | null = SESSIONS.find((session) => session.free) ?? null;

export const MEMBER_ONLY_COUNT = SESSIONS.filter((session) => !session.free).length;

export function findSession(id: string | null | undefined): Session | null {
  return SESSIONS.find((session) => session.id === id) ?? null;
}

export function isLocked(session: Session, isMember: boolean): boolean {
  return !session.free && !isMember;
}

export function playerHref(session: Session): string {
  return `/application/player?session=${encodeURIComponent(session.id)}`;
}

export function moreSessionsLabel(count: number): string {
  return `${count} more ${count === 1 ? 'session' : 'sessions'}`;
}

const LAST_SESSION_KEY = 'sleepcode_last_session';

export interface LastPlayed {
  session: Session;
  playedAt: Date | null;
}

export function loadLastPlayed(): LastPlayed | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LAST_SESSION_KEY);
    if (!raw) return null;
    // Older entries stored only the session id.
    const parsed = raw.startsWith('{') ? (JSON.parse(raw) as { id?: string; at?: number }) : { id: raw };
    const session = findSession(parsed.id);
    if (!session) return null;
    return { session, playedAt: typeof parsed.at === 'number' ? new Date(parsed.at) : null };
  } catch {
    return null;
  }
}

export function saveLastPlayed(session: Session): void {
  try {
    localStorage.setItem(LAST_SESSION_KEY, JSON.stringify({ id: session.id, at: Date.now() }));
  } catch {
    // Storage unavailable; "Continue" just won't appear.
  }
}

// "today", "yesterday", "3 days ago", or a date.
export function playedAgo(date: Date, now = new Date()): string {
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(date)) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return `on ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

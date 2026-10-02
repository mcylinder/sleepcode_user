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

export function findSession(id: string | null | undefined): Session | null {
  return SESSIONS.find((session) => session.id === id) ?? null;
}

export function isLocked(session: Session, isMember: boolean): boolean {
  return !session.free && !isMember;
}

export function playerHref(session: Session): string {
  return `/application/player?session=${encodeURIComponent(session.id)}`;
}

const LAST_SESSION_KEY = 'sleepcode_last_session';

export function loadLastSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    return findSession(localStorage.getItem(LAST_SESSION_KEY));
  } catch {
    return null;
  }
}

export function saveLastSession(session: Session): void {
  try {
    localStorage.setItem(LAST_SESSION_KEY, session.id);
  } catch {
    // Storage unavailable; "Continue" just won't appear.
  }
}

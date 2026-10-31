// Small cookie / sessionStorage helpers for first-visit player UX.

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

const YEAR = 365 * 24 * 60 * 60;
const WEEK = 7 * 24 * 60 * 60;

const INTRO_COOKIE = 'sc_player_intro_seen';
const PROMPT_COOKIE = 'sc_account_prompt_dismissed';
const PROMPT_PENDING = 'sc_account_prompt_pending';
const PROMPT_VISIT = 'sc_account_prompt_shown';

export function hasSeenPlayerIntro(): boolean {
  return readCookie(INTRO_COOKIE) === '1';
}

export function markPlayerIntroSeen(): void {
  writeCookie(INTRO_COOKIE, '1', YEAR);
}

export function canShowAccountPrompt(): boolean {
  if (typeof window === 'undefined') return false;
  if (readCookie(PROMPT_COOKIE) === '1') return false;
  if (sessionStorage.getItem(PROMPT_VISIT) === '1') return false;
  return true;
}

export function markAccountPromptShownThisVisit(): void {
  try {
    sessionStorage.setItem(PROMPT_VISIT, '1');
  } catch {
    // Private mode, etc.
  }
}

// Set when a signed-out visitor leaves mid-session after real listening.
export function markAccountPromptPending(): void {
  writeCookie(PROMPT_PENDING, '1', YEAR);
}

export function hasAccountPromptPending(): boolean {
  return readCookie(PROMPT_PENDING) === '1';
}

export function clearAccountPromptPending(): void {
  writeCookie(PROMPT_PENDING, '', 0);
}

export function dismissAccountPrompt(): void {
  writeCookie(PROMPT_COOKIE, '1', WEEK);
  clearAccountPromptPending();
  markAccountPromptShownThisVisit();
}

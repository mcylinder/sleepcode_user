const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'That email and password don\u2019t match. Try again or reset your password.',
  'auth/wrong-password': 'That email and password don\u2019t match. Try again or reset your password.',
  'auth/user-not-found': 'That email and password don\u2019t match. Try again or reset your password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/email-already-in-use': 'An account already exists with that email. Sign in instead.',
  'auth/weak-password': 'Please choose a password with at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed': 'Network problem. Check your connection and try again.',
  'auth/popup-blocked': 'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/requires-recent-login': 'For your security, please sign in again to continue.',
  'auth/credential-already-in-use': 'That sign-in is already used by a different SleepCoding account.',
  'auth/provider-already-linked': 'That sign-in method is already connected to your account.',
  'auth/no-such-provider': 'That sign-in method isn\u2019t connected to your account.',
  'auth/email-change-needs-verification': 'Check your inbox to confirm the new email address.',
  'auth/account-exists-with-different-credential':
    'That email already has an account with a different sign-in method. Sign in the way you did before.',
  'auth/operation-not-allowed': 'That sign-in method isn\u2019t available right now.',
};

const SILENT_CODES = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled']);

export function authErrorCode(error: unknown): string | null {
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
    return error.code;
  }
  return null;
}

// Returns null when the user simply closed a sign-in window, so callers can skip showing an error.
export function authErrorMessage(error: unknown): string | null {
  const code = authErrorCode(error);
  if (code && SILENT_CODES.has(code)) return null;
  if (code && MESSAGES[code]) return MESSAGES[code];
  if (error instanceof Error && !code) return error.message;
  return 'Something went wrong. Please try again.';
}

import {
  AuthCredential,
  FacebookAuthProvider,
  GoogleAuthProvider,
  OAuthCredential,
  OAuthProvider,
  type AuthProvider,
} from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';

export type SocialProviderId = 'google.com' | 'facebook.com' | 'apple.com';

export const SOCIAL_PROVIDERS: { id: SocialProviderId; label: string }[] = [
  { id: 'google.com', label: 'Google' },
  { id: 'apple.com', label: 'Apple' },
  { id: 'facebook.com', label: 'Facebook' },
];

export const PROVIDER_LABELS: Record<string, string> = {
  password: 'Email and password',
  'google.com': 'Google',
  'apple.com': 'Apple',
  'facebook.com': 'Facebook',
};

// Apple's popup is unreliable in several browsers, so Apple always uses the redirect flow.
export function usesRedirect(id: SocialProviderId): boolean {
  return id === 'apple.com';
}

export function createProvider(id: SocialProviderId): AuthProvider {
  switch (id) {
    case 'google.com':
      return new GoogleAuthProvider();
    case 'facebook.com': {
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      return provider;
    }
    case 'apple.com': {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      return provider;
    }
  }
}

export function credentialFromError(error: FirebaseError): AuthCredential | null {
  return (
    GoogleAuthProvider.credentialFromError(error) ??
    FacebookAuthProvider.credentialFromError(error) ??
    OAuthProvider.credentialFromError(error)
  );
}

const PENDING_CREDENTIAL_KEY = 'sleepcoding_pending_credential';

export interface PendingLink {
  email: string | null;
  providerLabel: string;
}

export function savePendingCredential(credential: AuthCredential, email: string | null): PendingLink {
  const pending = { credential: credential.toJSON(), email, providerId: credential.providerId };
  sessionStorage.setItem(PENDING_CREDENTIAL_KEY, JSON.stringify(pending));
  return { email, providerLabel: PROVIDER_LABELS[credential.providerId] ?? credential.providerId };
}

export function loadPendingCredential(): AuthCredential | null {
  const raw = sessionStorage.getItem(PENDING_CREDENTIAL_KEY);
  if (!raw) return null;
  try {
    const { credential } = JSON.parse(raw);
    return OAuthCredential.fromJSON(credential);
  } catch {
    clearPendingCredential();
    return null;
  }
}

export function clearPendingCredential(): void {
  sessionStorage.removeItem(PENDING_CREDENTIAL_KEY);
}

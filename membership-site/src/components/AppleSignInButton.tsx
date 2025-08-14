'use client';

import * as React from 'react';
import {
  getAuth,
  OAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';

type WithCustomData = { customData?: { email?: string } };

export default function AppleSignInButton() {
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Finish the redirect on mount
  React.useEffect(() => {
    const auth = getAuth();
    void getRedirectResult(auth)
      .then(async (result) => {
        if (!result) return; // no redirect to finish
        // Signed in successfully; result.user is available.
      })
      .catch(async (err: unknown) => {
        const e = err as FirebaseError & WithCustomData;

        if (e.code === 'auth/account-exists-with-different-credential') {
          try {
            const auth = getAuth();
            const email = e.customData?.email;
            const pending = OAuthProvider.credentialFromError(e);
            if (!email || !pending) throw e;

            const methods = await fetchSignInMethodsForEmail(auth, email);

            if (methods.includes('google.com')) {
              const googleRes = await signInWithPopup(auth, new GoogleAuthProvider());
              await linkWithCredential(googleRes.user, pending);
              return;
            }

            if (methods.includes('password')) {
              setErrorMsg(
                'This email is already registered with a password. Sign in with email first, then link Apple in your profile.'
              );
              return;
            }

            setErrorMsg('This email is already registered with a different provider.');
          } catch (linkErr) {
            const le = linkErr as Error;
            setErrorMsg(le.message || 'Failed to link accounts.');
          }
          return;
        }

        setErrorMsg(e.message || 'Apple sign-in failed.');
      });
  }, []);

  const handleApple = React.useCallback(async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const auth = getAuth();
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      await signInWithRedirect(auth, provider); // Firebase sets state and handles /__/auth/handler
    } catch (err) {
      const e = err as Error;
      setErrorMsg(e.message || 'Could not start Apple sign-in.');
      setLoading(false);
    }
  }, []);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleApple}
        disabled={loading}
        className="w-full h-10 rounded-md border flex items-center justify-center gap-2"
        aria-label="Continue with Apple"
      >
        {loading ? 'Redirecting…' : 'Sign in with Apple'}
      </button>

      {errorMsg && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
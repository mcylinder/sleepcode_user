import * as React from "react";
import { getAuth, OAuthProvider, signInWithRedirect, getRedirectResult, linkWithCredential, fetchSignInMethodsForEmail, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// Optional: lift this to a higher-level provider if you want to handle the result elsewhere.
export default function AppleSignInButton() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Finish the redirect on mount
  React.useEffect(() => {
    const auth = getAuth();
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result) return; // no redirect to finish
        // You are signed in — result.user is available
        // If you need the Apple credential: result.providerId === 'apple.com'
      })
      .catch(async (err: any) => {
        // Handle "account-exists-with-different-credential" (common when user already has Google)
        if (err?.code === "auth/account-exists-with-different-credential") {
          try {
            const auth = getAuth();
            const email = err?.customData?.email as string | undefined;
            const pending = OAuthProvider.credentialFromError(err);
            if (!email || !pending) throw err;

            const methods = await fetchSignInMethodsForEmail(auth, email);
            if (methods.includes("google.com")) {
              const g = new GoogleAuthProvider();
              const googleRes = await signInWithPopup(auth, g);
              await linkWithCredential(googleRes.user, pending);
            } else if (methods.includes("password")) {
              setError("This email is already registered with a password. Please sign in with email first, then link Apple in your profile.");
            } else {
              setError("This email is already registered with a different provider.");
            }
          } catch (e: any) {
            setError(e?.message ?? "Failed to link accounts.");
          }
          return;
        }
        setError(err?.message ?? "Apple sign-in failed.");
      });
  }, []);

  const handleApple = async () => {
    setError(null);
    setLoading(true);
    try {
      const auth = getAuth();
      const provider = new OAuthProvider("apple.com");
      provider.addScope("email");
      provider.addScope("name");
      await signInWithRedirect(auth, provider); // Firebase sets state & sends to Apple's hosted page
    } catch (e: any) {
      setError(e?.message ?? "Could not start Apple sign-in.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleApple}
      disabled={loading}
      className="w-full h-10 rounded-md border flex items-center justify-center gap-2"
      aria-label="Continue with Apple"
    >
      {loading ? "Redirecting…" : "Sign in with Apple"}
    </button>
  );
}
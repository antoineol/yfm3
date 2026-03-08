import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function SignIn() {
  const { signIn } = useAuthActions();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSignIn() {
    setSigningIn(true);
    setError(null);
    signIn("google").catch(() => {
      setError("Sign-in failed. Please try again.");
      setSigningIn(false);
    });
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">YFM Deck Optimizer</h1>
      <button
        type="button"
        disabled={signingIn}
        onClick={handleSignIn}
        className="px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {signingIn ? "Signing in…" : "Sign in with Google"}
      </button>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}

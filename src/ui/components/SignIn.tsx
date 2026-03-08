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
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center 40%, rgba(201,168,76,0.08) 0%, transparent 60%)",
        }}
      />
      <div className="relative text-center">
        <h1 className="font-display text-4xl font-bold text-gold mb-2">YFM Deck Optimizer</h1>
        <p className="text-text-secondary text-xs uppercase tracking-[0.25em]">
          Forbidden Memories &middot; Remastered Perfected
        </p>
      </div>
      <button
        type="button"
        disabled={signingIn}
        onClick={handleSignIn}
        className="relative px-8 py-3 bg-bg-panel border border-gold-dim rounded-lg font-medium text-gold
          hover:border-gold hover:shadow-[0_0_16px_var(--color-gold-dim)] transition-all
          disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {signingIn ? "Signing in\u2026" : "Sign in with Google"}
      </button>
      {error && <p className="text-stat-atk text-sm">{error}</p>}
    </div>
  );
}

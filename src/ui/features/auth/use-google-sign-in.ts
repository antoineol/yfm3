import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function useGoogleSignIn() {
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

  return { signingIn, error, handleSignIn };
}

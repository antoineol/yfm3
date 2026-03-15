import { SignInButton } from "@clerk/clerk-react";
import { Button } from "../../components/Button.tsx";

export function SignIn() {
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
      <SignInButton mode="modal">
        <Button size="lg" variant="outline">
          Sign in with Google
        </Button>
      </SignInButton>
    </div>
  );
}

import { useAuthActions } from "@convex-dev/auth/react";

export function Header() {
  const { signOut } = useAuthActions();
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
      <h1 className="font-display text-lg font-bold text-gold">YFM Deck Optimizer</h1>
      <button
        type="button"
        onClick={() => void signOut()}
        className="text-sm text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
      >
        Sign out
      </button>
    </div>
  );
}

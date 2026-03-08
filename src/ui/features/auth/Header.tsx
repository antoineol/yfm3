import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "../../components/Button.tsx";

export function Header() {
  const { signOut } = useAuthActions();

  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
      <h1 className="font-display text-lg font-bold text-gold">YFM Deck Optimizer</h1>
      <Button variant="ghost" size="sm" onClick={() => void signOut()}>
        Sign out
      </Button>
    </div>
  );
}

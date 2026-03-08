import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Button } from "../../components/Button.tsx";
import { Dialog } from "../../components/Dialog.tsx";
import { ConfigPanel } from "../config/ConfigPanel.tsx";
import { OptimizeButton } from "../optimize/OptimizeButton.tsx";

export function Header() {
  const { signOut } = useAuthActions();
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
      <h1 className="font-display text-lg font-bold text-gold">YFM Deck Optimizer</h1>
      <div className="flex items-center gap-3">
        <OptimizeButton />
        <Button variant="ghost" size="sm" onClick={() => setConfigOpen(true)}>
          Settings
        </Button>
        <Button variant="ghost" size="sm" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
      <Dialog open={configOpen} onClose={() => setConfigOpen(false)} title="Settings">
        <ConfigPanel />
      </Dialog>
    </div>
  );
}

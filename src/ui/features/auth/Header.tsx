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
        <Button onClick={() => setConfigOpen(true)} size="sm" variant="ghost">
          Settings
        </Button>
        <Button onClick={() => void signOut()} size="sm" variant="ghost">
          Sign out
        </Button>
      </div>
      <Dialog onClose={() => setConfigOpen(false)} open={configOpen} title="Settings">
        <ConfigPanel />
      </Dialog>
    </div>
  );
}

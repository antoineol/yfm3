import { useAuthActions } from "@convex-dev/auth/react";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "../../components/Dialog.tsx";
import { ConfigPanel } from "../config/ConfigPanel.tsx";
import { OptimizeButton } from "../optimize/OptimizeButton.tsx";

export function Header() {
  const { signOut } = useAuthActions();
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle">
      <h1 className="font-display text-lg font-bold text-gold">YFM Deck Optimizer</h1>
      <div className="flex items-center gap-3">
        <OptimizeButton />
        <HeaderMenu onSettings={() => setConfigOpen(true)} onSignOut={() => void signOut()} />
      </div>
      <Dialog onClose={() => setConfigOpen(false)} open={configOpen} title="Settings">
        <ConfigPanel />
      </Dialog>
    </div>
  );
}

function HeaderMenu({ onSettings, onSignOut }: { onSettings: () => void; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-label="Menu"
        className="size-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-secondary hover:bg-bg-hover transition-colors cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 16 16">
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-bg-panel border border-border-accent rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.4)] py-1 min-w-[140px]">
          <MenuEntry
            onClick={() => {
              onSettings();
              setOpen(false);
            }}
          >
            Settings
          </MenuEntry>
          <MenuEntry
            onClick={() => {
              onSignOut();
              setOpen(false);
            }}
          >
            Sign out
          </MenuEntry>
        </div>
      )}
    </div>
  );
}

function MenuEntry({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

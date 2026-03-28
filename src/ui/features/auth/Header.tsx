import { Menu } from "@base-ui/react/menu";
import { Tabs } from "@base-ui/react/tabs";
import { useClerk } from "@clerk/clerk-react";
import { useSetAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { MODS, type ModId } from "../../../engine/mods.ts";
import { Dialog } from "../../components/Dialog.tsx";
import { IconButton } from "../../components/IconButton.tsx";
import { useUpdatePreferences } from "../../db/use-update-preferences.ts";
import { useBridgeAutoSync } from "../../db/use-user-preferences.ts";
import { manualSetupModalOpenAtom } from "../../lib/atoms.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import type { DuelPhase } from "../../lib/use-emulator-bridge.ts";
import { useSelectedMod, useSetSelectedMod } from "../../lib/use-selected-mod.ts";
import { BridgeUpdateDialog } from "../bridge/BridgeUpdateDialog.tsx";
import { BRIDGE_MIN_VERSION } from "../bridge/bridge-constants.ts";
import { ConfigPanel } from "../config/ConfigPanel.tsx";
import { CheatModeToggle } from "../hand/CheatModeToggle.tsx";

const tabClass =
  "relative py-2.5 font-display text-sm font-bold uppercase tracking-widest text-text-secondary transition-colors duration-200 hover:text-text-primary cursor-pointer data-active:text-gold-bright no-underline";

export function Header() {
  const bridge = useBridge();
  const bridgeAutoSync = useBridgeAutoSync();
  const updatePreferences = useUpdatePreferences();
  const setManualSetupOpen = useSetAtom(manualSetupModalOpenAtom);
  const { signOut } = useClerk();
  const [configOpen, setConfigOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const hasUpdate = bridge.version != null && bridge.version < BRIDGE_MIN_VERSION;

  // Auto-dismiss the update modal once the bridge reports a current version
  useEffect(() => {
    if (!hasUpdate) setUpdateOpen(false);
  }, [hasUpdate]);

  const handleSetupGuide = useCallback(() => {
    if (bridgeAutoSync) {
      updatePreferences({ bridgeAutoSync: null });
    } else {
      setManualSetupOpen(true);
    }
  }, [bridgeAutoSync, updatePreferences, setManualSetupOpen]);

  return (
    <div className="lg:grid lg:grid-cols-[1fr_auto_1fr] flex justify-between items-center px-3 py-1.5 lg:py-2 border-b border-border-subtle">
      <div className="flex items-center gap-2 min-w-0">
        <CheatModeToggle />
        {bridge.inDuel ? (
          <DuelPhaseIndicator />
        ) : (
          <h1 className="hidden lg:block font-display text-lg font-bold text-gold">YFM Copilot</h1>
        )}
        <ModSelector />
      </div>

      <Tabs.List className="relative hidden lg:flex items-center gap-8 self-stretch">
        <Tabs.Tab
          className={tabClass}
          nativeButton={false}
          render={(props) => <a {...props} href="#duel" />}
          value="duel"
        >
          Duel
        </Tabs.Tab>
        <Tabs.Tab
          className={tabClass}
          nativeButton={false}
          render={(props) => <a {...props} href="#deck" />}
          value="deck"
        >
          Deck
        </Tabs.Tab>
        <Tabs.Tab
          className={tabClass}
          nativeButton={false}
          render={(props) => <a {...props} href="#data" />}
          value="data"
        >
          Data
        </Tabs.Tab>
        <Tabs.Indicator className="absolute bottom-0 left-0 h-0.75 rounded-full bg-gold transition-all duration-250 ease-out" />
      </Tabs.List>

      <div className="flex items-center gap-3 justify-end">
        <BridgeToggle hasUpdate={hasUpdate} onUpdate={() => setUpdateOpen(true)} />
        <HeaderMenu
          onSettings={() => setConfigOpen(true)}
          onSetupGuide={handleSetupGuide}
          onSignOut={() => void signOut()}
        />
      </div>
      <Dialog onClose={() => setConfigOpen(false)} open={configOpen} title="Settings">
        <ConfigPanel onClose={() => setConfigOpen(false)} />
      </Dialog>
      {bridge.version && (
        <BridgeUpdateDialog
          currentVersion={bridge.version}
          onClose={() => setUpdateOpen(false)}
          open={updateOpen}
        />
      )}
    </div>
  );
}

const menuItemClass =
  "w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-text-primary data-highlighted:text-text-primary data-highlighted:bg-bg-hover transition-colors cursor-pointer";

function BridgeToggle({ hasUpdate, onUpdate }: { hasUpdate: boolean; onUpdate: () => void }) {
  const bridge = useBridge();
  const bridgeAutoSync = useBridgeAutoSync();
  const updatePreferences = useUpdatePreferences();

  const handleToggle = useCallback(() => {
    updatePreferences({ bridgeAutoSync: !bridgeAutoSync });
  }, [bridgeAutoSync, updatePreferences]);

  const isReady = bridge.status === "connected" && bridge.detail === "ready";
  const hasIssue = bridge.status === "connected" && bridge.detail !== "ready";

  const statusClass = isReady
    ? "bridge-status--connected"
    : hasIssue
      ? "bridge-status--issue"
      : "bridge-status--connecting";

  const statusLabel = isReady
    ? "Synced"
    : hasIssue
      ? bridge.detail === "emulator_not_found"
        ? "No emulator"
        : bridge.detail === "no_shared_memory"
          ? "Setup needed"
          : bridge.detail === "waiting_for_game"
            ? "No game"
            : "Error"
      : "Connecting";

  const statusTitle = isReady
    ? "Emulator connected and syncing"
    : hasIssue
      ? `Bridge connected — ${bridge.detail.replace(/_/g, " ")}`
      : "Connecting to bridge…";

  return (
    <div className="flex items-center gap-2.5">
      {bridgeAutoSync && (
        <span className={`bridge-status ${statusClass}`} title={statusTitle}>
          <span className="bridge-status-dot" />
          <span className="bridge-status-label hidden lg:inline">{statusLabel}</span>
        </span>
      )}

      <button
        aria-label={bridgeAutoSync ? "Disable game sync" : "Enable game sync"}
        className={`bridge-switch ${bridgeAutoSync ? "bridge-switch--on" : ""}`}
        onClick={handleToggle}
        type="button"
      >
        <span className="bridge-switch-track">
          <span className="bridge-switch-thumb" />
        </span>
        <span className="bridge-switch-label">Sync</span>
      </button>

      {hasUpdate && (
        <button
          className="px-2 py-1 rounded-md text-[11px] font-bold font-display uppercase tracking-wide bg-yellow-400/15 text-yellow-400 hover:bg-yellow-400/25 transition-colors cursor-pointer"
          onClick={onUpdate}
          type="button"
        >
          <span className="hidden sm:inline">Update</span>
          <svg
            aria-hidden="true"
            className="size-4 sm:hidden"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 5v14m0 0-5-5m5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

function ModSelector() {
  const selectedMod = useSelectedMod();
  const setSelectedMod = useSetSelectedMod();
  const bridgeAutoSync = useBridgeAutoSync();
  const modEntries = Object.values(MODS);

  if (bridgeAutoSync) return null;

  return (
    <select
      className="min-w-0 bg-bg-panel border border-border-subtle rounded px-1.5 py-0.5 text-xs font-display text-text-secondary hover:text-text-primary cursor-pointer focus:outline-none focus:border-border-accent truncate"
      onChange={(e) => void setSelectedMod({ selectedMod: e.target.value as ModId })}
      value={selectedMod}
    >
      {modEntries.map((mod) => (
        <option key={mod.id} value={mod.id}>
          {mod.name}
        </option>
      ))}
    </select>
  );
}

// ── Duel phase indicator (shown in header during duel) ─────────

const HEADER_PHASE_CONFIG: Record<
  DuelPhase,
  { label: string; dotColor: string; pulse?: boolean; textColor: string }
> = {
  hand: { label: "Your turn", dotColor: "bg-green-400", textColor: "text-green-400" },
  draw: { label: "Drawing", dotColor: "bg-green-400", pulse: true, textColor: "text-green-400" },
  fusion: {
    label: "Fusing",
    dotColor: "bg-yellow-400",
    pulse: true,
    textColor: "text-yellow-400/90",
  },
  field: { label: "Field play", dotColor: "bg-yellow-400", textColor: "text-yellow-400/90" },
  battle: { label: "Battle", dotColor: "bg-yellow-400", textColor: "text-yellow-400/90" },
  opponent: { label: "Opponent", dotColor: "bg-blue-400", textColor: "text-blue-400/90" },
  ended: { label: "Duel over", dotColor: "bg-green-400", textColor: "text-green-400" },
  other: { label: "In duel", dotColor: "bg-neutral-500", textColor: "text-text-muted" },
};

function DuelPhaseIndicator() {
  const bridge = useBridge();
  const cfg = HEADER_PHASE_CONFIG[bridge.phase];

  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`inline-block w-2 h-2 rounded-full shrink-0 ${cfg.dotColor} ${cfg.pulse ? "animate-pulse" : ""}`}
      />
      <span className={`font-display font-semibold uppercase tracking-wider ${cfg.textColor}`}>
        {cfg.label}
      </span>
    </div>
  );
}

function HeaderMenu({
  onSetupGuide,
  onSettings,
  onSignOut,
}: {
  onSetupGuide: () => void;
  onSettings: () => void;
  onSignOut: () => void;
}) {
  return (
    <Menu.Root>
      <Menu.Trigger render={<IconButton label="Menu" />}>
        <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 16 16">
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={4}>
          <Menu.Popup className="z-50 bg-bg-panel border border-border-accent rounded-lg shadow-dropdown py-1 min-w-35">
            <Menu.Item className={menuItemClass} onClick={onSetupGuide}>
              Setup guide
            </Menu.Item>
            <Menu.Item className={menuItemClass} onClick={onSettings}>
              Settings
            </Menu.Item>
            <Menu.Item className={menuItemClass} onClick={onSignOut}>
              Sign out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

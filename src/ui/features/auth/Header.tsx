import { Menu } from "@base-ui/react/menu";
import { Tabs } from "@base-ui/react/tabs";
import { useClerk } from "@clerk/clerk-react";
import { useState } from "react";
import { Dialog } from "../../components/Dialog.tsx";
import { IconButton } from "../../components/IconButton.tsx";
import type { EmulatorBridge } from "../../lib/use-emulator-bridge.ts";
import { BridgeUpdateDialog } from "../bridge/BridgeUpdateDialog.tsx";
import { BRIDGE_MIN_VERSION } from "../bridge/bridge-constants.ts";
import { ConfigPanel } from "../config/ConfigPanel.tsx";

const tabClass =
  "relative py-2.5 font-display text-sm font-bold uppercase tracking-widest text-text-secondary transition-colors duration-200 hover:text-text-primary cursor-pointer data-active:text-gold-bright no-underline";

export function Header({
  bridge,
  onToggleBridge,
}: {
  bridge: EmulatorBridge;
  onToggleBridge: () => void;
}) {
  const { signOut } = useClerk();
  const [configOpen, setConfigOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);

  const hasUpdate = bridge.version != null && bridge.version < BRIDGE_MIN_VERSION;

  return (
    <div className="lg:grid lg:grid-cols-[1fr_auto_1fr] flex justify-between items-center px-3 py-1.5 lg:py-2 border-b border-border-subtle">
      <h1 className="font-display text-base lg:text-lg font-bold text-gold">YFM Copilot</h1>

      <Tabs.List className="relative hidden lg:flex items-center gap-8 self-stretch">
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
          render={(props) => <a {...props} href="#duel" />}
          value="duel"
        >
          Duel
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
        <BridgeToggle
          bridge={bridge}
          hasUpdate={hasUpdate}
          onToggle={onToggleBridge}
          onUpdate={() => setUpdateOpen(true)}
        />
        <HeaderMenu onSettings={() => setConfigOpen(true)} onSignOut={() => void signOut()} />
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

function BridgeToggle({
  bridge,
  hasUpdate,
  onToggle,
  onUpdate,
}: {
  bridge: EmulatorBridge;
  hasUpdate: boolean;
  onToggle: () => void;
  onUpdate: () => void;
}) {
  const isOn = bridge.status !== "disconnected";
  const isConnected = bridge.status === "connected";
  return (
    <div className="flex items-center gap-1">
      <button
        aria-label={isOn ? "Disable auto-sync" : "Enable auto-sync"}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        onClick={onToggle}
        type="button"
      >
        <span
          className={`size-2 rounded-full ${isConnected ? "bg-green-400" : isOn ? "bg-yellow-400 animate-pulse" : "bg-text-muted/40"}`}
        />
        <span className="hidden sm:inline">
          {isConnected ? "Synced" : isOn ? "Connecting" : "Sync off"}
        </span>
      </button>
      {hasUpdate && (
        <button
          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-400/15 text-yellow-400 hover:bg-yellow-400/25 transition-colors cursor-pointer"
          onClick={onUpdate}
          type="button"
        >
          Update
        </button>
      )}
    </div>
  );
}

function HeaderMenu({ onSettings, onSignOut }: { onSettings: () => void; onSignOut: () => void }) {
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

import { Menu } from "@base-ui/react/menu";
import { Tabs } from "@base-ui/react/tabs";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Dialog } from "../../components/Dialog.tsx";
import { IconButton } from "../../components/IconButton.tsx";
import { ConfigPanel } from "../config/ConfigPanel.tsx";

const tabClass =
  "relative py-2.5 font-display text-xs font-semibold uppercase tracking-widest text-text-secondary transition-colors duration-200 hover:text-text-primary cursor-pointer data-active:text-gold-bright no-underline";

export function Header() {
  const { signOut } = useAuthActions();
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <div className="flex items-center px-3 py-2 border-b border-border-subtle">
      <h1 className="font-display text-lg font-bold text-gold mr-6">YFM Deck Optimizer</h1>

      <Tabs.List className="relative flex items-center gap-6 flex-1 self-stretch">
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
          render={(props) => <a {...props} href="#hand" />}
          value="hand"
        >
          Hand
        </Tabs.Tab>
        <Tabs.Indicator className="absolute bottom-0 left-0 h-0.5 bg-gold transition-all duration-250 ease-out" />
      </Tabs.List>

      <div className="flex items-center gap-3">
        <HeaderMenu onSettings={() => setConfigOpen(true)} onSignOut={() => void signOut()} />
      </div>
      <Dialog onClose={() => setConfigOpen(false)} open={configOpen} title="Settings">
        <ConfigPanel />
      </Dialog>
    </div>
  );
}

const menuItemClass =
  "w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-text-primary data-highlighted:text-text-primary data-highlighted:bg-bg-hover transition-colors cursor-pointer";

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
          <Menu.Popup className="z-50 bg-bg-panel border border-border-accent rounded-lg shadow-dropdown py-1 min-w-[140px]">
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

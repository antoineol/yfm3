import { Tabs } from "@base-ui/react/tabs";

const tabClass =
  "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-display font-bold uppercase tracking-widest transition-colors text-text-secondary data-active:text-gold-bright cursor-pointer";

export function BottomTabBar() {
  return (
    <Tabs.List className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex bg-bg-panel/95 backdrop-blur-sm border-t border-border-subtle pb-[env(safe-area-inset-bottom)]">
      <Tabs.Tab
        className={tabClass}
        nativeButton={false}
        render={(props) => <a {...props} href="#deck" />}
        value="deck"
      >
        <DeckIcon />
        Deck
      </Tabs.Tab>
      <Tabs.Tab
        className={tabClass}
        nativeButton={false}
        render={(props) => <a {...props} href="#duel" />}
        value="duel"
      >
        <HandIcon />
        Duel
      </Tabs.Tab>
      <Tabs.Tab
        className={tabClass}
        nativeButton={false}
        render={(props) => <a {...props} href="#data" />}
        value="data"
      >
        <DataIcon />
        Data
      </Tabs.Tab>
    </Tabs.List>
  );
}

function DeckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <rect height="14" rx="2" width="10" x="7" y="5" />
      <path d="M5 7v10a2 2 0 002 2h10" opacity=".5" />
      <path d="M3 9v8a2 2 0 002 2h8" opacity=".3" />
    </svg>
  );
}

function HandIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path d="M18 11V6a2 2 0 10-4 0v5" />
      <path d="M14 11V4a2 2 0 10-4 0v7" />
      <path d="M10 10.5V6a2 2 0 10-4 0v8c0 4.4 3.6 8 8 8h0a8 8 0 008-8v-4a2 2 0 10-4 0v4" />
    </svg>
  );
}

function DataIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
      <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </svg>
  );
}

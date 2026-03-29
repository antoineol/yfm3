import { Tabs } from "@base-ui/react/tabs";

const tabClass =
  "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-display font-bold uppercase tracking-widest transition-colors text-text-secondary data-active:text-gold-bright cursor-pointer";

export function BottomTabBar() {
  return (
    <Tabs.List className="lg:hidden shrink-0 flex bg-bg-panel/95 backdrop-blur-sm border-t border-border-subtle pb-[env(safe-area-inset-bottom)]">
      <Tabs.Tab
        className={tabClass}
        nativeButton={false}
        render={(props) => <a {...props} href="#duel" />}
        value="duel"
      >
        <DuelIcon />
        Duel
      </Tabs.Tab>
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

function DuelIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path d="M6 3l10 10M6 3H3v3l10 10" />
      <path d="M18 3L8 13m10-10h3v3L11 16" />
      <path d="M3 21l5-5M21 21l-5-5" />
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

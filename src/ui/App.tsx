import { Tabs } from "@base-ui/react/tabs";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { setConfig } from "../engine/config.ts";
import { modIdForFingerprint } from "../engine/mods.ts";
import { BottomTabBar } from "./components/BottomTabBar.tsx";
import { PanelCard } from "./components/panel-chrome.tsx";
import { RequireReferenceData } from "./components/RequireReferenceData.tsx";
import { useBridgeAutoSync } from "./db/use-user-preferences.ts";
import { Header } from "./features/auth/Header.tsx";
import { GameDataErrorBanner } from "./features/bridge/GameDataErrorBanner.tsx";
import { ModMismatchBanner } from "./features/bridge/ModMismatchBanner.tsx";
import { CollectionPanel } from "./features/collection/CollectionPanel.tsx";
import { useAutoSyncCollection } from "./features/collection/use-auto-sync-collection.ts";
import { CardDetailModal } from "./features/data/CardDetailModal.tsx";
import { DataPanel } from "./features/data/DataPanel.tsx";
import { DeckPanel } from "./features/deck/DeckPanel.tsx";
import { DeckSubTabs } from "./features/deck/DeckSubTabs.tsx";
import { DuelPage } from "./features/duel/DuelPage.tsx";
import { FarmPanelWrapper } from "./features/farm/FarmPanel.tsx";
import { ManualSetupModal } from "./features/onboarding/ManualSetupModal.tsx";
import { TabOnboardingGate, useShowOnboarding } from "./features/onboarding/TabOnboardingGate.tsx";
import { ResultPanel } from "./features/result/ResultPanel.tsx";
import { deckSubTabAtom } from "./lib/atoms.ts";
import { BridgeProvider } from "./lib/bridge-context.tsx";
import { useHydrateBridgeSnapshot } from "./lib/bridge-snapshot-atoms.ts";
import { FusionTableProvider, useHasReferenceData } from "./lib/fusion-table-context.tsx";
import { writeLocal } from "./lib/local-store.ts";
import { useEmulatorBridge } from "./lib/use-emulator-bridge.ts";
import { LOCAL_MOD_KEY, useSelectedMod } from "./lib/use-selected-mod.ts";
import { useTabFromHash } from "./lib/use-tab-from-hash.ts";

const TABS = ["deck", "duel", "data"] as const;

function CardDetailModalWhenReady() {
  const hasData = useHasReferenceData();
  if (!hasData) return null;
  return <CardDetailModal />;
}

export default function App() {
  const [tab] = useTabFromHash(TABS, "duel");
  return <MainApp tab={tab} />;
}

function MainApp({ tab }: { tab: string }) {
  const bridgeAutoSync = useBridgeAutoSync();
  const bridge = useEmulatorBridge(bridgeAutoSync);
  const modId = useSelectedMod();

  useHydrateBridgeSnapshot(modId);
  useAutoSyncCollection(bridge);

  // Push the live RAM-scanned field bonus table into the engine config so
  // UI-thread consumers (FieldDisplay) compute mod-aware ATK/DEF.
  const fieldBonusTable = bridge.gameData?.fieldBonusTable ?? null;
  useEffect(() => {
    setConfig({ fieldBonusTable });
  }, [fieldBonusTable]);

  // Auto-detect mod from bridge fingerprint in auto-sync mode.
  // When the detected mod changes, persist to localStorage and reload
  // so the app re-hydrates with the new mod's snapshot data.
  useEffect(() => {
    if (!bridgeAutoSync || !bridge.modFingerprint) return;
    const detected = modIdForFingerprint(bridge.modFingerprint);
    if (detected && detected !== modId) {
      writeLocal(LOCAL_MOD_KEY, detected);
      window.location.reload();
    }
  }, [bridgeAutoSync, bridge.modFingerprint, modId]);

  return (
    <BridgeProvider bridge={bridge}>
      <FusionTableProvider>
        <Tabs.Root className="h-dvh flex flex-col overflow-hidden" value={tab}>
          <Header />
          <ModMismatchBanner />
          <GameDataErrorBanner />
          <DeckTabPanel />

          <Tabs.Panel className="flex-1 min-h-0 px-3 pt-2 pb-6 overflow-y-auto" value="duel">
            <TabOnboardingGate>
              <RequireReferenceData>
                <DuelPage />
              </RequireReferenceData>
            </TabOnboardingGate>
          </Tabs.Panel>

          <Tabs.Panel className="flex-1 min-h-0 px-3 pt-2 pb-3 overflow-y-auto" value="data">
            <RequireReferenceData>
              <DataPanel />
            </RequireReferenceData>
          </Tabs.Panel>
          <BottomTabBar />
          <ManualSetupModal />
          <CardDetailModalWhenReady />
        </Tabs.Root>
      </FusionTableProvider>
    </BridgeProvider>
  );
}

// ── Deck tab (needs bridge context for layout decision) ───────────

function DeckTabPanel() {
  const showOnboarding = useShowOnboarding();

  return (
    <Tabs.Panel
      className={`flex-1 min-h-0 flex flex-col gap-3 px-3 pt-2 pb-3 xl:overflow-y-auto ${showOnboarding ? "flex" : "lg:grid lg:grid-cols-[5fr_4fr] xl:grid-cols-[5fr_4fr_4fr_4fr]"}`}
      value="deck"
    >
      <TabOnboardingGate>
        <RequireReferenceData>
          <DeckSubTabs />
          <DeckSubPanel value="collection">
            <CollectionPanel />
          </DeckSubPanel>
          <DeckSubPanel value="deck">
            <DeckPanel />
          </DeckSubPanel>
          <DeckSubPanel value="result">
            <ResultPanel />
          </DeckSubPanel>
          <DeckSubPanel value="farm">
            <FarmPanelWrapper />
          </DeckSubPanel>
        </RequireReferenceData>
      </TabOnboardingGate>
    </Tabs.Panel>
  );
}

// ── Deck sub-panel ───────────────────────────────────────────────

function DeckSubPanel({
  value,
  className = "",
  children,
}: {
  value: "collection" | "deck" | "result" | "farm";
  className?: string;
  children: React.ReactNode;
}) {
  const activeSubTab = useAtomValue(deckSubTabAtom);
  const isActive = activeSubTab === value;

  return (
    <PanelCard className={`${isActive ? "" : "max-lg:hidden"} ${className} max-lg:flex-1`}>
      {children}
    </PanelCard>
  );
}

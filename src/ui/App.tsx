import { Tabs } from "@base-ui/react/tabs";
import { useConvexAuth } from "convex/react";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { BottomTabBar } from "./components/BottomTabBar.tsx";
import { CardDetailModal } from "./components/CardDetailModal.tsx";
import { LoaderBlock } from "./components/Loader.tsx";
import { PanelCard } from "./components/panel-chrome.tsx";
import { RequireReferenceData } from "./components/RequireReferenceData.tsx";
import { useUpdatePreferences } from "./db/use-update-preferences.ts";
import { useBridgeAutoSync } from "./db/use-user-preferences.ts";
import { Header } from "./features/auth/Header.tsx";
import { SignIn } from "./features/auth/SignIn.tsx";
import { BridgeSetupGuide } from "./features/bridge/BridgeSetupGuide.tsx";
import { CollectionPanel } from "./features/collection/CollectionPanel.tsx";
import { useAutoSyncCollection } from "./features/collection/use-auto-sync-collection.ts";
import { DataPanel } from "./features/data/DataPanel.tsx";
import { DeckPanel } from "./features/deck/DeckPanel.tsx";
import { DeckSubTabs } from "./features/deck/DeckSubTabs.tsx";
import { HandFusionCalculator } from "./features/hand/HandFusionCalculator.tsx";
import { ResultPanel } from "./features/result/ResultPanel.tsx";
import { deckSubTabAtom } from "./lib/atoms.ts";
import { FusionTableProvider, useHasReferenceData } from "./lib/fusion-table-context.tsx";
import { useEmulatorBridge } from "./lib/use-emulator-bridge.ts";
import { useTabFromHash } from "./lib/use-tab-from-hash.ts";

const TABS = ["deck", "duel", "data"] as const;

function CardDetailModalWhenReady() {
  const hasData = useHasReferenceData();
  if (!hasData) return null;
  return <CardDetailModal />;
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [tab, setTab] = useTabFromHash(TABS, "deck");

  if (isLoading) {
    return <LoaderBlock />;
  }

  if (!isAuthenticated) {
    return <SignIn />;
  }

  return <AuthenticatedApp setTab={setTab} tab={tab} />;
}

function AuthenticatedApp({ tab, setTab }: { tab: string; setTab: (t: string) => void }) {
  const bridgeAutoSync = useBridgeAutoSync();
  const bridge = useEmulatorBridge(bridgeAutoSync);
  const updatePreferences = useUpdatePreferences();

  useAutoSyncCollection(bridge);

  const handleToggleBridge = useCallback(() => {
    updatePreferences({ bridgeAutoSync: !bridgeAutoSync });
  }, [bridgeAutoSync, updatePreferences]);

  const showBridgeSetup = bridgeAutoSync && bridge.detail !== "ready";

  return (
    <FusionTableProvider>
      <Tabs.Root className="h-dvh flex flex-col overflow-hidden" onValueChange={setTab} value={tab}>
        <Header
          bridge={bridge}
          bridgeAutoSync={bridgeAutoSync}
          onToggleBridge={handleToggleBridge}
        />

        <Tabs.Panel
          className={`flex-1 min-h-0 flex flex-col gap-3 px-3 pt-2 pb-16 lg:pb-3 xl:overflow-y-auto ${showBridgeSetup ? "flex" : "lg:grid lg:grid-cols-[5fr_4fr] xl:grid-cols-[5fr_4fr_4fr]"}`}
          value="deck"
        >
          {showBridgeSetup ? (
            <BridgeSetupGuide bridge={bridge} onDisableSync={handleToggleBridge} />
          ) : (
            <RequireReferenceData>
              <DeckSubTabs />
              <DeckSubPanel value="collection">
                <CollectionPanel />
              </DeckSubPanel>
              <DeckSubPanel value="deck">
                <DeckPanel />
              </DeckSubPanel>
              <DeckSubPanel className="lg:col-span-2 xl:col-span-1" value="result">
                <ResultPanel />
              </DeckSubPanel>
            </RequireReferenceData>
          )}
        </Tabs.Panel>

        <Tabs.Panel className="flex-1 px-3 pt-4 pb-16 lg:pb-6 overflow-y-auto" value="duel">
          {showBridgeSetup ? (
            <BridgeSetupGuide bridge={bridge} onDisableSync={handleToggleBridge} />
          ) : (
            <RequireReferenceData>
              <HandFusionCalculator bridge={bridge} />
            </RequireReferenceData>
          )}
        </Tabs.Panel>

        <Tabs.Panel className="flex-1 px-3 pt-2 pb-16 lg:pb-3 overflow-y-auto" value="data">
          <RequireReferenceData>
            <DataPanel />
          </RequireReferenceData>
        </Tabs.Panel>
        <BottomTabBar />
        <CardDetailModalWhenReady />
      </Tabs.Root>
    </FusionTableProvider>
  );
}

function DeckSubPanel({
  value,
  className = "",
  children,
}: {
  value: "collection" | "deck" | "result";
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

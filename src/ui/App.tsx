import { Tabs } from "@base-ui/react/tabs";
import { useConvexAuth } from "convex/react";
import { LoaderBlock } from "./components/Loader.tsx";
import { PanelCard } from "./components/panel-chrome.tsx";
import { RequireReferenceData } from "./components/RequireReferenceData.tsx";
import { Header } from "./features/auth/Header.tsx";
import { SignIn } from "./features/auth/SignIn.tsx";
import { CollectionPanel } from "./features/collection/CollectionPanel.tsx";
import { DataPanel } from "./features/data/DataPanel.tsx";
import { DeckPanel } from "./features/deck/DeckPanel.tsx";
import { HandFusionCalculator } from "./features/hand/HandFusionCalculator.tsx";
import { ResultPanel } from "./features/result/ResultPanel.tsx";
import { useTabFromHash } from "./lib/use-tab-from-hash.ts";

const TABS = ["deck", "hand", "data"] as const;

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [tab, setTab] = useTabFromHash(TABS, "deck");

  if (isLoading) {
    return <LoaderBlock />;
  }

  if (!isAuthenticated) {
    return <SignIn />;
  }

  return (
    <Tabs.Root className="h-screen xl:h-screen flex flex-col" onValueChange={setTab} value={tab}>
      <Header />

      <Tabs.Panel
        className="flex-1 grid grid-cols-1 lg:grid-cols-[5fr_4fr] xl:grid-cols-[5fr_4fr_4fr] gap-3 px-3 pt-2 pb-3 xl:overflow-y-auto"
        value="deck"
      >
        <RequireReferenceData>
          <PanelCard>
            <CollectionPanel />
          </PanelCard>
          <PanelCard>
            <DeckPanel />
          </PanelCard>
          <PanelCard className="lg:col-span-2 xl:col-span-1">
            <ResultPanel />
          </PanelCard>
        </RequireReferenceData>
      </Tabs.Panel>

      <Tabs.Panel className="flex-1 px-3 pt-4 pb-6 overflow-y-auto" value="hand">
        <RequireReferenceData>
          <HandFusionCalculator />
        </RequireReferenceData>
      </Tabs.Panel>

      <Tabs.Panel className="flex-1 px-3 pt-2 pb-3 overflow-y-auto" value="data">
        <DataPanel />
      </Tabs.Panel>
    </Tabs.Root>
  );
}

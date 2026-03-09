import { useConvexAuth } from "convex/react";
import { LoaderBlock } from "./components/Loader.tsx";
import { PanelCard } from "./components/panel-chrome.tsx";
import { Header } from "./features/auth/Header.tsx";
import { SignIn } from "./features/auth/SignIn.tsx";
import { CollectionPanel } from "./features/collection/CollectionPanel.tsx";
import { DeckPanel } from "./features/deck/DeckPanel.tsx";
import { ResultPanel } from "./features/result/ResultPanel.tsx";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <LoaderBlock />;
  }

  if (!isAuthenticated) {
    return <SignIn />;
  }

  return (
    <div className="min-h-screen xl:h-screen flex flex-col">
      <Header />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[5fr_4fr] xl:grid-cols-[5fr_4fr_4fr] gap-3 px-3 pt-2 pb-3 xl:flex-1 xl:overflow-y-auto">
        <PanelCard>
          <CollectionPanel />
        </PanelCard>
        <PanelCard>
          <DeckPanel />
        </PanelCard>
        <PanelCard className="lg:col-span-2 xl:col-span-1">
          <ResultPanel />
        </PanelCard>
      </div>
    </div>
  );
}

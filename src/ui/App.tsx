import { useConvexAuth } from "convex/react";
import { LoaderBlock } from "./components/Loader.tsx";
import { Header } from "./features/auth/Header.tsx";
import { SignIn } from "./features/auth/SignIn.tsx";
import { CollectionPanel } from "./features/collection/CollectionPanel.tsx";
import { ConfigPanel } from "./features/config/ConfigPanel.tsx";
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <ConfigPanel />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[5fr_4fr] xl:grid-cols-[5fr_4fr_4fr] gap-5 px-5 pb-5">
        <div className="min-w-0 bg-bg-panel border border-border-subtle rounded-xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
          <CollectionPanel />
        </div>
        <div className="min-w-0 bg-bg-panel border border-border-subtle rounded-xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
          <DeckPanel />
        </div>
        <div className="min-w-0 bg-bg-panel border border-border-subtle rounded-xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.3)] lg:col-span-2 xl:col-span-1">
          <ResultPanel />
        </div>
      </div>
    </div>
  );
}

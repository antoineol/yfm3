import { useConvexAuth } from "convex/react";
import { CollectionPanel } from "./components/CollectionPanel.tsx";
import { ConfigPanel } from "./components/ConfigPanel.tsx";
import { DeckPanel } from "./components/DeckPanel.tsx";
import { Header } from "./components/Header.tsx";
import { ResultPanel } from "./components/ResultPanel.tsx";
import { SignIn } from "./components/SignIn.tsx";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignIn />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <Header />
      <ConfigPanel />
      <div className="flex gap-6">
        <div className="flex-1">
          <CollectionPanel />
        </div>
        <div className="flex-1">
          <DeckPanel />
        </div>
        <div className="flex-1">
          <ResultPanel />
        </div>
      </div>
    </div>
  );
}

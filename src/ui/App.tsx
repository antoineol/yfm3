import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Collection } from "../engine/data/card-model.ts";
import type { OptimizeDeckResult } from "../engine/index-browser.ts";
import { optimizeDeck } from "../engine/index-browser.ts";
import { CollectionPanel } from "./components/CollectionPanel.tsx";
import { DeckPanel } from "./components/DeckPanel.tsx";
import { ResultPanel } from "./components/ResultPanel.tsx";
import { useUserId } from "./lib/use-user-id.ts";

export default function App() {
  const [userId, setUserId] = useUserId();
  const [result, setResult] = useState<OptimizeDeckResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const deck = useQuery(api.deck.getDeck, userId ? { userId } : "skip");

  function handleOptimize(collectionRecord: Record<number, number>) {
    setIsOptimizing(true);
    setResult(null);
    const currentDeck = deck?.map((d) => d.cardId);
    setTimeout(() => {
      try {
        const collection: Collection = new Map(
          Object.entries(collectionRecord).map(([id, qty]) => [Number(id), qty]),
        );
        const res = optimizeDeck(collection, { currentDeck });
        setResult(res);
      } catch (err) {
        console.error("Optimization failed:", err);
      } finally {
        setIsOptimizing(false);
      }
    }, 0);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <h1 className="text-xl font-bold mb-4">YFM Deck Optimizer</h1>
      <label className="mb-4 flex items-center gap-2 text-sm">
        User ID:
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="px-2 py-1 bg-gray-800 border border-gray-600 rounded w-64"
          placeholder="Enter user ID"
        />
      </label>
      <div className="flex gap-6">
        <div className="flex-1">
          <CollectionPanel
            userId={userId}
            onOptimize={handleOptimize}
            isOptimizing={isOptimizing}
          />
        </div>
        <div className="flex-1">
          <DeckPanel userId={userId} />
        </div>
        <div className="flex-1">
          <ResultPanel result={result} />
        </div>
      </div>
    </div>
  );
}

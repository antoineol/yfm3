import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Collection } from "../engine/data/card-model.ts";
import type { OptimizeDeckParallelResult } from "../engine/index-browser.ts";
import { optimizeDeckParallel } from "../engine/index-browser.ts";
import { DECK_SIZE } from "../engine/types/constants.ts";
import { CollectionPanel } from "./components/CollectionPanel.tsx";
import { ConfigPanel } from "./components/ConfigPanel.tsx";
import { DeckPanel } from "./components/DeckPanel.tsx";
import { ResultPanel } from "./components/ResultPanel.tsx";
import { useUserId } from "./lib/use-user-id.ts";

export default function App() {
  const [userId, setUserId] = useUserId();
  const [result, setResult] = useState<OptimizeDeckParallelResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [deckSize, setDeckSize] = useState(DECK_SIZE);
  const deck = useQuery(api.deck.getDeck, userId ? { userId } : "skip");
  const prefs = useQuery(api.collection.getUserPreferences, userId ? { userId } : "skip");
  const updatePreferences = useMutation(api.collection.updatePreferences);

  // Sync deckSize from loaded preferences
  useEffect(() => {
    if (prefs?.deckSize != null) {
      setDeckSize(prefs.deckSize);
    }
  }, [prefs?.deckSize]);

  function handleDeckSizeChange(size: number) {
    setDeckSize(size);
    if (userId) {
      updatePreferences({ userId, deckSize: size });
    }
  }

  function handleOptimize(collectionRecord: Record<number, number>) {
    setIsOptimizing(true);
    setResult(null);
    const currentDeck = deck?.map((d) => d.cardId);
    const collection: Collection = new Map(
      Object.entries(collectionRecord).map(([id, qty]) => [Number(id), qty]),
    );
    optimizeDeckParallel(collection, { currentDeck, deckSize })
      .then((res) => setResult(res))
      .catch((err) => console.error("Optimization failed:", err))
      .finally(() => setIsOptimizing(false));
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
      <ConfigPanel
        deckSize={deckSize}
        onDeckSizeChange={handleDeckSizeChange}
        isOptimizing={isOptimizing}
      />
      <div className="flex gap-6">
        <div className="flex-1">
          <CollectionPanel
            userId={userId}
            onOptimize={handleOptimize}
            isOptimizing={isOptimizing}
            deckSize={deckSize}
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

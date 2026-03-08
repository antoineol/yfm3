import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DECK_SIZE, HAND_SIZE } from "../../engine/types/constants.ts";
import { useCardDb } from "../lib/card-db-context.tsx";

interface CollectionPanelProps {
  userId: string;
  onOptimize: (collection: Record<number, number>) => void;
  isOptimizing: boolean;
  deckSize: number;
  onDeckSizeChange: (size: number) => void;
}

export function CollectionPanel({
  userId,
  onOptimize,
  isOptimizing,
  deckSize,
  onDeckSizeChange,
}: CollectionPanelProps) {
  const collection = useQuery(api.collection.getCollection, userId ? { userId } : "skip");
  const cardDb = useCardDb();

  if (!userId) return <div className="text-gray-500">Enter a user ID to load collection.</div>;
  if (collection === undefined) return <div className="text-gray-500">Loading collection...</div>;

  const entries = Object.entries(collection)
    .map(([idStr, qty]) => {
      const id = Number(idStr);
      const card = cardDb.cardsById.get(id);
      return { id, name: card?.name ?? `#${id}`, atk: card?.attack ?? 0, qty };
    })
    .sort((a, b) => b.atk - a.atk);

  const totalCards = entries.reduce((sum, e) => sum + e.qty, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">Collection ({totalCards} cards)</h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 text-sm">
            Deck size:
            <input
              type="number"
              min={HAND_SIZE}
              max={DECK_SIZE}
              value={deckSize}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v >= HAND_SIZE && v <= DECK_SIZE) onDeckSizeChange(v);
              }}
              className="w-16 px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-center"
              disabled={isOptimizing}
            />
          </label>
          <button
            type="button"
            className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
            disabled={isOptimizing || totalCards < deckSize}
            onClick={() => onOptimize(collection)}
          >
            {isOptimizing ? "Optimizing..." : "Optimize Deck"}
          </button>
        </div>
      </div>
      <div className="max-h-[70vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-800">
            <tr>
              <th className="text-left p-1">Card</th>
              <th className="text-right p-1">ATK</th>
              <th className="text-right p-1">Qty</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-t border-gray-700">
                <td className="p-1">{e.name}</td>
                <td className="text-right p-1">{e.atk}</td>
                <td className="text-right p-1">{e.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

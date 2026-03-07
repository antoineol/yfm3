import type { OptimizeDeckResult } from "../../engine/index-browser.ts";
import { useCardDb } from "../lib/card-db-context.tsx";

interface ResultPanelProps {
  result: OptimizeDeckResult | null;
}

export function ResultPanel({ result }: ResultPanelProps) {
  const cardDb = useCardDb();

  if (!result) {
    return <div className="text-gray-500">Run the optimizer to see results.</div>;
  }

  // Group deck cards by id and count
  const counts = new Map<number, number>();
  for (const id of result.deck) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  const entries = [...counts.entries()]
    .map(([id, qty]) => {
      const card = cardDb.cardsById.get(id);
      return { id, name: card?.name ?? `#${id}`, atk: card?.attack ?? 0, qty };
    })
    .sort((a, b) => b.atk - a.atk);

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Optimized Deck ({result.deck.length} cards)</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3 p-2 bg-gray-800 rounded">
        {result.currentDeckScore != null && (
          <>
            <span>Current deck:</span>
            <span className="font-mono text-right">{result.currentDeckScore.toFixed(1)}</span>
          </>
        )}
        <span>New deck:</span>
        <span className="font-mono text-right">{result.expectedAtk.toFixed(1)}</span>
        {result.improvement != null && (
          <>
            <span>Improvement:</span>
            <span className="font-mono text-right text-green-400">
              +{result.improvement.toFixed(1)}
            </span>
          </>
        )}
        <span>Elapsed:</span>
        <span className="font-mono text-right">{(result.elapsedMs / 1000).toFixed(1)}s</span>
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
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

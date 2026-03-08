import { useDeck } from "../db/use-deck.ts";
import { useCardDb } from "../lib/card-db-context.tsx";

export function DeckPanel() {
  const deck = useDeck();
  const cardDb = useCardDb();

  if (deck === undefined) return <div className="text-gray-500">Loading deck...</div>;
  if (deck.length === 0) return <div className="text-gray-500">No deck found.</div>;

  // Group by cardId and count
  const counts = new Map<number, number>();
  for (const d of deck) {
    counts.set(d.cardId, (counts.get(d.cardId) ?? 0) + 1);
  }

  const entries = [...counts.entries()]
    .map(([id, qty]) => {
      const card = cardDb.cardsById.get(id);
      return { id, name: card?.name ?? `#${id}`, atk: card?.attack ?? 0, qty };
    })
    .sort((a, b) => b.atk - a.atk);

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Current Deck ({deck.length} cards)</h2>
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

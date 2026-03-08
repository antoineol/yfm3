import { useDeck } from "../db/use-deck.ts";
import { useCardDb } from "../lib/card-db-context.tsx";
import { buildCardEntries, CardTable } from "./CardTable.tsx";
import { EmptyState, LoadingState, PanelHeader } from "./panel-chrome.tsx";

export function DeckPanel() {
  const deck = useDeck();
  const cardDb = useCardDb();

  if (deck === undefined) return <LoadingState />;

  if (deck.length === 0) {
    return (
      <>
        <PanelHeader title="Current Deck" />
        <EmptyState
          title="No deck saved yet"
          subtitle="Run the optimizer to generate your best deck"
        />
      </>
    );
  }

  const counts = new Map<number, number>();
  for (const d of deck) {
    counts.set(d.cardId, (counts.get(d.cardId) ?? 0) + 1);
  }

  const entries = buildCardEntries(counts, cardDb);

  return (
    <>
      <PanelHeader title="Current Deck" badge={`${deck.length} cards`} />
      <div className="max-h-[70vh] overflow-y-auto">
        <CardTable entries={entries} />
      </div>
    </>
  );
}

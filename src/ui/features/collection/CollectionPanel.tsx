import { buildCardEntries, CardTable } from "../../components/CardTable.tsx";
import { PanelEmptyState, PanelHeader, PanelLoadingState } from "../../components/panel-chrome.tsx";
import { useCollection } from "../../db/use-collection.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";

export function CollectionPanel() {
  const collection = useCollection();
  const cardDb = useCardDb();

  if (collection === undefined) return <PanelLoadingState />;

  const pairs: [number, number][] = Object.entries(collection).map(([id, qty]) => [
    Number(id),
    qty,
  ]);
  const entries = buildCardEntries(pairs, cardDb);
  const totalCards = entries.reduce((sum, e) => sum + e.qty, 0);
  const uniqueCards = entries.length;

  if (totalCards === 0) {
    return (
      <>
        <PanelHeader title="Collection" />
        <PanelEmptyState
          title="Your collection is empty"
          subtitle="Add cards to begin building your deck"
        />
      </>
    );
  }

  return (
    <>
      <PanelHeader title="Collection" badge={`${totalCards} cards (${uniqueCards} unique)`} />
      <div className="max-h-[70vh] overflow-y-auto">
        <CardTable entries={entries} />
      </div>
    </>
  );
}

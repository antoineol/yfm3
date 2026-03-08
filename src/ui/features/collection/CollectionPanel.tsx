import { CardTable } from "../../components/CardTable.tsx";
import { PanelEmptyState, PanelHeader, PanelLoadingState } from "../../components/panel-chrome.tsx";
import { useCollectionEntries } from "./use-collection-entries.ts";

export function CollectionPanel() {
  const data = useCollectionEntries();

  if (data === undefined) return <PanelLoadingState />;

  const { entries, totalCards, uniqueCards } = data;

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
      <div className="max-xl:max-h-[70vh] overflow-y-auto">
        <CardTable entries={entries} />
      </div>
    </>
  );
}

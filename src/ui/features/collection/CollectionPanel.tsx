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
          subtitle="Add cards to begin building your deck"
          title="Your collection is empty"
        />
      </>
    );
  }

  return (
    <>
      <PanelHeader badge={`${totalCards} cards (${uniqueCards} unique)`} title="Collection" />
      <div className="max-xl:max-h-[70vh] flex-1 overflow-y-auto">
        <CardTable entries={entries} />
      </div>
    </>
  );
}

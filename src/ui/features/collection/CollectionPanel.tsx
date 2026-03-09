import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { CardAutocomplete } from "../../components/CardAutocomplete.tsx";
import { CardTable } from "../../components/CardTable.tsx";
import { PanelEmptyState, PanelHeader, PanelLoadingState } from "../../components/panel-chrome.tsx";
import { useCollectionEntries } from "./use-collection-entries.ts";

export function CollectionPanel() {
  const data = useCollectionEntries();
  const addCard = useMutation(api.collection.addCard);

  if (data === undefined) return <PanelLoadingState />;

  const { entries, totalCards, uniqueCards } = data;

  return (
    <>
      <PanelHeader
        badge={totalCards > 0 ? `${totalCards} cards (${uniqueCards} unique)` : undefined}
        title="Collection"
      />
      <div className="pb-2">
        <CardAutocomplete
          onSelect={(card) => void addCard({ cardId: card.id })}
          placeholder="Add card to collection..."
        />
      </div>
      {totalCards === 0 ? (
        <PanelEmptyState
          subtitle="Search above to add cards to your collection"
          title="Your collection is empty"
        />
      ) : (
        <div className="max-xl:max-h-[70vh] flex-1 overflow-y-auto">
          <CardTable entries={entries} />
        </div>
      )}
    </>
  );
}

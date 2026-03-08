import { CardTable } from "../../components/CardTable.tsx";
import { PanelEmptyState, PanelHeader, PanelLoadingState } from "../../components/panel-chrome.tsx";
import { useDeckEntries } from "./use-deck-entries.ts";

export function DeckPanel() {
  const data = useDeckEntries();

  if (data === undefined) return <PanelLoadingState />;

  const { entries, deckLength } = data;

  if (deckLength === 0) {
    return (
      <>
        <PanelHeader title="Current Deck" />
        <PanelEmptyState
          title="No deck saved yet"
          subtitle="Run the optimizer to generate your best deck"
        />
      </>
    );
  }

  return (
    <>
      <PanelHeader title="Current Deck" badge={`${deckLength} cards`} />
      <div className="max-h-[70vh] overflow-y-auto">
        <CardTable entries={entries} />
      </div>
    </>
  );
}

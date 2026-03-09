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
          subtitle="Run the optimizer to generate your best deck"
          title="No deck saved yet"
        />
      </>
    );
  }

  return (
    <>
      <PanelHeader badge={`${deckLength} cards`} title="Current Deck" />
      <div className="max-xl:max-h-[70vh] flex-1 overflow-y-auto">
        <CardTable entries={entries} />
      </div>
    </>
  );
}

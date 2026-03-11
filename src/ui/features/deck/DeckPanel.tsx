import { CardTable } from "../../components/CardTable.tsx";
import {
  PanelBody,
  PanelEmptyState,
  PanelHeader,
  PanelLoadingState,
} from "../../components/panel-chrome.tsx";
import { DeckFusionList } from "./DeckFusionList.tsx";
import { ScoreExplanation } from "./ScoreExplanation.tsx";
import { useDeckEntries } from "./use-deck-entries.ts";

export function DeckPanel() {
  const data = useDeckEntries();

  if (data === undefined) return <PanelLoadingState />;

  const { entries, deckLength, deckCardIds } = data;

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
      <PanelBody>
        <CardTable entries={entries} />
        <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-border-subtle">
          <DeckFusionList deckCardIds={deckCardIds} />
          <ScoreExplanation deckCardIds={deckCardIds} />
        </div>
      </PanelBody>
    </>
  );
}

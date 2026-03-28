import { CardTable } from "../../components/CardTable.tsx";
import { PanelBody } from "../../components/panel-chrome.tsx";
import { DeckFusionList } from "../deck/DeckFusionList.tsx";
import { ScoreExplanation } from "../deck/ScoreExplanation.tsx";
import type { ResultData } from "./use-result-entries.ts";

export function SuggestedDeckComparison({ data }: { data: ResultData }) {
  const { entries, result } = data;

  return (
    <PanelBody>
      <CardTable entries={entries} />
      <div className="flex flex-col gap-4 mt-4 pt-4 px-3 border-t border-border-subtle">
        <DeckFusionList deckCardIds={result.deck} />
        <ScoreExplanation deckCardIds={result.deck} />
      </div>
    </PanelBody>
  );
}

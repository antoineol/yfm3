import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { CardActionButton } from "../../components/CardActionButton.tsx";
import { type CardEntry, CardTable } from "../../components/CardTable.tsx";
import {
  PanelBody,
  PanelEmptyState,
  PanelHeader,
  PanelLoadingState,
} from "../../components/panel-chrome.tsx";
import { useDeckSize } from "../../db/use-user-preferences.ts";
import { DeckFusionList } from "./DeckFusionList.tsx";
import { ScoreExplanation } from "./ScoreExplanation.tsx";
import { useDeckEntries } from "./use-deck-entries.ts";
import { useDeckScore } from "./use-deck-score.ts";

export function DeckPanel() {
  const data = useDeckEntries();
  const targetSize = useDeckSize();
  const removeOne = useMutation(api.deck.removeOneByCardId);
  const score = useDeckScore(data?.deckCardIds ?? []);

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

  const sizeOk = deckLength === targetSize;

  function renderLeftActions(entry: CardEntry) {
    return (
      <CardActionButton
        onClick={() => void removeOne({ cardId: entry.id })}
        title="Remove from deck"
        variant="from-deck"
      >
        <svg
          aria-hidden="true"
          className="w-3.5 h-3.5 inline-block"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M10 3l-5 5 5 5V3z" />
        </svg>
      </CardActionButton>
    );
  }

  return (
    <>
      <PanelHeader
        badge={
          <span className={sizeOk ? "" : "text-orange-400"}>
            {deckLength}/{targetSize}
          </span>
        }
        title="Current Deck"
      >
        <DeckScoreBadge score={score} />
      </PanelHeader>
      <PanelBody>
        <CardTable entries={entries} leftActions={renderLeftActions} />
        <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-border-subtle">
          <DeckFusionList deckCardIds={deckCardIds} />
          <ScoreExplanation deckCardIds={deckCardIds} />
        </div>
      </PanelBody>
    </>
  );
}

function DeckScoreBadge({ score }: { score: number | null }) {
  if (score == null) return null;
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-sm lg:text-xs text-text-secondary uppercase tracking-wide">ATK</span>
      <span className="font-mono font-bold text-base lg:text-sm text-gold">{score.toFixed(1)}</span>
    </div>
  );
}

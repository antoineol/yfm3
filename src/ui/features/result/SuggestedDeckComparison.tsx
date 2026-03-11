import { useMutation } from "convex/react";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "../../components/Button.tsx";
import { CardTable } from "../../components/CardTable.tsx";
import { PanelBody } from "../../components/panel-chrome.tsx";
import { resultAtom } from "../../lib/atoms.ts";
import { StatItem } from "./StatCard.tsx";
import type { ResultData } from "./use-result-entries.ts";

export function SuggestedDeckComparison({
  data,
  onOptimize,
}: {
  data: ResultData;
  onOptimize: () => void;
}) {
  const { entries, result } = data;
  const setResult = useSetAtom(resultAtom);
  const acceptDeck = useMutation(api.deck.acceptSuggestedDeck);
  const [accepting, setAccepting] = useState(false);

  const improvementPct =
    result.currentDeckScore != null && result.currentDeckScore > 0 && result.improvement != null
      ? ((result.improvement / result.currentDeckScore) * 100).toFixed(1)
      : null;

  function handleAccept() {
    setAccepting(true);
    acceptDeck({ cardIds: result.deck })
      .then(() => setResult(null))
      .catch((err) => console.error("Accept failed:", err))
      .finally(() => setAccepting(false));
  }

  function handleReject() {
    setResult(null);
  }

  function handleRerun() {
    onOptimize();
  }

  return (
    <>
      <div className="flex items-baseline flex-wrap gap-x-5 gap-y-2 mb-3">
        <StatItem hero label="Suggested ATK" value={result.expectedAtk.toFixed(1)} />
        {result.currentDeckScore != null && (
          <StatItem label="Current Deck" value={result.currentDeckScore.toFixed(1)} />
        )}
        {result.improvement != null && (
          <StatItem
            label="Improvement"
            value={`\u25b2 ${result.improvement.toFixed(1)}${improvementPct ? ` (+${improvementPct}%)` : ""}`}
            variant="up"
          />
        )}
        <StatItem label="Elapsed" muted value={`${(result.elapsedMs / 1000).toFixed(1)}s`} />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Button disabled={accepting} onClick={handleAccept} size="sm">
          {accepting ? "Saving\u2026" : "Accept Deck"}
        </Button>
        <Button disabled={accepting} onClick={handleReject} size="sm" variant="outline">
          Reject
        </Button>
        <Button disabled={accepting} onClick={handleRerun} size="sm" variant="ghost">
          Re-run
        </Button>
      </div>

      <PanelBody>
        <CardTable entries={entries} />
      </PanelBody>
    </>
  );
}

import { useMemo } from "react";
import type { CardSpec } from "../../../engine/data/card-model.ts";
import type { OptimizeDeckParallelResult } from "../../../engine/index-browser.ts";
import { CardName } from "../../components/CardName.tsx";
import { countById } from "../../components/CardTable.tsx";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { formatCardId } from "../../lib/format.ts";
import type { PostDuelSuggestion as PostDuelSuggestionData } from "./use-post-duel-suggestion.ts";

export function PostDuelSuggestion({ suggestion }: { suggestion: PostDuelSuggestionData }) {
  const { state, progress, liveBestScore, result, currentDeck, dismiss } = suggestion;

  if (state === "optimizing") {
    return <OptimizingState liveBestScore={liveBestScore} progress={progress} />;
  }

  if (state === "result" && result) {
    return <ResultState currentDeck={currentDeck} onDismiss={dismiss} result={result} />;
  }

  if (state === "no_change") {
    return <NoChangeState onDismiss={dismiss} />;
  }

  return null;
}

// ── Optimizing state ─────────────────────────────────────────────────

function OptimizingState({ progress, liveBestScore }: { progress: number; liveBestScore: number }) {
  const pct = Math.round(progress * 100);

  return (
    <div className="fm-post-duel">
      <div className="fm-post-duel-header">
        <span className="fm-post-duel-title">Optimizing deck…</span>
        {liveBestScore > 0 && (
          <span className="font-mono text-xs text-gold">~{liveBestScore.toFixed(1)}</span>
        )}
      </div>
      <div className="fm-post-duel-progress-track">
        <div className="fm-post-duel-progress-fill" style={{ width: `${String(pct)}%` }} />
      </div>
    </div>
  );
}

// ── Result state: show deck diff ─────────────────────────────────────

interface DiffRow {
  cardId: number;
  card: CardSpec | undefined;
  type: "removed" | "added";
}

function ResultState({
  result,
  currentDeck,
  onDismiss,
}: {
  result: OptimizeDeckParallelResult;
  currentDeck: number[];
  onDismiss: () => void;
}) {
  const { cardsById } = useCardDb();

  const diffRows = useMemo(
    () => buildPostDuelDiff(currentDeck, result.deck, cardsById),
    [currentDeck, result.deck, cardsById],
  );
  const removedRows = diffRows.filter((r) => r.type === "removed");
  const addedRows = diffRows.filter((r) => r.type === "added");

  const improvementPct =
    result.currentDeckScore != null && result.currentDeckScore > 0 && result.improvement != null
      ? ((result.improvement / result.currentDeckScore) * 100).toFixed(1)
      : null;

  const changeCount = removedRows.length;

  return (
    <div className="fm-post-duel">
      <div className="fm-post-duel-header">
        <span className="fm-post-duel-title">
          {String(changeCount)} card{changeCount !== 1 ? "s" : ""} to swap
        </span>
        <div className="flex items-center gap-2">
          {improvementPct && (
            <span className="font-mono text-xs text-stat-up">+{improvementPct}%</span>
          )}
          <span className="font-mono text-xs text-gold">{result.expectedAtk.toFixed(1)} ATK</span>
        </div>
      </div>

      {removedRows.length > 0 && <DiffSection label="Remove" rows={removedRows} type="removed" />}
      {addedRows.length > 0 && <DiffSection label="Add" rows={addedRows} type="added" />}

      <div className="fm-post-duel-footer">
        <span className="text-text-muted text-xs">Update your in-game deck to match</span>
        <button
          className="text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
          onClick={onDismiss}
          type="button"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

function DiffSection({
  label,
  rows,
  type,
}: {
  label: string;
  rows: DiffRow[];
  type: "removed" | "added";
}) {
  const colorClass = type === "removed" ? "text-stat-atk" : "text-stat-up";
  const icon = type === "removed" ? "\u2212" : "+";

  return (
    <div className="fm-post-duel-diff-section">
      <div className={`fm-post-duel-diff-label ${colorClass}`}>{label}</div>
      <ul className="fm-post-duel-diff-list">
        {rows.map((row, i) => (
          <li className="fm-post-duel-diff-row" key={`${type}-${String(row.cardId)}-${String(i)}`}>
            <span className={`fm-post-duel-diff-icon ${colorClass}`}>{icon}</span>
            <CardName
              cardId={row.cardId}
              className={`flex-1 min-w-0 text-sm ${colorClass}`}
              name={`#${formatCardId(row.cardId)} ${row.card?.name ?? "?"}`}
            />
            {row.card?.isMonster && (
              <span className={`font-mono text-xs ${colorClass} tabular-nums`}>
                {row.card.attack}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── No-change state ──────────────────────────────────────────────────

function NoChangeState({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fm-post-duel">
      <div className="fm-post-duel-header">
        <span className="fm-post-duel-title">Your deck is already optimal</span>
      </div>
      <p className="text-text-muted text-sm text-center py-4">
        No improvements found with the new cards.
      </p>
      <div className="fm-post-duel-footer">
        <span />
        <button
          className="text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
          onClick={onDismiss}
          type="button"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

// ── Diff computation ─────────────────────────────────────────────────

/**
 * Build compact diff rows showing only removed and added cards
 * between the current deck and the optimizer's suggested deck.
 */
export function buildPostDuelDiff(
  currentDeckIds: number[],
  suggestedDeckIds: number[],
  cardsById: Map<number, CardSpec>,
): DiffRow[] {
  const currentCounts = countById(currentDeckIds);
  const suggestedCounts = countById(suggestedDeckIds);
  const allIds = new Set([...currentCounts.keys(), ...suggestedCounts.keys()]);
  const rows: DiffRow[] = [];

  for (const id of allIds) {
    const cur = currentCounts.get(id) ?? 0;
    const sug = suggestedCounts.get(id) ?? 0;
    const card = cardsById.get(id);

    if (cur > sug) {
      for (let i = 0; i < cur - sug; i++) rows.push({ cardId: id, card, type: "removed" });
    } else if (sug > cur) {
      for (let i = 0; i < sug - cur; i++) rows.push({ cardId: id, card, type: "added" });
    }
  }

  // Sort: removed first (by ATK desc), then added (by ATK desc)
  rows.sort((a, b) => {
    if (a.type !== b.type) return a.type === "removed" ? -1 : 1;
    return (b.card?.attack ?? 0) - (a.card?.attack ?? 0);
  });

  return rows;
}

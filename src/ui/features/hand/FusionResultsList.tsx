import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Fragment, useMemo, useState } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
import { type FusionChainResult, findFusionChains } from "../../../engine/fusion-chain-finder.ts";
import { Button } from "../../components/Button.tsx";
import { CardName } from "../../components/CardName.tsx";
import type { HandCard } from "../../db/use-hand.ts";
import { useFusionDepth } from "../../db/use-user-preferences.ts";
import type { FieldCard } from "../../lib/bridge-state-interpreter.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { formatCardId } from "../../lib/format.ts";
import { useFusionTable } from "../../lib/fusion-table-context.tsx";
import { FusionCardThumb } from "./FusionCardThumb.tsx";
import { FusionChainSteps } from "./FusionChainSteps.tsx";

export function FusionResultsList({
  handCards,
  fieldCards,
  onPlayFusion,
  terrain = 0,
}: {
  handCards: HandCard[];
  fieldCards?: FieldCard[];
  onPlayFusion?: (materialDocIds: Id<"hand">[], result: FusionChainResult) => void;
  terrain?: number;
}) {
  const { fusionTable, equipCompat } = useFusionTable();
  const cardDb = useCardDb();
  const fusionDepth = useFusionDepth();
  const [animateRef] = useAutoAnimate();
  const handCardIds = useMemo(() => handCards.map((c) => c.cardId), [handCards]);
  const results = useMemo(
    () =>
      handCardIds.length >= 1
        ? findFusionChains(
            handCardIds,
            fusionTable,
            cardDb,
            fusionDepth,
            equipCompat,
            fieldCards,
            terrain,
          )
        : [],
    [handCardIds, fusionTable, cardDb, fusionDepth, equipCompat, fieldCards, terrain],
  );

  if (handCardIds.length < 1) return null;

  if (results.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-text-muted text-sm">No plays possible with this hand</p>
      </div>
    );
  }

  // Keep natural ATK-sorted order. Extra field plays collapse after the first one.
  const firstFieldIdx = results.findIndex((r) => r.fieldMaterialCardIds.length > 0);
  const extraFieldPlays =
    firstFieldIdx >= 0
      ? results.filter((r, i) => i > firstFieldIdx && r.fieldMaterialCardIds.length > 0)
      : [];
  const extraFieldSet = new Set(extraFieldPlays);

  return (
    <div className="flex flex-col gap-1.5" ref={animateRef}>
      {results.map((r, i) => {
        // Skip extra field plays in the main list — they appear in the collapsed section
        if (extraFieldSet.has(r)) return null;
        return (
          <Fragment
            key={`${r.fieldMaterialCardIds.length > 0 ? "f" : ""}${String(r.resultCardId)}+${r.equipCardIds.join(",")}`}
          >
            <FusionResultRow handCards={handCards} onPlay={onPlayFusion ?? undefined} result={r} />
            {/* After the first field play, insert the collapsed extras */}
            {i === firstFieldIdx && extraFieldPlays.length > 0 && (
              <CollapsedFieldPlays
                fieldPlays={extraFieldPlays}
                handCards={handCards}
                onPlay={onPlayFusion ?? undefined}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

/** Collapse extra field plays behind an expander. */
function CollapsedFieldPlays({
  fieldPlays,
  handCards,
  onPlay,
}: {
  fieldPlays: FusionChainResult[];
  handCards: HandCard[];
  onPlay?: (materialDocIds: Id<"hand">[], result: FusionChainResult) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {!expanded && (
        <button
          className="flex items-center justify-center gap-1.5 py-1.5 text-xs text-sky-400/80 hover:text-sky-400 transition-colors cursor-pointer rounded-lg border border-dashed border-sky-400/20 hover:border-sky-400/40 hover:bg-sky-400/5"
          onClick={() => setExpanded(true)}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="size-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 16 16"
          >
            <rect height="10" rx="1.5" width="14" x="1" y="3" />
            <line x1="8" x2="8" y1="3" y2="13" />
          </svg>
          {fieldPlays.length} more field {fieldPlays.length === 1 ? "play" : "plays"}
        </button>
      )}
      {expanded && (
        <>
          {fieldPlays.map((r) => (
            <FusionResultRow
              handCards={handCards}
              key={`f${String(r.resultCardId)}+${r.equipCardIds.join(",")}`}
              onPlay={onPlay}
              result={r}
            />
          ))}
          <button
            className="flex items-center justify-center gap-1.5 py-1.5 text-xs text-sky-400/80 hover:text-sky-400 transition-colors cursor-pointer rounded-lg border border-dashed border-sky-400/20 hover:border-sky-400/40 hover:bg-sky-400/5"
            onClick={() => setExpanded(false)}
            type="button"
          >
            Hide field plays
          </button>
        </>
      )}
    </>
  );
}

function FusionResultRow({
  result,
  handCards,
  onPlay,
}: {
  result: FusionChainResult;
  handCards: HandCard[];
  onPlay?: (materialDocIds: Id<"hand">[], result: FusionChainResult) => void;
}) {
  const cardDb = useCardDb();
  const materialDocIds = useMemo(
    () => (onPlay ? resolveMaterialDocs(result.materialCardIds, handCards) : []),
    [result.materialCardIds, handCards, onPlay],
  );
  const card = cardDb.cardsById.get(result.resultCardId);
  const usesField = result.fieldMaterialCardIds.length > 0;

  return (
    <div className="group flex gap-2.5 rounded-lg border border-border-subtle/60 bg-bg-surface/60 px-3 py-3 lg:py-2.5 hover:border-border-accent transition-colors duration-150">
      {/* Card thumbnail */}
      {card && <FusionCardThumb card={card} />}

      {/* Details */}
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        {/* Result header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0 font-mono text-[10px] tabular-nums text-text-muted">
              {formatCardId(result.resultCardId)}
            </span>
            <CardName
              cardId={result.resultCardId}
              className="font-display text-sm text-gold-bright truncate"
              name={result.resultName}
            />
            {usesField && <FieldBadge />}
          </div>
          <div className="flex items-baseline gap-3 shrink-0">
            <div className="flex items-baseline gap-1.5 w-24 justify-end">
              <span className="font-mono text-base font-bold tabular-nums text-stat-atk">
                {result.resultAtk}
              </span>
              <span className="font-mono text-xs tabular-nums text-stat-def">
                {result.resultDef}
              </span>
            </div>
            {onPlay && (
              <Button onClick={() => onPlay(materialDocIds, result)} size="md" variant="outline">
                Play
              </Button>
            )}
          </div>
        </div>

        {/* Chain steps — numbered material list */}
        <FusionChainSteps
          equipCardIds={result.equipCardIds}
          fieldMaterialCardIds={result.fieldMaterialCardIds}
          steps={result.steps}
        />
      </div>
    </div>
  );
}

function FieldBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-sky-400/15 text-sky-400 border border-sky-400/25 shrink-0">
      <svg
        aria-hidden="true"
        className="size-2.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 16 16"
      >
        <rect height="10" rx="1.5" width="14" x="1" y="3" />
        <line x1="8" x2="8" y1="3" y2="13" />
      </svg>
      Field
    </span>
  );
}

/**
 * Map material card IDs back to Convex document IDs.
 * Greedily matches each material to a hand doc, consuming each doc at most once.
 */
function resolveMaterialDocs(materialCardIds: number[], handCards: HandCard[]): Id<"hand">[] {
  const used = new Set<Id<"hand">>();
  const docIds: Id<"hand">[] = [];

  for (const cardId of materialCardIds) {
    const match = handCards.find((hc) => hc.cardId === cardId && !used.has(hc.docId));
    if (match) {
      used.add(match.docId);
      docIds.push(match.docId);
    }
  }
  return docIds;
}

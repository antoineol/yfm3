import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useMemo } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { CardDb } from "../../../engine/data/game-db.ts";
import {
  type FusionChainResult,
  type FusionStep,
  findFusionChains,
} from "../../../engine/fusion-chain-finder.ts";
import { Button } from "../../components/Button.tsx";
import type { HandCard } from "../../db/use-hand.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { formatCardId } from "../../lib/format.ts";
import { useFusionTable } from "../../lib/fusion-table-context.tsx";

export function FusionResultsList({
  handCards,
  fusionDepth,
  onPlayFusion,
}: {
  handCards: HandCard[];
  fusionDepth: number;
  onPlayFusion: (materialDocIds: Id<"hand">[]) => void;
}) {
  const { fusionTable } = useFusionTable();
  const cardDb = useCardDb();
  const [animateRef] = useAutoAnimate();
  const handCardIds = useMemo(() => handCards.map((c) => c.cardId), [handCards]);

  const results = useMemo(
    () =>
      handCardIds.length >= 2
        ? findFusionChains(handCardIds, fusionTable, cardDb, fusionDepth)
        : [],
    [handCardIds, fusionTable, cardDb, fusionDepth],
  );

  if (handCardIds.length < 2) return null;

  if (results.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-text-muted text-sm">No fusions possible with this hand</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5" ref={animateRef}>
      {results.map((r) => (
        <FusionResultRow
          cardDb={cardDb}
          handCards={handCards}
          key={r.resultCardId}
          onPlay={onPlayFusion}
          result={r}
        />
      ))}
    </div>
  );
}

function FusionResultRow({
  result,
  cardDb,
  handCards,
  onPlay,
}: {
  result: FusionChainResult;
  cardDb: CardDb;
  handCards: HandCard[];
  onPlay: (materialDocIds: Id<"hand">[]) => void;
}) {
  const materialDocIds = useMemo(
    () => resolveMaterialDocs(result.materialCardIds, handCards),
    [result.materialCardIds, handCards],
  );

  return (
    <div className="group flex flex-col gap-1.5 rounded-lg border border-border-subtle/60 bg-bg-surface/60 px-3 py-2.5 hover:border-border-accent transition-colors duration-150">
      {/* Result header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="shrink-0 font-mono text-[10px] tabular-nums text-text-muted">
            {formatCardId(result.resultCardId)}
          </span>
          <span className="font-display text-sm text-gold-bright truncate">
            {result.resultName}
          </span>
        </div>
        <div className="flex items-baseline gap-3 shrink-0">
          <div className="flex items-baseline gap-1.5 w-24 justify-end">
            <span className="font-mono text-base font-bold tabular-nums text-stat-atk">
              {result.resultAtk}
            </span>
            <span className="font-mono text-xs tabular-nums text-stat-def">{result.resultDef}</span>
          </div>
          <Button onClick={() => onPlay(materialDocIds)} size="sm" variant="outline">
            Play
          </Button>
        </div>
      </div>

      {/* Chain steps */}
      <div className="flex flex-col gap-0.5">
        {result.steps.map((step, i) => (
          <ChainStep
            cardDb={cardDb}
            key={stepKey(step)}
            prevResultId={i > 0 ? result.steps[i - 1]?.resultCardId : undefined}
            step={step}
          />
        ))}
      </div>
    </div>
  );
}

function ChainStep({
  step,
  cardDb,
  prevResultId,
}: {
  step: FusionStep;
  cardDb: CardDb;
  /** Result card ID from the previous step, used to order materials so the chain reads naturally. */
  prevResultId?: number;
}) {
  const getName = (id: number) => cardDb.cardsById.get(id)?.name ?? `#${String(id)}`;
  const resultName = getName(step.resultCardId);

  // For continuation steps, show the previous fusion result first
  let firstId = step.material1CardId;
  let secondId = step.material2CardId;
  if (prevResultId !== undefined && step.material2CardId === prevResultId) {
    firstId = step.material2CardId;
    secondId = step.material1CardId;
  }

  return (
    <p className="text-xs text-text-secondary leading-relaxed">
      {prevResultId !== undefined && <span className="text-text-muted mr-1">{"\u21B3"}</span>}
      <span className="text-text-primary">{getName(firstId)}</span>
      <span className="text-gold-dim mx-1">+</span>
      <span className="text-text-primary">{getName(secondId)}</span>
      <span className="text-gold-dim mx-1">{"\u2192"}</span>
      <span className="text-gold">{resultName}</span>
    </p>
  );
}

function stepKey(step: FusionStep): string {
  return `${String(step.material1CardId)}-${String(step.material2CardId)}-${String(step.resultCardId)}`;
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

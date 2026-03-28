import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useMemo, useState } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { CardSpec } from "../../../engine/data/card-model.ts";
import {
  type FusionChainResult,
  type FusionStep,
  findFusionChains,
} from "../../../engine/fusion-chain-finder.ts";
import { Button } from "../../components/Button.tsx";
import { CardName } from "../../components/CardName.tsx";
import type { HandCard } from "../../db/use-hand.ts";
import { useFusionDepth } from "../../db/use-user-preferences.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { useOpenCard } from "../../lib/card-detail-context.tsx";
import { artworkSrc, formatCardId } from "../../lib/format.ts";
import { useFusionTable } from "../../lib/fusion-table-context.tsx";
import type { FieldCard } from "../../lib/use-emulator-bridge.ts";
import { useSelectedMod } from "../../lib/use-selected-mod.ts";

export function FusionResultsList({
  handCards,
  fieldCards,
  onPlayFusion,
}: {
  handCards: HandCard[];
  fieldCards?: FieldCard[];
  onPlayFusion?: (materialDocIds: Id<"hand">[], result: FusionChainResult) => void;
}) {
  const { fusionTable, equipCompat } = useFusionTable();
  const cardDb = useCardDb();
  const fusionDepth = useFusionDepth();
  const [animateRef] = useAutoAnimate();
  const handCardIds = useMemo(() => handCards.map((c) => c.cardId), [handCards]);
  const results = useMemo(
    () =>
      handCardIds.length >= 1
        ? findFusionChains(handCardIds, fusionTable, cardDb, fusionDepth, equipCompat, fieldCards)
        : [],
    [handCardIds, fusionTable, cardDb, fusionDepth, equipCompat, fieldCards],
  );

  if (handCardIds.length < 1) return null;

  if (results.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-text-muted text-sm">No plays possible with this hand</p>
      </div>
    );
  }

  // Split into hand-based plays and field-based plays
  const handPlays = results.filter((r) => r.fieldMaterialCardIds.length === 0);
  const fieldPlays = results.filter((r) => r.fieldMaterialCardIds.length > 0);

  return (
    <div className="flex flex-col gap-1.5" ref={animateRef}>
      {handPlays.map((r) => (
        <FusionResultRow
          handCards={handCards}
          key={`${String(r.resultCardId)}+${r.equipCardIds.join(",")}`}
          onPlay={onPlayFusion ?? undefined}
          result={r}
        />
      ))}
      {fieldPlays.length > 0 && (
        <CollapsedFieldPlays
          fieldPlays={fieldPlays}
          handCards={handCards}
          onPlay={onPlayFusion ?? undefined}
        />
      )}
    </div>
  );
}

/** Show the top field play inline, collapse the rest behind an expander. */
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
  const first = fieldPlays[0];
  const rest = fieldPlays.slice(1);
  if (!first) return null;

  return (
    <>
      <FusionResultRow handCards={handCards} onPlay={onPlay} result={first} />
      {rest.length > 0 && !expanded && (
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
          {rest.length} more field {rest.length === 1 ? "play" : "plays"}
        </button>
      )}
      {expanded &&
        rest.map((r) => (
          <FusionResultRow
            handCards={handCards}
            key={`f${String(r.resultCardId)}+${r.equipCardIds.join(",")}`}
            onPlay={onPlay}
            result={r}
          />
        ))}
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

/** Tiny card thumbnail — full card replica at thumbnail scale, clickable to open detail. */
function FusionCardThumb({ card }: { card: CardSpec }) {
  const openCard = useOpenCard();
  const modId = useSelectedMod();
  const artSrc = artworkSrc(modId, card.id);
  const orbColor = card.attribute ? attributeOrb[card.attribute] : undefined;
  const ct = card.cardType ?? "";
  const p = !card.isMonster && ct ? (cardTypePalettes[ct] ?? monsterPalette) : monsterPalette;

  return (
    <button
      className="fm-fusion-thumb shrink-0 cursor-pointer"
      onClick={() => openCard(card.id)}
      style={
        {
          "--fm-lo": p.lo,
          "--fm-mid": p.mid,
          "--fm-hi": p.hi,
          "--fm-border": p.border,
          "--fm-text": p.text,
        } as React.CSSProperties
      }
      type="button"
    >
      <div className="fm-mini-edge">
        <div className="fm-mini-frame">
          {/* Name band */}
          <div className="fm-mini-name-band">
            <span className="fm-mini-name-text">{card.name}</span>
            {orbColor && (
              <span
                aria-label={card.attribute}
                className="fm-mini-orb"
                role="img"
                style={{
                  background: `radial-gradient(circle at 38% 32%, #fff8 10%, ${orbColor} 50%, ${orbColor}88 100%)`,
                }}
              />
            )}
          </div>

          {/* Artwork */}
          <div className="fm-mini-art-well">
            <img alt={card.name} className="fm-mini-art-img" loading="lazy" src={artSrc} />
          </div>

          {/* ATK / DFD */}
          {card.isMonster && (
            <div className="fm-mini-stats">
              <span className="fm-mini-stat-value fm-mini-stat-value--atk">{card.attack}</span>
              <span className="fm-mini-stat-sep">/</span>
              <span className="fm-mini-stat-value fm-mini-stat-value--def">{card.defense}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

const attributeOrb: Record<string, string> = {
  Light: "#e8c840",
  Dark: "#7848b0",
  Fire: "#d04828",
  Water: "#3868c8",
  Earth: "#a08030",
  Wind: "#48a048",
};

interface FramePalette {
  lo: string;
  mid: string;
  hi: string;
  border: string;
  text: string;
}

const monsterPalette: FramePalette = {
  lo: "#6a5020",
  mid: "#b89838",
  hi: "#d4b850",
  border: "#8a7028",
  text: "#2a1e0a",
};

const cardTypePalettes: Record<string, FramePalette> = {
  Magic: { lo: "#1a5020", mid: "#308838", hi: "#50a858", border: "#246828", text: "#0a2a0e" },
  Equip: { lo: "#1a5020", mid: "#308838", hi: "#50a858", border: "#246828", text: "#0a2a0e" },
  Trap: { lo: "#802058", mid: "#c04888", hi: "#d868a8", border: "#a03070", text: "#2a0a1e" },
  Ritual: { lo: "#183880", mid: "#2858c0", hi: "#4070e0", border: "#1e3090", text: "#0a0e2a" },
};

const STEP_NUMBERS = ["\u2460", "\u2461", "\u2462", "\u2463", "\u2464"];

export type MaterialLine = {
  cardId: number;
  resultCardId?: number;
  fromField?: boolean;
};

export function extractMaterialLines(
  steps: FusionStep[],
  fieldMaterialCardIds?: number[],
): MaterialLine[] {
  const fieldSet = fieldMaterialCardIds ? new Set(fieldMaterialCardIds) : undefined;
  const lines: MaterialLine[] = [];

  for (const [i, step] of steps.entries()) {
    if (i === 0) {
      lines.push({
        cardId: step.material1CardId,
        ...(fieldSet?.has(step.material1CardId) ? { fromField: true } : {}),
      });
      lines.push({ cardId: step.material2CardId, resultCardId: step.resultCardId });
    } else {
      const prev = steps[i - 1];
      if (!prev) continue;
      const newMaterialId =
        step.material1CardId === prev.resultCardId ? step.material2CardId : step.material1CardId;
      lines.push({ cardId: newMaterialId, resultCardId: step.resultCardId });
    }
  }

  return lines;
}

function FusionChainSteps({
  steps,
  equipCardIds,
  fieldMaterialCardIds,
}: {
  steps: FusionStep[];
  equipCardIds: number[];
  fieldMaterialCardIds: number[];
}) {
  const cardDb = useCardDb();
  const getName = (id: number) => cardDb.cardsById.get(id)?.name ?? `#${String(id)}`;
  const lines = extractMaterialLines(steps, fieldMaterialCardIds);
  const stepCount = lines.length;
  const isDirectPlay = steps.length === 0 && equipCardIds.length === 0;

  return (
    <div className="flex flex-col gap-0.5">
      {isDirectPlay && (
        <p className="text-xs text-text-secondary leading-relaxed flex items-baseline gap-1.5">
          <span className="text-gold font-bold text-xs w-4 shrink-0 text-center select-none">
            {STEP_NUMBERS[0]}
          </span>
          <span className="text-amber-400 text-xs font-semibold">Direct</span>
        </p>
      )}
      {lines.map((line, i) => (
        <p
          className="text-xs text-text-secondary leading-relaxed flex items-baseline gap-1.5"
          key={`${String(i)}-${String(line.cardId)}`}
        >
          <span className="text-gold font-bold text-xs w-4 shrink-0 text-center select-none">
            {STEP_NUMBERS[i] ?? String(i + 1)}
          </span>
          {line.fromField && <span className="text-sky-400 text-xs font-semibold">Field</span>}
          <CardName
            cardId={line.cardId}
            className="text-text-primary"
            name={getName(line.cardId)}
          />
          {line.resultCardId !== undefined && (
            <>
              <span className="text-gold-dim mx-0.5">{"\u2192"}</span>
              <CardName
                cardId={line.resultCardId}
                className="text-gold"
                name={getName(line.resultCardId)}
              />
            </>
          )}
        </p>
      ))}
      {equipCardIds.map((eqId, i) => (
        <p
          className="text-xs text-text-secondary leading-relaxed flex items-baseline gap-1.5"
          key={`eq-${String(eqId)}-${String(i)}`}
        >
          <span className="text-gold font-bold text-xs w-4 shrink-0 text-center select-none">
            {STEP_NUMBERS[stepCount + i] ?? String(stepCount + i + 1)}
          </span>
          <span className="text-emerald-400 text-xs">Equip</span>
          <CardName cardId={eqId} className="text-text-primary" name={getName(eqId)} />
        </p>
      ))}
    </div>
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

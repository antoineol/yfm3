import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import type { CardId } from "../../../engine/data/card-model.ts";
import type { DropMode } from "../../../engine/farm/discover-farmable-fusions.ts";
import type {
  SerializedFarmableFusion,
  SerializedFarmDiscoveryResult,
} from "../../../engine/worker/messages.ts";
import { CardName } from "../../components/CardName.tsx";
import {
  PanelBody,
  PanelEmptyState,
  PanelHeader,
  SectionLabel,
} from "../../components/panel-chrome.tsx";
import { ToggleGroup } from "../../components/ToggleGroup.tsx";
import { currentDeckScoreAtom } from "../../lib/atoms.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { formatRate } from "../../lib/format.ts";
import { useFarmDiscovery } from "./use-farm-discovery.ts";

const INITIAL_DISPLAY_LIMIT = 20;

const DROP_MODE_OPTIONS: { value: DropMode; label: string }[] = [
  { value: "pow", label: "POW" },
  { value: "tec", label: "TEC" },
];

/** Reads deckScore from the atom so the parent doesn't need to pass it. */
export function FarmPanelWrapper() {
  const deckScore = useAtomValue(currentDeckScoreAtom);
  return <FarmPanel deckScore={deckScore} />;
}

function FarmPanel({ deckScore }: { deckScore: number | null }) {
  const { pow, tec, status, compute, dropMode, setDropMode } = useFarmDiscovery(deckScore);

  // Trigger computation when the panel mounts (lazy) or when cache is invalidated.
  useEffect(() => {
    if (deckScore != null && status === "idle") compute();
  }, [deckScore, status, compute]);

  const result: SerializedFarmDiscoveryResult | null = dropMode === "pow" ? pow : tec;

  if (deckScore == null) {
    return (
      <>
        <PanelHeader title="Farm Targets" />
        <PanelEmptyState
          subtitle="Complete your deck and wait for it to be scored"
          title="Score your deck to see farm targets"
        />
      </>
    );
  }

  if (status === "loading" || !result) {
    return (
      <>
        <PanelHeader title="Farm Targets" />
        <div className="flex flex-col items-center justify-center py-16 px-3 gap-3">
          <div className="w-8 h-8 border-2 border-gold-dim border-t-gold rounded-full animate-spin-gold" />
          <p className="text-text-secondary text-sm">Discovering farm targets...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PanelHeader
        badge={result.fusions.length > 0 ? <span>{result.fusions.length} targets</span> : undefined}
        title="Farm Targets"
      />
      <PanelBody>
        <div className="flex flex-col gap-4 px-3 py-2">
          <ToggleGroup onChange={setDropMode} options={DROP_MODE_OPTIONS} value={dropMode} />

          {result.fusions.length === 0 ? (
            <p className="text-text-muted text-sm py-4 text-center">
              {dropMode === "tec"
                ? "No monster targets found. TEC drops are mostly non-monster cards (equips, magic) which are not yet analyzed here."
                : "No farmable targets found above your deck score"}
            </p>
          ) : (
            <>
              <DuelistRankingSection ranking={result.duelistRanking} />
              <FusionListSection fusions={result.fusions} />
            </>
          )}
        </div>
      </PanelBody>
    </>
  );
}

// ── Duelist ranking ─────────────────────────────────────────────────

function DuelistRankingSection({
  ranking,
}: {
  ranking: SerializedFarmDiscoveryResult["duelistRanking"];
}) {
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? ranking : ranking.slice(0, 5);

  return (
    <div className="flex flex-col gap-2">
      <button
        aria-expanded={expanded}
        className="flex items-center gap-2 cursor-pointer text-left py-1"
        onClick={() => setExpanded((v) => !v)}
        type="button"
      >
        <CollapseArrow expanded={expanded} />
        <SectionLabel>Top Duelists ({ranking.length})</SectionLabel>
      </button>
      {expanded && (
        <div className="flex flex-col gap-1 pl-5">
          {displayed.map((d) => (
            <DuelistRow duelist={d} key={d.duelistId} />
          ))}
          {ranking.length > 5 && (
            <button
              className="text-xs text-gold-dim hover:text-gold cursor-pointer text-left py-1"
              onClick={() => setShowAll((v) => !v)}
              type="button"
            >
              {showAll ? "Show less" : `+${ranking.length - 5} more`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DuelistRow({
  duelist,
}: {
  duelist: SerializedFarmDiscoveryResult["duelistRanking"][number];
}) {
  return (
    <div className="flex items-baseline gap-3 text-sm py-0.5">
      <a
        className="text-text-primary font-display truncate hover:text-gold transition-colors hover:underline decoration-gold/30 underline-offset-2"
        href={`#data/duelists/${duelist.duelistId}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        {duelist.duelistName}
      </a>
      <span className="text-text-muted text-xs shrink-0">
        {duelist.fusionCount} {duelist.fusionCount === 1 ? "fusion" : "fusions"}
      </span>
      <span className="ml-auto shrink-0 font-mono font-bold text-stat-atk tabular-nums">
        {duelist.bestAtk}
      </span>
    </div>
  );
}

// ── Fusion list ──────────────────────────────────────────────────────

function FusionListSection({ fusions }: { fusions: SerializedFarmableFusion[] }) {
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const groups = useMemo(() => {
    const map = new Map<number, SerializedFarmableFusion[]>();
    for (const f of fusions) {
      const group = map.get(f.depth) ?? [];
      group.push(f);
      map.set(f.depth, group);
    }
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [fusions]);

  const displayLimit = showAll ? Infinity : INITIAL_DISPLAY_LIMIT;

  return (
    <div className="flex flex-col gap-2">
      <button
        aria-expanded={expanded}
        className="flex items-center gap-2 cursor-pointer text-left py-1"
        onClick={() => setExpanded((v) => !v)}
        type="button"
      >
        <CollapseArrow expanded={expanded} />
        <SectionLabel>Farmable Fusions ({fusions.length})</SectionLabel>
      </button>
      {expanded && (
        <div className="flex flex-col gap-3 pl-5">
          {groups.map(([depth, group]) => (
            <FusionDepthGroup
              depth={depth}
              displayLimit={displayLimit}
              fusions={group}
              key={depth}
            />
          ))}
          {fusions.length > INITIAL_DISPLAY_LIMIT && (
            <button
              className="text-xs text-gold-dim hover:text-gold cursor-pointer text-left py-1"
              onClick={() => setShowAll((v) => !v)}
              type="button"
            >
              {showAll ? "Show less" : `Show all ${fusions.length} fusions`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function depthLabel(depth: number): string {
  if (depth === 0) return "Standalone Cards";
  if (depth === 1) return "Direct Fusions";
  return `${depth + 1}-Material Chains`;
}

function FusionDepthGroup({
  depth,
  fusions,
  displayLimit,
}: {
  depth: number;
  fusions: SerializedFarmableFusion[];
  displayLimit: number;
}) {
  const shown = fusions.slice(0, displayLimit);

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-text-secondary font-medium">
        {depthLabel(depth)} ({fusions.length})
      </p>
      <div className="flex flex-col gap-1.5">
        {shown.map((f) => (
          <FusionRow fusion={f} key={`${String(f.resultCardId)}_${String(f.depth)}`} />
        ))}
      </div>
    </div>
  );
}

function FusionRow({ fusion }: { fusion: SerializedFarmableFusion }) {
  const cardDb = useCardDb();
  const missingSet = useMemo(() => new Set(fusion.missingMaterials), [fusion.missingMaterials]);
  const isStandalone = fusion.depth === 0;

  return (
    <div className="flex flex-col gap-0.5 py-0.5 px-1">
      {/* Result line */}
      <div className="flex items-baseline gap-2 text-sm">
        <CardName
          cardId={fusion.resultCardId as CardId}
          className="font-display text-gold-bright truncate"
          name={fusion.resultName}
        />
        <span className="font-mono font-bold text-stat-atk tabular-nums shrink-0">
          {fusion.resultAtk}
        </span>
      </div>

      {/* Materials line (depth > 0) */}
      {fusion.materials.length > 0 && (
        <div className="flex flex-wrap items-baseline gap-1 text-xs text-text-muted">
          <span>{"\u2190"}</span>
          {fusion.materials.map((id, i) => {
            const name = cardDb.cardsById.get(id)?.name ?? `#${String(id)}`;
            const isMissing = missingSet.has(id);
            return (
              <span className="contents" key={id}>
                {i > 0 && <span>+</span>}
                <CardName
                  cardId={id as CardId}
                  className={
                    isMissing
                      ? "text-orange-400 hover:text-orange-300"
                      : "text-text-muted hover:text-gold"
                  }
                  name={name}
                />
              </span>
            );
          })}
        </div>
      )}

      {/* Drop sources for missing materials */}
      {fusion.missingMaterials.length > 0 && (
        <div className="flex flex-col gap-0.5 pl-3 text-xs text-text-muted">
          {fusion.missingMaterials.map((matId) => {
            const sources = fusion.dropSources[String(matId)];
            if (!sources || sources.length === 0) return null;
            const bestSource = sources.reduce((a, b) => (a.weight > b.weight ? a : b));
            return (
              <span className="text-text-muted" key={matId}>
                {/* For standalone cards, skip repeating the card name */}
                {!isStandalone && (
                  <>
                    <CardName
                      cardId={matId as CardId}
                      className="text-orange-400 hover:text-orange-300"
                      name={cardDb.cardsById.get(matId)?.name ?? `#${String(matId)}`}
                    />{" "}
                  </>
                )}
                {"via "}
                <a
                  className="text-text-secondary hover:text-gold transition-colors hover:underline decoration-gold/30 underline-offset-2"
                  href={`#data/duelists/${bestSource.duelistId}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {bestSource.duelistName}
                </a>{" "}
                <span className="text-text-muted">{formatRate(bestSource.weight)}</span>
                {sources.length > 1 && (
                  <span className="text-text-muted"> +{sources.length - 1} more</span>
                )}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Shared ────────────────────────────────────────────────────────────

function CollapseArrow({ expanded }: { expanded: boolean }) {
  return (
    <span
      className="text-text-muted text-xs transition-transform duration-150"
      style={{
        display: "inline-block",
        transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
      }}
    >
      {"\u25B6"}
    </span>
  );
}

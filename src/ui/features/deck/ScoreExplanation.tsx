import { useCallback, useEffect, useRef, useState } from "react";
import type { EngineConfig } from "../../../engine/config.ts";
import { MODS } from "../../../engine/mods.ts";
import type { AtkBucket } from "../../../engine/score-explainer.ts";
import type { ExplainerResponse } from "../../../engine/worker/messages.ts";
import { SectionLabel } from "../../components/panel-chrome.tsx";
import { useOwnedCardTotals } from "../../db/use-owned-card-totals.ts";
import {
  useDeckSize,
  useFusionDepth,
  useTerrain,
  useUseEquipment,
} from "../../db/use-user-preferences.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import { useSelectedMod } from "../../lib/use-selected-mod.ts";

type ExplainState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; distribution: AtkBucket[] };

export function ScoreExplanation({ deckCardIds }: { deckCardIds: number[] }) {
  const ownedCardTotals = useOwnedCardTotals();
  const deckSize = useDeckSize();
  const fusionDepth = useFusionDepth();
  const useEquipment = useUseEquipment();
  const terrain = useTerrain();
  const modId = useSelectedMod();
  const bridge = useBridge();
  const [state, setState] = useState<ExplainState>({ status: "idle" });
  const [expanded, setExpanded] = useState(false);
  const prevDeckRef = useRef(deckCardIds);
  const prevTerrainRef = useRef(terrain);

  // Reset when deck or terrain changes
  useEffect(() => {
    if (prevDeckRef.current !== deckCardIds || prevTerrainRef.current !== terrain) {
      prevDeckRef.current = deckCardIds;
      prevTerrainRef.current = terrain;
      setState({ status: "idle" });
      setExpanded(false);
    }
  }, [deckCardIds, terrain]);

  const toggle = useCallback(() => {
    if (state.status === "idle") {
      if (!ownedCardTotals) return;
      setState({ status: "loading" });
      setExpanded(true);

      const eb = bridge.gameData?.equipBonuses;
      const config: EngineConfig = {
        deckSize,
        fusionDepth,
        useEquipment,
        terrain,
        megamorphId: eb?.megamorphId ?? MODS[modId].megamorphId,
        equipBonus: eb?.equipBonus ?? 500,
        megamorphBonus: eb?.megamorphBonus ?? 1000,
      };
      const worker = new Worker(
        new URL("../../../engine/worker/explainer-worker.ts", import.meta.url),
        { type: "module" },
      );

      worker.onmessage = (e: MessageEvent<ExplainerResponse>) => {
        setState({
          status: "done",
          distribution: e.data.distribution,
        });
        worker.terminate();
      };
      worker.onerror = (err) => {
        console.error("Explainer worker error:", err);
        setState({ status: "idle" });
        setExpanded(false);
        worker.terminate();
      };

      worker.postMessage({
        type: "EXPLAIN",
        collection: ownedCardTotals,
        deck: deckCardIds,
        config,
        modId,
        gameData: bridge.gameData ?? undefined,
      });
    } else {
      setExpanded((v) => !v);
    }
  }, [
    state.status,
    ownedCardTotals,
    deckCardIds,
    deckSize,
    fusionDepth,
    useEquipment,
    terrain,
    modId,
    bridge.gameData,
  ]);

  return (
    <div className="flex flex-col gap-2">
      <button
        aria-expanded={expanded}
        className="flex items-center gap-2 cursor-pointer text-left py-2 lg:py-0"
        disabled={!ownedCardTotals && state.status === "idle"}
        onClick={toggle}
        type="button"
      >
        <span
          className="text-text-muted text-xs transition-transform duration-150"
          style={{
            display: "inline-block",
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          {"\u25B6"}
        </span>
        <SectionLabel>Score Breakdown</SectionLabel>
      </button>
      {expanded && (
        <div className="pl-5">
          {state.status === "loading" && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <div className="w-4 h-4 border-2 border-gold-dim border-t-gold rounded-full animate-spin-gold" />
              Analyzing all possible hands...
            </div>
          )}
          {state.status === "done" && <DistributionTable distribution={state.distribution} />}
        </div>
      )}
    </div>
  );
}

function DistributionTable({ distribution }: { distribution: AtkBucket[] }) {
  const maxProb = Math.max(...distribution.map((b) => b.probabilityMax), 0);
  let cumulativeProbability = 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border-subtle">
            <tr className="text-text-secondary text-xs uppercase tracking-wide">
              <th className="text-left py-1.5 px-1 font-normal">ATK</th>
              <th className="text-right py-1.5 px-1 font-normal">Chance</th>
              <th className="text-right py-1.5 px-1 font-normal">Cumul</th>
              <th className="text-left py-1.5 px-2 font-normal w-full" />
            </tr>
          </thead>
          <tbody>
            {distribution.map((bucket) => {
              cumulativeProbability += bucket.probabilityMax;
              return (
                <DistributionRow
                  bucket={bucket}
                  cumulativeProbability={cumulativeProbability}
                  key={bucket.atk}
                  maxProb={maxProb}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DistributionRow({
  bucket,
  cumulativeProbability,
  maxProb,
}: {
  bucket: AtkBucket;
  cumulativeProbability: number;
  maxProb: number;
}) {
  const pct = (bucket.probabilityMax * 100).toFixed(1);
  const cumulativePct = (Math.min(cumulativeProbability, 1) * 100).toFixed(1);
  const barPct = maxProb > 0 ? (bucket.probabilityMax / maxProb) * 100 : 0;
  return (
    <tr className="border-t border-border-subtle/50">
      <td className="py-1 px-1 font-mono font-bold text-stat-atk tabular-nums">{bucket.atk}</td>
      <td className="py-1 px-1 text-right font-mono text-xs text-text-secondary tabular-nums">
        {pct}%
      </td>
      <td className="py-1 px-1 text-right font-mono text-xs text-text-secondary tabular-nums">
        {cumulativePct}%
      </td>
      <td className="py-1 px-2">
        <div className="h-2 rounded-full bg-bg-surface overflow-hidden">
          <div
            className="h-full rounded-full bg-gold-dim"
            style={{ width: `${String(Math.min(barPct, 100))}%` }}
          />
        </div>
      </td>
    </tr>
  );
}

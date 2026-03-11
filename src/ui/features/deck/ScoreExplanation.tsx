import { useCallback, useEffect, useRef, useState } from "react";
import type { EngineConfig } from "../../../engine/config.ts";
import type { AtkBucket } from "../../../engine/score-explainer.ts";
import type { ExplainerResponse } from "../../../engine/worker/messages.ts";
import { SectionLabel } from "../../components/panel-chrome.tsx";
import { useCollection } from "../../db/use-collection.ts";
import { useDeckSize, useFusionDepth } from "../../db/use-user-preferences.ts";

type ExplainState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; distribution: AtkBucket[] };

export function ScoreExplanation({ deckCardIds }: { deckCardIds: number[] }) {
  const collection = useCollection();
  const deckSize = useDeckSize();
  const fusionDepth = useFusionDepth();
  const [state, setState] = useState<ExplainState>({ status: "idle" });
  const [expanded, setExpanded] = useState(false);
  const prevDeckRef = useRef(deckCardIds);

  // Reset when deck changes
  useEffect(() => {
    if (prevDeckRef.current !== deckCardIds) {
      prevDeckRef.current = deckCardIds;
      setState({ status: "idle" });
      setExpanded(false);
    }
  }, [deckCardIds]);

  const toggle = useCallback(() => {
    if (state.status === "idle") {
      if (!collection) return;
      setState({ status: "loading" });
      setExpanded(true);

      const config: EngineConfig = { deckSize, fusionDepth };
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
        collection,
        deck: deckCardIds,
        config,
      });
    } else {
      setExpanded((v) => !v);
    }
  }, [state.status, collection, deckCardIds, deckSize, fusionDepth]);

  return (
    <div className="flex flex-col gap-2">
      <button
        aria-expanded={expanded}
        className="flex items-center gap-2 cursor-pointer text-left"
        disabled={!collection && state.status === "idle"}
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

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border-subtle">
            <tr className="text-text-secondary text-xs uppercase tracking-wide">
              <th className="text-left py-1.5 px-1 font-normal">ATK</th>
              <th className="text-right py-1.5 px-1 font-normal">Chance</th>
              <th className="text-left py-1.5 px-2 font-normal w-full" />
            </tr>
          </thead>
          <tbody>
            {distribution.map((bucket) => (
              <DistributionRow bucket={bucket} key={bucket.atk} maxProb={maxProb} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DistributionRow({ bucket, maxProb }: { bucket: AtkBucket; maxProb: number }) {
  const pct = (bucket.probabilityMax * 100).toFixed(1);
  const barPct = maxProb > 0 ? (bucket.probabilityMax / maxProb) * 100 : 0;
  return (
    <tr className="border-t border-border-subtle/50">
      <td className="py-1 px-1 font-mono font-bold text-stat-atk tabular-nums">{bucket.atk}</td>
      <td className="py-1 px-1 text-right font-mono text-xs text-text-secondary tabular-nums">
        {pct}%
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

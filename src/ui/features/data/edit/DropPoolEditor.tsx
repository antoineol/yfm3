import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import type { BridgeDuelist, BridgeGameData } from "../../../../engine/worker/messages.ts";
import {
  editingTargetAtom,
  loadPoolAtom,
  POOL_TYPE_DESCRIPTIONS,
  POOL_TYPE_LABELS,
  type PoolType,
} from "./atoms.ts";
import { DropPoolSummary } from "./DropPoolSummary.tsx";
import { DropPoolTable } from "./DropPoolTable.tsx";

const POOL_ORDER: PoolType[] = ["saPow", "bcd", "saTec", "deck"];

export function DropPoolEditor({ gameData }: { gameData: BridgeGameData }) {
  const duelists = gameData.duelists;
  const target = useAtomValue(editingTargetAtom);
  const loadPool = useSetAtom(loadPoolAtom);

  // First-mount: seed selection to duelist #1 / BCD pool so the user always
  // lands on a populated editor instead of an empty placeholder.
  useEffect(() => {
    if (target === null && duelists.length > 0) {
      const firstId = duelists[0]?.id ?? 1;
      loadPool({ target: { duelistId: firstId, poolType: "saPow" }, duelists });
    }
  }, [target, duelists, loadPool]);

  if (!target) return null;
  const selected = duelists.find((d) => d.id === target.duelistId);

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <PickerBar duelists={duelists} target={target} />
      <DropPoolSummary isDeckPool={target.poolType === "deck"} />
      <div className="flex-1 min-h-0 flex flex-col">
        <DropPoolTable />
      </div>
      {!selected && (
        <p className="px-3 py-4 text-xs text-text-muted italic">
          Duelist not found in current game data.
        </p>
      )}
    </div>
  );
}

function PickerBar({
  duelists,
  target,
}: {
  duelists: readonly BridgeDuelist[];
  target: { duelistId: number; poolType: PoolType };
}) {
  const loadPool = useSetAtom(loadPoolAtom);

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 border-b border-border-subtle">
      <select
        aria-label="Duelist"
        className="appearance-none bg-bg-surface border border-border-subtle rounded-md pl-2.5 pr-6 py-1 text-sm text-text-primary focus:outline-none focus:border-gold-dim hover:border-border-accent cursor-pointer"
        onChange={(e) =>
          loadPool({
            target: { duelistId: Number(e.target.value), poolType: target.poolType },
            duelists: [...duelists],
          })
        }
        value={target.duelistId}
      >
        {duelists.map((d) => (
          <option key={d.id} value={d.id}>
            #{d.id} · {d.name.trim()}
          </option>
        ))}
      </select>
      <div
        className="inline-flex rounded-md border border-border-subtle bg-bg-surface overflow-hidden"
        role="tablist"
      >
        {POOL_ORDER.map((p) => (
          <button
            aria-label={POOL_TYPE_DESCRIPTIONS[p]}
            className={`px-3 py-1 font-display text-[11px] uppercase tracking-widest transition-colors cursor-pointer ${
              target.poolType === p
                ? "bg-bg-hover text-gold-bright"
                : "text-text-secondary hover:text-text-primary"
            }`}
            key={p}
            onClick={() =>
              loadPool({
                target: { duelistId: target.duelistId, poolType: p },
                duelists: [...duelists],
              })
            }
            role="tab"
            title={POOL_TYPE_DESCRIPTIONS[p]}
            type="button"
          >
            {POOL_TYPE_LABELS[p]}
          </button>
        ))}
      </div>
    </div>
  );
}

import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import type { BridgeDuelist, BridgeGameData } from "../../../../engine/worker/messages.ts";
import { type EditView, editingTargetAtom, loadTargetAtom } from "./atoms.ts";
import { DropPoolSummary } from "./DropPoolSummary.tsx";
import { DropPoolTable } from "./DropPoolTable.tsx";
import { IsoBackupsDrawerButton } from "./IsoBackupsDrawer.tsx";

const VIEW_ORDER: readonly EditView[] = ["drops", "deck"];

const VIEW_LABELS: Record<EditView, string> = {
  drops: "Drops",
  deck: "Deck",
};

const VIEW_DESCRIPTIONS: Record<EditView, string> = {
  drops: "Drop rewards (S/A-Pow, B/C/D, S/A-Tec) — edit all three side by side.",
  deck: "Cards the AI builds its deck from.",
};

export function DropPoolEditor({
  gameData,
  onDuelistChange,
  selectedDuelistId,
}: {
  gameData: BridgeGameData;
  onDuelistChange: (id: number) => void;
  selectedDuelistId: number | undefined;
}) {
  const duelists = gameData.duelists;
  const target = useAtomValue(editingTargetAtom);
  const loadTarget = useSetAtom(loadTargetAtom);

  // Sync selection from the URL. Seeds duelist #1 / drops view on first mount
  // when the URL has no id; reacts to external URL changes (reload, back/forward).
  // A guard keeps this a no-op when the target already matches, so view switches
  // and unsaved edits aren't clobbered.
  useEffect(() => {
    if (duelists.length === 0) return;
    const desiredId = selectedDuelistId ?? target?.duelistId ?? duelists[0]?.id ?? 1;
    if (target !== null && target.duelistId === desiredId) return;
    loadTarget({ target: { duelistId: desiredId, view: target?.view ?? "drops" }, duelists });
  }, [selectedDuelistId, duelists, target, loadTarget]);

  if (!target) return null;
  const selected = duelists.find((d) => d.id === target.duelistId);

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <PickerBar duelists={duelists} onDuelistChange={onDuelistChange} target={target} />
      <DropPoolSummary view={target.view} />
      <div className="flex-1 min-h-0 flex flex-col">
        <DropPoolTable view={target.view} />
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
  onDuelistChange,
  target,
}: {
  duelists: readonly BridgeDuelist[];
  onDuelistChange: (id: number) => void;
  target: { duelistId: number; view: EditView };
}) {
  const loadTarget = useSetAtom(loadTargetAtom);

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 border-b border-border-subtle">
      <select
        aria-label="Duelist"
        className="appearance-none bg-bg-surface border border-border-subtle rounded-md pl-2.5 pr-6 py-1 text-sm text-text-primary focus:outline-none focus:border-gold-dim hover:border-border-accent cursor-pointer"
        onChange={(e) => onDuelistChange(Number(e.target.value))}
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
        {VIEW_ORDER.map((v) => (
          <button
            aria-label={VIEW_DESCRIPTIONS[v]}
            className={`px-3 py-1 font-display text-[11px] uppercase tracking-widest transition-colors cursor-pointer ${
              target.view === v
                ? "bg-bg-hover text-gold-bright"
                : "text-text-secondary hover:text-text-primary"
            }`}
            key={v}
            onClick={() =>
              loadTarget({
                target: { duelistId: target.duelistId, view: v },
                duelists: [...duelists],
              })
            }
            role="tab"
            title={VIEW_DESCRIPTIONS[v]}
            type="button"
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>
      <div className="ml-auto">
        <IsoBackupsDrawerButton />
      </div>
    </div>
  );
}

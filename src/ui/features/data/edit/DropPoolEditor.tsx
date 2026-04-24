import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { toast } from "sonner";
import type { BridgeDuelist, BridgeGameData } from "../../../../engine/worker/messages.ts";
import { Button } from "../../../components/Button.tsx";
import { useBridge } from "../../../lib/bridge-context.tsx";
import {
  type EditView,
  editingTargetAtom,
  globalSaveGateAtom,
  loadTargetAtom,
  modifiedByDuelistAtom,
  modifiedDuelistCountAtom,
  revertAllAtom,
  saveAtom,
  savingAtom,
  totalModifiedCardCountAtom,
} from "./atoms.ts";
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

const CONFIRM_MESSAGE =
  "Saving will close the running game in DuckStation (no save state) so the patched weights can be written to the ISO. " +
  "After it saves, click the game row in DuckStation and choose 'Démarrage normal' to reload.\n\n" +
  "Any unsaved in-duel progress will be lost. Continue?";

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
  // `loadTargetAtom` is idempotent: it no-ops when target+baseline already match,
  // and transparently wipes stored edits if the game data's baseline drifted.
  useEffect(() => {
    if (duelists.length === 0) return;
    const desiredId = selectedDuelistId ?? target?.duelistId ?? duelists[0]?.id ?? 1;
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
      <div className="ml-auto flex items-center gap-2">
        <GlobalSaveRevert duelists={duelists} />
        <IsoBackupsDrawerButton />
      </div>
    </div>
  );
}

function GlobalSaveRevert({ duelists }: { duelists: readonly BridgeDuelist[] }) {
  const bridge = useBridge();
  const duelistCount = useAtomValue(modifiedDuelistCountAtom);
  const cardCount = useAtomValue(totalModifiedCardCountAtom);
  const gate = useAtomValue(globalSaveGateAtom);
  const saving = useAtomValue(savingAtom);
  const modifiedByDuelist = useAtomValue(modifiedByDuelistAtom);
  const revertAll = useSetAtom(revertAllAtom);
  const save = useSetAtom(saveAtom);

  if (duelistCount === 0) return null;

  async function onSave() {
    if (bridge.detail === "ready" && !window.confirm(CONFIRM_MESSAGE)) return;
    try {
      const outcome = await save();
      if (!outcome) return;
      if (!outcome.ok) {
        const detail = outcome.reason ? ` (${outcome.reason})` : "";
        toast.error(`Save failed: ${outcome.error}${detail}`);
        return;
      }
      const backupPart = outcome.backup ? ` · backup ${outcome.backup.filename}` : "";
      const scope = `${outcome.savedPools} pool${outcome.savedPools === 1 ? "" : "s"} across ${outcome.savedDuelists} duelist${outcome.savedDuelists === 1 ? "" : "s"}`;
      if (outcome.closedGame) {
        toast.success(
          `Saved ${scope}${backupPart}. Click the game in DuckStation and choose 'Démarrage normal' to reload with the new weights.`,
          { duration: 10000 },
        );
      } else {
        toast.success(`Saved ${scope}${backupPart}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Save failed: ${msg}`);
    }
  }

  const saveTitle = gate.ok
    ? summarizeEdits(duelists, modifiedByDuelist)
    : `Fix before saving:\n${gate.offenders.map((o) => `#${o.duelistId} — ${o.reason}`).join("\n")}`;
  const revertTitle = `Revert every unsaved change across ${duelistCount} duelist${
    duelistCount === 1 ? "" : "s"
  } (${cardCount} card${cardCount === 1 ? "" : "s"}).`;

  return (
    <>
      <Button
        disabled={saving}
        onClick={() => revertAll()}
        size="sm"
        title={revertTitle}
        variant="ghost"
      >
        Revert all
      </Button>
      <Button
        disabled={saving || !gate.ok}
        glowing={gate.ok}
        onClick={onSave}
        size="sm"
        title={saveTitle}
      >
        {saving
          ? "Saving…"
          : `Save · ${duelistCount} duelist${duelistCount === 1 ? "" : "s"} · ${cardCount} card${cardCount === 1 ? "" : "s"}`}
      </Button>
    </>
  );
}

function summarizeEdits(
  duelists: readonly BridgeDuelist[],
  modifiedByDuelist: Record<number, readonly string[]>,
): string {
  const byId = new Map(duelists.map((d) => [d.id, d.name.trim()]));
  const lines = Object.entries(modifiedByDuelist).map(([idStr, poolTypes]) => {
    const id = Number(idStr);
    const name = byId.get(id) ?? "(unknown)";
    return `#${id} ${name} — ${poolTypes.join(", ")}`;
  });
  return `Save across:\n${lines.join("\n")}`;
}

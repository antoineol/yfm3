import { useAtomValue, useSetAtom } from "jotai";
import { toast } from "sonner";
import { Button } from "../../../components/Button.tsx";
import { useBridge } from "../../../lib/bridge-context.tsx";
import {
  balanceUnpinnedAtom,
  clearPinsAtom,
  DECK_MIN_DISTINCT,
  distinctCountAtom,
  isModifiedAtom,
  isValidSumAtom,
  modifiedCardIdsAtom,
  POOL_SUM,
  pinnedCardIdsAtom,
  poolSumAtom,
  revertAtom,
  saveAtom,
  savingAtom,
} from "./atoms.ts";
import { IsoBackupsDrawerButton } from "./IsoBackupsDrawer.tsx";

const CONFIRM_MESSAGE =
  "Saving will close the running game in DuckStation (no save state) so the patched weights can be written to the ISO. " +
  "After it saves, click the game row in DuckStation and choose 'Démarrage normal' to reload.\n\n" +
  "Any unsaved in-duel progress will be lost. Continue?";

export function DropPoolSummary({ isDeckPool }: { isDeckPool: boolean }) {
  const bridge = useBridge();
  const sum = useAtomValue(poolSumAtom);
  const validSum = useAtomValue(isValidSumAtom);
  const distinct = useAtomValue(distinctCountAtom);
  const modified = useAtomValue(isModifiedAtom);
  const modifiedCount = useAtomValue(modifiedCardIdsAtom).size;
  const pinnedCount = useAtomValue(pinnedCardIdsAtom).size;
  const saving = useAtomValue(savingAtom);

  const balance = useSetAtom(balanceUnpinnedAtom);
  const clearPins = useSetAtom(clearPinsAtom);
  const revert = useSetAtom(revertAtom);
  const save = useSetAtom(saveAtom);

  async function onSave() {
    // Only prompt if the game is running (the only case where the bridge
    // will have to close it). If the user already closed the game manually,
    // the write goes through instantly and confirmation would be noise.
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
      if (outcome.closedGame) {
        toast.success(
          `Patch applied${backupPart}. Click the game in DuckStation and choose 'Démarrage normal' to reload with the new weights.`,
          { duration: 10000 },
        );
      } else {
        toast.success(`Pool saved${backupPart}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Save failed: ${msg}`);
    }
  }

  const canSave = validSum && (!isDeckPool || distinct >= DECK_MIN_DISTINCT);

  return (
    <div className="flex items-center gap-x-2 gap-y-1 px-3 py-1 border-b border-border-subtle flex-wrap">
      <SumPill sum={sum} valid={validSum} />
      {isDeckPool && <DistinctPill count={distinct} />}
      <Button
        disabled={saving}
        onClick={() => balance()}
        size="sm"
        title="Distribute the remaining budget across unpinned cards, proportional to the original on-disk weights."
        variant="outline"
      >
        Balance{pinnedCount > 0 ? ` · ${pinnedCount} pinned` : " unpinned"}
      </Button>
      {pinnedCount > 0 && (
        <Button disabled={saving} onClick={() => clearPins()} size="sm" variant="ghost">
          Clear pins
        </Button>
      )}
      <div className="ml-auto flex items-center gap-2">
        <IsoBackupsDrawerButton />
        {modified && (
          <>
            <Button disabled={saving} onClick={() => revert()} size="sm" variant="ghost">
              Revert
            </Button>
            <Button disabled={saving || !canSave} glowing={canSave} onClick={onSave} size="sm">
              {saving ? "Saving…" : `Save · ${modifiedCount}`}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function SumPill({ sum, valid }: { sum: number; valid: boolean }) {
  const color = valid ? "text-stat-up border-stat-up/40" : "text-stat-atk border-stat-atk/40";
  const delta = sum - POOL_SUM;
  const deltaText = delta === 0 ? "" : delta > 0 ? ` (+${delta})` : ` (${delta})`;
  return (
    <div
      className={`flex items-baseline gap-1.5 px-2 py-0.5 rounded-md border ${color}`}
      title="Each pool must sum to exactly 2048 — the game picks weights via rand() & 0x7FF."
    >
      <span className="font-display text-[10px] uppercase tracking-widest text-text-secondary">
        Sum
      </span>
      <span className="font-mono text-sm tabular-nums">
        {sum.toLocaleString("en-US")} / {POOL_SUM.toLocaleString("en-US")}
        {deltaText}
      </span>
      <span className="font-mono">{valid ? "✓" : "✗"}</span>
    </div>
  );
}

function DistinctPill({ count }: { count: number }) {
  const ok = count >= DECK_MIN_DISTINCT;
  const color = ok ? "text-stat-up border-stat-up/40" : "text-stat-atk border-stat-atk/40";
  return (
    <div
      className={`flex items-baseline gap-1.5 px-2 py-0.5 rounded-md border ${color}`}
      title={`AI deck builder needs at least ${DECK_MIN_DISTINCT} distinct cards (40-card deck, 3 copies max). Too few hangs the game on duel start.`}
    >
      <span className="font-display text-[10px] uppercase tracking-widest text-text-secondary">
        Distinct
      </span>
      <span className="font-mono text-sm tabular-nums">
        {count} / {DECK_MIN_DISTINCT}
      </span>
      <span className="font-mono">{ok ? "✓" : "✗"}</span>
    </div>
  );
}

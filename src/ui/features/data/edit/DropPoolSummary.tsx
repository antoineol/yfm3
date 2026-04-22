import { useAtomValue, useSetAtom } from "jotai";
import { toast } from "sonner";
import { Button } from "../../../components/Button.tsx";
import { useBridge } from "../../../lib/bridge-context.tsx";
import {
  allValidSumsAtom,
  balancePoolAtom,
  DECK_MIN_DISTINCT,
  distinctCountAtom,
  type EditView,
  isModifiedAtom,
  modifiedCardIdsAtom,
  modifiedCardIdsByPoolAtom,
  POOL_SUM,
  POOL_TYPE_LABELS,
  POOLS_BY_VIEW,
  type PoolType,
  pinnedCardIdsAtom,
  poolSumsAtom,
  revertAtom,
  saveAtom,
  savingAtom,
} from "./atoms.ts";

const CONFIRM_MESSAGE =
  "Saving will close the running game in DuckStation (no save state) so the patched weights can be written to the ISO. " +
  "After it saves, click the game row in DuckStation and choose 'Démarrage normal' to reload.\n\n" +
  "Any unsaved in-duel progress will be lost. Continue?";

export function DropPoolSummary({ view }: { view: EditView }) {
  const bridge = useBridge();
  const validAllSums = useAtomValue(allValidSumsAtom);
  const distinct = useAtomValue(distinctCountAtom);
  const modified = useAtomValue(isModifiedAtom);
  const modifiedCount = useAtomValue(modifiedCardIdsAtom).size;
  const saving = useAtomValue(savingAtom);

  const revert = useSetAtom(revertAtom);
  const save = useSetAtom(saveAtom);

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

  const pools = POOLS_BY_VIEW[view];
  const isDeckView = view === "deck";
  const canSave = validAllSums && (!isDeckView || distinct >= DECK_MIN_DISTINCT);

  return (
    <div className="flex items-center gap-x-1.5 gap-y-1 px-3 py-1 border-b border-border-subtle flex-wrap">
      {pools.map((p) => (
        <PoolPill key={p} poolType={p} />
      ))}
      {isDeckView && <DistinctPill count={distinct} />}
      {modified && (
        <div className="ml-auto flex items-center gap-2">
          <Button disabled={saving} onClick={() => revert()} size="sm" variant="ghost">
            Revert
          </Button>
          <Button disabled={saving || !canSave} glowing={canSave} onClick={onSave} size="sm">
            {saving ? "Saving…" : `Save · ${modifiedCount}`}
          </Button>
        </div>
      )}
    </div>
  );
}

function PoolPill({ poolType }: { poolType: PoolType }) {
  const sum = useAtomValue(poolSumsAtom)[poolType] ?? 0;
  const pinnedTotal = useAtomValue(pinnedCardIdsAtom).size;
  const modifiedInPool = useAtomValue(modifiedCardIdsByPoolAtom)[poolType]?.size ?? 0;
  const saving = useAtomValue(savingAtom);
  const balance = useSetAtom(balancePoolAtom);
  const valid = sum === POOL_SUM;
  const delta = sum - POOL_SUM;
  const deltaText = delta === 0 ? "" : delta > 0 ? `+${delta}` : `${delta}`;
  const color = valid ? "text-stat-up border-stat-up/40" : "text-stat-atk border-stat-atk/40";
  const title =
    `${POOL_TYPE_LABELS[poolType]} pool — must sum to ${POOL_SUM.toLocaleString("en-US")} ` +
    `(rand() & 0x7FF).\nCurrent: ${sum.toLocaleString("en-US")}${delta === 0 ? "" : ` (${deltaText})`}` +
    `\nModified: ${modifiedInPool} · Pinned: ${pinnedTotal}` +
    "\nClick ⚖ to rebalance unpinned cards — their current relative ratios are kept, and their magnitudes are rescaled so the pool totals 2048.";
  return (
    <div
      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border ${color}`}
      title={title}
    >
      <span className="font-display text-[10px] uppercase tracking-widest text-text-secondary">
        {POOL_TYPE_LABELS[poolType]}
      </span>
      <span className="font-mono text-xs tabular-nums">
        {sum.toLocaleString("en-US")}
        {deltaText && <span className="ml-0.5 opacity-70">({deltaText})</span>}
      </span>
      <span className="font-mono text-xs">{valid ? "✓" : "✗"}</span>
      <button
        aria-label={`Rebalance ${POOL_TYPE_LABELS[poolType]} unpinned cards`}
        className="ml-0.5 px-1 text-text-secondary hover:text-gold-bright disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        disabled={saving}
        onClick={() => balance(poolType)}
        title={`Rebalance ${POOL_TYPE_LABELS[poolType]} unpinned cards`}
        type="button"
      >
        ⚖
      </button>
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

import { useSetAtom } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { CardSpec } from "../../../../engine/data/card-model.ts";
import type { CardDb } from "../../../../engine/data/game-db.ts";
import type { BridgeGameData } from "../../../../engine/worker/messages.ts";
import { Button } from "../../../components/Button.tsx";
import { CardAutocomplete } from "../../../components/CardAutocomplete.tsx";
import { CardName, cardLabelColorStyle } from "../../../components/CardName.tsx";
import { ToggleGroup } from "../../../components/ToggleGroup.tsx";
import { useFusionTable } from "../../../lib/fusion-table-context.tsx";
import { backupsAtom } from "./atoms.ts";
import { type BridgeFusion, fetchIsoBackups, putFusionTable } from "./bridge-client.ts";
import { IsoBackupsDrawerButton } from "./IsoBackupsDrawer.tsx";

type FilterScope = "involves" | "result" | "material";

type FusionRow = BridgeFusion & {
  key: string;
  resultAtk: number;
};

const FILTER_OPTIONS: { value: FilterScope; label: string }[] = [
  { value: "involves", label: "Involves" },
  { value: "result", label: "Produces" },
  { value: "material", label: "Material" },
];

const CONFIRM_MESSAGE =
  "Saving will close the running game in DuckStation (no save state) so the patched fusion table can be written to the ISO. " +
  "After it saves, click the game row in DuckStation and choose 'Démarrage normal' to reload.\n\n" +
  "Any unsaved in-duel progress will be lost. Continue?";

export function FusionTableEditor({ gameData }: { gameData: BridgeGameData }) {
  const { cardDb } = useFusionTable();
  const setBackups = useSetAtom(backupsAtom);
  const [filterCard, setFilterCard] = useState<CardSpec | null>(null);
  const [scope, setScope] = useState<FilterScope>("result");
  const [original, setOriginal] = useState<BridgeFusion[]>(() =>
    cloneFusions(gameData.fusionTable),
  );
  const [draft, setDraft] = useState<BridgeFusion[]>(() => cloneFusions(gameData.fusionTable));
  const [selectedKeys, setSelectedKeys] = useState<ReadonlySet<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const baselineKey = useMemo(() => fusionListKey(gameData.fusionTable), [gameData.fusionTable]);
  const appliedBaselineKeyRef = useRef(baselineKey);

  useEffect(() => {
    if (appliedBaselineKeyRef.current === baselineKey) return;
    const next = cloneFusions(gameData.fusionTable);
    appliedBaselineKeyRef.current = baselineKey;
    setOriginal(next);
    setDraft(cloneFusions(next));
    setSelectedKeys(new Set());
  }, [baselineKey, gameData.fusionTable]);

  const visibleRows = useMemo(() => {
    if (!filterCard) return [];
    return buildRows(draft, cardDb).filter((row) => matchesFilter(row, filterCard.id, scope));
  }, [draft, cardDb, filterCard, scope]);

  const visibleKeys = useMemo(() => visibleRows.map((row) => row.key), [visibleRows]);
  const visibleSelectedCount = useMemo(
    () => visibleKeys.filter((key) => selectedKeys.has(key)).length,
    [visibleKeys, selectedKeys],
  );
  const hasChanges = !sameFusionList(original, draft);
  const selectionState: "none" | "some" | "all" =
    visibleRows.length === 0
      ? "none"
      : visibleSelectedCount === 0
        ? "none"
        : visibleSelectedCount === visibleRows.length
          ? "all"
          : "some";

  function clearFilter() {
    setFilterCard(null);
    setSelectedKeys(new Set());
  }

  function toggleAllVisible() {
    const next = new Set(selectedKeys);
    if (selectionState === "all") {
      for (const key of visibleKeys) next.delete(key);
    } else {
      for (const key of visibleKeys) next.add(key);
    }
    setSelectedKeys(next);
  }

  function toggleRow(key: string) {
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedKeys(next);
  }

  function deleteSelected() {
    if (visibleSelectedCount === 0) return;
    const deleting = new Set(selectedKeys);
    setDraft((prev) => prev.filter((fusion) => !deleting.has(fusionKey(fusion))));
    setSelectedKeys(new Set());
  }

  function revertAll() {
    setDraft(cloneFusions(original));
    setSelectedKeys(new Set());
  }

  async function save() {
    if (!hasChanges || saving) return;
    if (!window.confirm(CONFIRM_MESSAGE)) return;
    setSaving(true);
    try {
      const result = await putFusionTable(draft);
      if (!result.ok) {
        const detail = result.reason ? ` (${result.reason})` : "";
        toast.error(`Fusion table save failed: ${result.error}${detail}`);
        return;
      }
      const next = cloneFusions(result.fusionTable);
      setOriginal(next);
      setDraft(cloneFusions(next));
      setSelectedKeys(new Set());
      setBackups(await fetchIsoBackups());
      const removed = original.length - next.length;
      const backupPart = result.backup ? ` · backup ${result.backup.filename}` : "";
      const reloadPart = result.closedGame
        ? ". Click the game in DuckStation and choose 'Démarrage normal' to reload with the new fusions."
        : "";
      toast.success(`Saved fusion table (${removed} removed)${backupPart}${reloadPart}`, {
        duration: result.closedGame ? 10000 : 4000,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Fusion table save failed: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle px-3 py-1.5">
        <div className="min-w-64 flex-1">
          <CardAutocomplete onSelect={setFilterCard} placeholder="Filter fusions by card…" />
        </div>
        <ToggleGroup onChange={setScope} options={FILTER_OPTIONS} value={scope} />
        {filterCard && (
          <button
            className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-bg-surface px-2.5 py-1.5 text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
            onClick={clearFilter}
            type="button"
          >
            <span className="text-gold" style={cardLabelColorStyle(filterCard.labelColor)}>
              {filterCard.name}
            </span>
            <span className="text-text-muted">&times;</span>
          </button>
        )}
        <span className="text-xs text-text-muted">
          {draft.length} fusion{draft.length === 1 ? "" : "s"}
          {hasChanges ? ` · ${original.length - draft.length} deleted` : ""}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {hasChanges && (
            <>
              <Button disabled={saving} onClick={revertAll} size="sm" variant="ghost">
                Revert
              </Button>
              <Button disabled={saving} glowing onClick={save} size="sm">
                {saving ? "Saving..." : "Save"}
              </Button>
            </>
          )}
          <IsoBackupsDrawerButton />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle px-3 py-2">
        <label className="flex items-center gap-2 text-xs text-text-primary">
          <input
            checked={selectionState === "all"}
            className="accent-gold"
            onChange={toggleAllVisible}
            ref={(el) => {
              if (el) el.indeterminate = selectionState === "some";
            }}
            type="checkbox"
          />
          {visibleRows.length === 0 ? "No visible rows" : `${visibleRows.length} visible`}
        </label>
        <Button
          disabled={visibleSelectedCount === 0}
          onClick={deleteSelected}
          size="sm"
          variant="outline"
        >
          Delete selected · {visibleSelectedCount}
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filterCard ? (
          <FusionRows
            cardDb={cardDb}
            fusions={visibleRows}
            onToggle={toggleRow}
            selectedKeys={selectedKeys}
          />
        ) : (
          <div className="px-3 py-10 text-center text-sm text-text-muted">
            Pick a card to load matching fusions.
          </div>
        )}
      </div>
    </div>
  );
}

function FusionRows({
  cardDb,
  fusions,
  onToggle,
  selectedKeys,
}: {
  cardDb: CardDb;
  fusions: readonly FusionRow[];
  onToggle: (key: string) => void;
  selectedKeys: ReadonlySet<string>;
}) {
  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 z-10 border-b border-border-subtle bg-bg-panel">
        <tr className="text-xs uppercase tracking-wide text-text-secondary">
          <th className="w-8 px-1 py-2 font-normal" />
          <th className="px-1 py-2 text-left font-normal">Material A</th>
          <th className="px-1 py-2 text-left font-normal">Material B</th>
          <th className="px-1 py-2 text-left font-normal">Result</th>
          <th className="px-2 py-2 text-left font-normal">ATK</th>
        </tr>
      </thead>
      <tbody>
        {fusions.map((fusion) => {
          const resultCard = cardDb.cardsById.get(fusion.result);
          return (
            <tr
              className="border-t border-border-subtle/50 transition-colors even:bg-bg-surface/30 hover:bg-bg-hover"
              key={fusion.key}
            >
              <td className="px-1 py-1.5 text-center">
                <input
                  checked={selectedKeys.has(fusion.key)}
                  className="accent-gold"
                  onChange={() => onToggle(fusion.key)}
                  type="checkbox"
                />
              </td>
              <td className="px-1 py-1.5 text-text-primary">
                <FusionCardName cardDb={cardDb} cardId={fusion.material1} />
              </td>
              <td className="px-1 py-1.5 text-text-primary">
                <FusionCardName cardDb={cardDb} cardId={fusion.material2} />
              </td>
              <td className="px-1 py-1.5 text-gold">
                <FusionCardName cardDb={cardDb} cardId={fusion.result} />
              </td>
              <td className="px-2 py-1.5 font-mono font-bold text-stat-atk">
                {(resultCard?.isMonster ?? true) ? fusion.resultAtk : ""}
              </td>
            </tr>
          );
        })}
        {fusions.length === 0 && (
          <tr>
            <td className="py-8 text-center text-text-muted" colSpan={5}>
              No matching fusions.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function FusionCardName({ cardDb, cardId }: { cardDb: CardDb; cardId: number }) {
  const card = cardDb.cardsById.get(cardId);
  return card ? <CardName cardId={card.id} name={card.name} /> : `#${cardId}`;
}

function buildRows(fusions: readonly BridgeFusion[], cardDb: CardDb): FusionRow[] {
  return fusions.map((fusion) => ({
    ...fusion,
    key: fusionKey(fusion),
    resultAtk: cardDb.cardsById.get(fusion.result)?.attack ?? 0,
  }));
}

function matchesFilter(fusion: BridgeFusion, cardId: number, scope: FilterScope): boolean {
  if (scope === "result") return fusion.result === cardId;
  if (scope === "material") return fusion.material1 === cardId || fusion.material2 === cardId;
  return fusion.material1 === cardId || fusion.material2 === cardId || fusion.result === cardId;
}

function cloneFusions(fusions: readonly BridgeFusion[]): BridgeFusion[] {
  return fusions.map((fusion) => ({ ...fusion }));
}

function fusionKey(fusion: BridgeFusion): string {
  return `${fusion.material1}:${fusion.material2}`;
}

function fusionListKey(fusions: readonly BridgeFusion[]): string {
  return fusions
    .map((fusion) => `${fusion.material1}:${fusion.material2}:${fusion.result}`)
    .join("|");
}

function sameFusionList(a: readonly BridgeFusion[], b: readonly BridgeFusion[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const left = a[i];
    const right = b[i];
    if (
      !left ||
      !right ||
      left.material1 !== right.material1 ||
      left.material2 !== right.material2 ||
      left.result !== right.result
    ) {
      return false;
    }
  }
  return true;
}

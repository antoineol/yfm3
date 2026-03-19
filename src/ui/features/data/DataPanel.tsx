import { useCallback } from "react";
import { ToggleGroup } from "../../components/ToggleGroup.tsx";
import { useFusionTable } from "../../lib/fusion-table-context.tsx";
import { useHash } from "../../lib/use-tab-from-hash.ts";
import { CardsTable } from "./CardsTable.tsx";
import { DuelistsPanel } from "./DuelistsPanel.tsx";
import { FusionsTable } from "./FusionsTable.tsx";

type View = "cards" | "fusions" | "duelists";

const VIEW_OPTIONS: { value: View; label: string }[] = [
  { value: "cards", label: "Cards" },
  { value: "fusions", label: "Fusions" },
  { value: "duelists", label: "Duelists" },
];

const VALID_VIEWS = new Set<string>(VIEW_OPTIONS.map((o) => o.value));

function parseDataHash(hash: string): { view: View; duelistId: number | undefined } {
  const segments = hash.split("/");
  // segments[0] = "data", segments[1] = sub-view, segments[2] = duelist id
  const rawView = segments[1] ?? "";
  const view: View = VALID_VIEWS.has(rawView) ? (rawView as View) : "cards";
  const duelistId =
    view === "duelists" && segments[2] ? Number(segments[2]) || undefined : undefined;
  return { view, duelistId };
}

export function DataPanel() {
  const data = useFusionTable();
  const [hash, setHash] = useHash();
  const { view, duelistId } = parseDataHash(hash);

  const setView = useCallback(
    (v: View) => {
      setHash(`data/${v}`);
    },
    [setHash],
  );

  const handleDuelistChange = useCallback(
    (id: number) => {
      setHash(`data/duelists/${id}`);
    },
    [setHash],
  );

  return (
    <div className="flex flex-col gap-3 h-full max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-center">
        <ToggleGroup onChange={setView} options={VIEW_OPTIONS} value={view} />
      </div>
      {view !== "duelists" && (
        <div className="flex items-center gap-3">
          <span className="ml-auto text-xs text-text-muted">
            {view === "cards"
              ? `${data.cardDb.cards.length} cards`
              : `${data.fusions.length} fusions`}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {view === "cards" ? (
          <CardsTable cards={data.cardDb.cards} />
        ) : view === "fusions" ? (
          <FusionsTable cardDb={data.cardDb} fusions={data.fusions} />
        ) : (
          <DuelistsPanel
            cardDb={data.cardDb}
            duelists={data.duelists}
            onDuelistChange={handleDuelistChange}
            selectedDuelistId={duelistId}
          />
        )}
      </div>
    </div>
  );
}

import { useCallback, useState } from "react";
import { ToggleGroup } from "../../components/ToggleGroup.tsx";
import { useFusionTable } from "../../lib/fusion-table-context.tsx";
import { CardsTable } from "./CardsTable.tsx";
import { DuelistsPanel } from "./DuelistsPanel.tsx";
import { FusionsTable } from "./FusionsTable.tsx";

type View = "cards" | "fusions" | "duelists";

const VIEW_OPTIONS: { value: View; label: string }[] = [
  { value: "cards", label: "Cards" },
  { value: "fusions", label: "Fusions" },
  { value: "duelists", label: "Duelists" },
];

const STORAGE_KEY = "yfm-data-view";
const VALID_VIEWS = new Set<string>(VIEW_OPTIONS.map((o) => o.value));

function readStoredView(): View {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v && VALID_VIEWS.has(v) ? (v as View) : "cards";
  } catch {
    return "cards";
  }
}

export function DataPanel() {
  const data = useFusionTable();
  const [view, setViewRaw] = useState<View>(readStoredView);

  const setView = useCallback((v: View) => {
    setViewRaw(v);
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch {
      // ignore
    }
  }, []);

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
          <DuelistsPanel cardDb={data.cardDb} duelists={data.duelists} />
        )}
      </div>
    </div>
  );
}

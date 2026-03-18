import { useState } from "react";
import { ToggleGroup } from "../../components/ToggleGroup.tsx";
import { useFusionTable } from "../../lib/fusion-table-context.tsx";
import { CardsTable } from "./CardsTable.tsx";
import { FusionsTable } from "./FusionsTable.tsx";

type View = "cards" | "fusions";

const VIEW_OPTIONS: { value: View; label: string }[] = [
  { value: "cards", label: "Cards" },
  { value: "fusions", label: "Fusions" },
];

export function DataPanel() {
  const data = useFusionTable();
  const [view, setView] = useState<View>("cards");

  return (
    <div className="flex flex-col gap-3 h-full max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-center">
        <ToggleGroup onChange={setView} options={VIEW_OPTIONS} value={view} />
      </div>
      <div className="flex items-center gap-3">
        <span className="ml-auto text-xs text-text-muted">
          {view === "cards"
            ? `${data.cardDb.cards.length} cards`
            : `${data.fusions.length} fusions`}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {view === "cards" ? (
          <CardsTable cards={data.cardDb.cards} />
        ) : (
          <FusionsTable cardDb={data.cardDb} fusions={data.fusions} />
        )}
      </div>
    </div>
  );
}

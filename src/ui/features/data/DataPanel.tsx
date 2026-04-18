import { useCallback } from "react";
import { ToggleGroup } from "../../components/ToggleGroup.tsx";
import { useOwnedCardTotals } from "../../db/use-owned-card-totals.ts";
import { useFusionTable } from "../../lib/fusion-table-context.tsx";
import { useHash } from "../../lib/use-tab-from-hash.ts";
import { BuyPanel } from "./BuyPanel.tsx";
import { CardDetailPage } from "./CardDetailPage.tsx";
import { CardsTable } from "./CardsTable.tsx";
import { DuelistsPanel } from "./DuelistsPanel.tsx";
import { FusionsTable } from "./FusionsTable.tsx";

type View = "cards" | "fusions" | "duelists" | "buy";

const VIEW_OPTIONS: { value: View; label: string }[] = [
  { value: "cards", label: "Cards" },
  { value: "fusions", label: "Fusions" },
  { value: "duelists", label: "Duelists" },
  { value: "buy", label: "Buy" },
];

const VALID_VIEWS = new Set<string>(VIEW_OPTIONS.map((o) => o.value));

function parseDataHash(hash: string): {
  view: View;
  duelistId: number | undefined;
  cardId: number | undefined;
} {
  const segments = hash.split("/");
  // segments[0] = "data", segments[1] = sub-view, segments[2] = id
  const rawView = segments[1] ?? "";
  const view: View = VALID_VIEWS.has(rawView) ? (rawView as View) : "cards";
  const duelistId =
    view === "duelists" && segments[2] ? Number(segments[2]) || undefined : undefined;
  const cardId = view === "cards" && segments[2] ? Number(segments[2]) || undefined : undefined;
  return { view, duelistId, cardId };
}

export function DataPanel() {
  const data = useFusionTable();
  const ownedTotals = useOwnedCardTotals();
  const [hash, setHash] = useHash();
  const { view, duelistId, cardId } = parseDataHash(hash);

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
        <ToggleGroup
          onChange={setView}
          options={VIEW_OPTIONS}
          toHref={(v) => `#data/${v}`}
          value={view}
        />
      </div>
      {view === "cards" && !cardId && (
        <div className="flex items-center gap-3">
          <span className="ml-auto text-xs text-text-muted">{data.cardDb.cards.length} cards</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {view === "cards" ? (
          cardId ? (
            <CardDetailPage cardId={cardId} />
          ) : (
            <CardsTable cards={data.cardDb.cards} />
          )
        ) : view === "fusions" ? (
          <FusionsTable cardDb={data.cardDb} fusions={data.fusions} />
        ) : view === "buy" ? (
          <BuyPanel cards={data.cardDb.cards} ownedTotals={ownedTotals} />
        ) : (
          <DuelistsPanel
            cardDb={data.cardDb}
            duelists={data.duelists}
            onDuelistChange={handleDuelistChange}
            ownedTotals={ownedTotals}
            selectedDuelistId={duelistId}
          />
        )}
      </div>
    </div>
  );
}

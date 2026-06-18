import { useCallback } from "react";
import { ToggleGroup } from "../../components/ToggleGroup.tsx";
import { useOwnedCardTotals } from "../../db/use-owned-card-totals.ts";
import { useFusionTable } from "../../lib/fusion-table-context.tsx";
import { useHash } from "../../lib/use-tab-from-hash.ts";
import { CardDetailPage } from "./CardDetailPage.tsx";
import { CardsTable } from "./CardsTable.tsx";
import { DuelistsPanel } from "./DuelistsPanel.tsx";
import { DataEditPanel } from "./edit/DataEditPanel.tsx";
import { FusionsTable } from "./FusionsTable.tsx";
import { StarchipPanel } from "./StarchipPanel.tsx";

type View = "cards" | "fusions" | "duelists" | "starchip" | "edit";
type EditFeature = "cards" | "fusions";
type EditSection = "pools" | "wording";
type WordingTab = "names" | "descriptions";

const VIEW_OPTIONS: { value: View; label: string }[] = [
  { value: "cards", label: "Cards" },
  { value: "fusions", label: "Fusions" },
  { value: "duelists", label: "Duelists" },
  { value: "starchip", label: "Starchip" },
  { value: "edit", label: "Edit" },
];

const VALID_VIEWS = new Set<string>(VIEW_OPTIONS.map((o) => o.value));
const VALID_WORDING_TABS = new Set<string>(["names", "descriptions"]);
const EDIT_FEATURE_OPTIONS: { value: EditFeature; label: string }[] = [
  { value: "cards", label: "Cards" },
  { value: "fusions", label: "Fusions" },
];

function parseDataHash(hash: string): {
  view: View;
  editFeature: EditFeature;
  editSection: EditSection;
  wordingTab: WordingTab;
  duelistId: number | undefined;
  cardId: number | undefined;
} {
  const segments = hash.split("/");
  // segments[0] = "data", segments[1] = sub-view, segments[2] = id
  const rawView = segments[1] ?? "";
  const view: View = VALID_VIEWS.has(rawView) ? (rawView as View) : "cards";
  const editSection: EditSection =
    view === "edit" && segments[2] === "wording" ? "wording" : "pools";
  const editFeature: EditFeature =
    view === "edit" && segments[2] === "fusions" ? "fusions" : "cards";
  const rawWordingTab = segments[3] ?? "";
  const wordingTab: WordingTab = VALID_WORDING_TABS.has(rawWordingTab)
    ? (rawWordingTab as WordingTab)
    : "names";
  const duelistId =
    view === "duelists" || (view === "edit" && editSection === "pools")
      ? Number(segments[2]) || undefined
      : undefined;
  const cardId = view === "cards" && segments[2] ? Number(segments[2]) || undefined : undefined;
  return { view, editFeature, editSection, wordingTab, duelistId, cardId };
}

export function DataPanel() {
  const data = useFusionTable();
  const ownedTotals = useOwnedCardTotals();
  const [hash, setHash] = useHash();
  const { view, editFeature, editSection, wordingTab, duelistId, cardId } = parseDataHash(hash);

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

  const handleEditDuelistChange = useCallback(
    (id: number) => {
      setHash(`data/edit/${id}`);
    },
    [setHash],
  );

  const editBackHref = "#data/edit";

  return (
    <div className="flex flex-col gap-3 h-full max-w-5xl mx-auto w-full">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        <div />
        <ToggleGroup
          onChange={setView}
          options={VIEW_OPTIONS}
          toHref={(v) => `#data/${v}`}
          value={view}
        />
        {view === "edit" && editSection !== "wording" && (
          <div className="justify-self-end">
            <ToggleGroup
              onChange={(feature) =>
                setHash(feature === "cards" ? "data/edit" : "data/edit/fusions")
              }
              options={EDIT_FEATURE_OPTIONS}
              toHref={(feature) => (feature === "cards" ? "#data/edit" : "#data/edit/fusions")}
              value={editFeature}
            />
          </div>
        )}
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
        ) : view === "starchip" ? (
          <StarchipPanel cards={data.cardDb.cards} ownedTotals={ownedTotals} />
        ) : view === "edit" ? (
          <DataEditPanel
            editBackHref={editBackHref}
            editFeature={editFeature}
            editSection={editSection}
            onDuelistChange={handleEditDuelistChange}
            selectedDuelistId={duelistId}
            wordingTab={wordingTab}
          />
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

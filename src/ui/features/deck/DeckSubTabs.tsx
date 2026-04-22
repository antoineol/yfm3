import { useAtomValue } from "jotai";
import { ToggleGroup } from "../../components/ToggleGroup.tsx";
import { resultAtom } from "../../lib/atoms.ts";

export type DeckSubTab = "collection" | "deck" | "result" | "farm" | "edit";

export const DECK_SUB_TABS: readonly DeckSubTab[] = [
  "collection",
  "deck",
  "result",
  "farm",
  "edit",
];

const SUB_TAB_LABELS: { value: DeckSubTab; label: string }[] = [
  { value: "collection", label: "Collection" },
  { value: "deck", label: "Deck" },
  { value: "result", label: "Optimize" },
  { value: "farm", label: "Farm" },
  { value: "edit", label: "Edit" },
];

export function DeckSubTabs({
  active,
  onChange,
}: {
  active: DeckSubTab;
  onChange: (value: DeckSubTab) => void;
}) {
  const hasResult = useAtomValue(resultAtom) !== null;

  const options = SUB_TAB_LABELS.map(({ value, label }) => ({
    value,
    label,
    decoration:
      value === "result" && hasResult && active !== "result" ? (
        <span className="absolute top-1 right-1 size-1.5 rounded-full bg-stat-up" />
      ) : undefined,
  }));

  // On lg+, the non-edit sub-panels render side-by-side in a grid, so the
  // switcher is mobile-only. Edit takes the full width at every breakpoint.
  const visibilityClass = active === "edit" ? "" : "lg:hidden";

  return (
    <div className={`${visibilityClass} flex items-center justify-center`}>
      <ToggleGroup
        onChange={onChange}
        options={options}
        toHref={(v) => `#deck/${v}`}
        value={active}
      />
    </div>
  );
}

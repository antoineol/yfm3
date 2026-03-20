import { useAtom, useAtomValue } from "jotai";
import { type DeckSubTab, deckSubTabAtom, resultAtom } from "../../lib/atoms.ts";

const SUB_TABS: { value: DeckSubTab; label: string }[] = [
  { value: "collection", label: "Collection" },
  { value: "deck", label: "Deck" },
  { value: "result", label: "Suggested" },
];

export function DeckSubTabs() {
  const [active, setActive] = useAtom(deckSubTabAtom);
  const hasResult = useAtomValue(resultAtom) !== null;

  return (
    <div className="lg:hidden flex rounded-lg bg-bg-surface border border-border-subtle p-0.5 mx-3 mt-2 mb-1">
      {SUB_TABS.map(({ value, label }) => (
        <button
          className={`flex-1 relative py-2 text-xs font-display font-bold uppercase tracking-widest rounded-md transition-colors cursor-pointer ${
            active === value
              ? "bg-bg-hover text-gold-bright"
              : "text-text-secondary hover:text-text-primary"
          }`}
          key={value}
          onClick={() => setActive(value)}
          type="button"
        >
          {label}
          {value === "result" && hasResult && active !== "result" && (
            <span className="absolute top-1.5 right-2 size-1.5 rounded-full bg-stat-up" />
          )}
        </button>
      ))}
    </div>
  );
}

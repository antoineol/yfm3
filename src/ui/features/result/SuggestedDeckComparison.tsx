import { useState } from "react";
import { CardTable } from "../../components/CardTable.tsx";
import type { CardEntry } from "../../components/card-entries.ts";
import { PanelBody } from "../../components/panel-chrome.tsx";
import { DeckFusionList } from "../deck/DeckFusionList.tsx";
import { ScoreExplanation } from "../deck/ScoreExplanation.tsx";
import type { ResultData } from "./use-result-entries.ts";

export function SuggestedDeckComparison({ data }: { data: ResultData }) {
  const { removed, added, kept, swapCount, result } = data;

  return (
    <PanelBody>
      {swapCount === 0 ? (
        <NoChangesNeeded />
      ) : (
        <>
          {removed.length > 0 && (
            <DiffSection
              colorClass="text-stat-atk"
              defaultExpanded
              entries={removed}
              icon={"\u2212"}
              label="Remove"
            />
          )}
          {added.length > 0 && (
            <DiffSection
              colorClass="text-green-400"
              defaultExpanded
              entries={added}
              icon="+"
              label="Add"
            />
          )}
          {kept.length > 0 && (
            <DiffSection
              colorClass="text-text-secondary"
              defaultExpanded={false}
              entries={kept}
              label="Stays"
            />
          )}
        </>
      )}
      <div className="flex flex-col gap-4 mt-4 pt-4 px-3 border-t border-border-subtle">
        <DeckFusionList deckCardIds={result.deck} />
        <ScoreExplanation deckCardIds={result.deck} />
      </div>
    </PanelBody>
  );
}

function DiffSection({
  label,
  entries,
  colorClass,
  icon,
  defaultExpanded,
}: {
  label: string;
  entries: CardEntry[];
  colorClass: string;
  icon?: string;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="flex flex-col">
      <button
        aria-expanded={expanded}
        className="flex items-center gap-2 cursor-pointer text-left px-3 py-2"
        onClick={() => setExpanded((v) => !v)}
        type="button"
      >
        <span
          className="text-text-muted text-xs transition-transform duration-150"
          style={{
            display: "inline-block",
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          {"\u25B6"}
        </span>
        <span
          className={`font-display text-xs font-semibold uppercase tracking-wide ${colorClass}`}
        >
          {label}
        </span>
        <span className="text-text-muted text-xs font-mono">({String(entries.length)})</span>
      </button>
      {expanded && (
        <CardTable
          entries={entries}
          leftActions={icon ? () => <DiffIcon className={colorClass} icon={icon} /> : undefined}
        />
      )}
    </div>
  );
}

function DiffIcon({ icon, className }: { icon: string; className: string }) {
  return <span className={`font-mono text-sm font-bold ${className} w-4 text-center`}>{icon}</span>;
}

function NoChangesNeeded() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-3 gap-3 text-center">
      <p className="font-display text-sm font-semibold uppercase tracking-wide text-gold">
        Your deck is already optimal
      </p>
      <p className="text-text-muted text-sm">No improvements found. All 40 cards stay.</p>
    </div>
  );
}

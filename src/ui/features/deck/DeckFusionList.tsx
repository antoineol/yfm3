import { useCallback, useEffect, useRef, useState } from "react";

import type { CardId } from "../../../engine/data/card-model.ts";
import { type DeckFusion, findDeckFusions } from "../../../engine/deck-fusion-finder.ts";
import { CardName } from "../../components/CardName.tsx";
import { SectionLabel } from "../../components/panel-chrome.tsx";
import { useFusionDepth, useTerrain } from "../../db/use-user-preferences.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { useFusionTable } from "../../lib/fusion-table-context.tsx";

export function DeckFusionList({ deckCardIds }: { deckCardIds: number[] }) {
  const { fusionTable } = useFusionTable();
  const cardDb = useCardDb();
  const fusionDepth = useFusionDepth();
  const terrain = useTerrain();
  const [fusions, setFusions] = useState<DeckFusion[] | null>(null);
  const [expanded, setExpanded] = useState(false);
  const prevDeckRef = useRef(deckCardIds);
  const prevTerrainRef = useRef(terrain);

  // Reset when deck or terrain changes
  useEffect(() => {
    if (prevDeckRef.current !== deckCardIds || prevTerrainRef.current !== terrain) {
      prevDeckRef.current = deckCardIds;
      prevTerrainRef.current = terrain;
      setFusions(null);
      setExpanded(false);
    }
  }, [deckCardIds, terrain]);

  const toggle = useCallback(() => {
    if (fusions === null) {
      const result = findDeckFusions(deckCardIds, fusionTable, cardDb, fusionDepth, terrain);
      setFusions(result);
      setExpanded(true);
    } else {
      setExpanded((v) => !v);
    }
  }, [deckCardIds, fusionTable, cardDb, fusionDepth, terrain, fusions]);

  return (
    <div className="flex flex-col gap-2">
      <button
        aria-expanded={expanded}
        className="flex items-center gap-2 cursor-pointer text-left py-2 lg:py-0"
        onClick={toggle}
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
        <SectionLabel>
          Show Fusions{fusions !== null ? ` (${String(fusions.length)})` : ""}
        </SectionLabel>
      </button>
      {expanded &&
        fusions !== null &&
        (fusions.length === 0 ? (
          <p className="text-text-muted text-sm pl-5">No fusions possible with this deck</p>
        ) : (
          <FusionRows cardDb={cardDb} fusions={fusions} />
        ))}
    </div>
  );
}

function FusionRows({
  fusions,
  cardDb,
}: {
  fusions: DeckFusion[];
  cardDb: ReturnType<typeof useCardDb>;
}) {
  return (
    <div className="flex flex-col gap-1 pl-5">
      {fusions.map((f) => (
        <FusionRow
          cardDb={cardDb}
          fusion={f}
          key={`${String(f.resultCardId)}_${String(f.materialCount)}`}
        />
      ))}
    </div>
  );
}

function FusionRow({
  fusion,
  cardDb,
}: {
  fusion: DeckFusion;
  cardDb: ReturnType<typeof useCardDb>;
}) {
  const getName = (id: number) => cardDb.cardsById.get(id)?.name ?? `#${String(id)}`;
  const getLabelColor = (id: number) => cardDb.cardsById.get(id)?.labelColor;
  const path = fusion.materialPaths[0];
  if (!path) return null;

  return (
    <div className="flex items-baseline gap-2 text-sm py-0.5 px-1">
      <CardName
        cardId={fusion.resultCardId as CardId}
        className="font-display text-gold-bright truncate"
        labelColor={getLabelColor(fusion.resultCardId)}
        name={fusion.resultName}
      />
      <span className="text-text-muted text-xs tabular-nums">{fusion.materialCount}m</span>
      <span className="font-mono font-bold text-stat-atk tabular-nums">{fusion.resultAtk}</span>
      <span className="font-mono text-stat-def tabular-nums">{fusion.resultDef}</span>
      <span className="text-text-muted text-xs flex items-baseline gap-1">
        {"\u2190"}{" "}
        {path.map((id, i) => (
          <span className="contents" key={id}>
            {i > 0 && " + "}
            <CardName
              cardId={id as CardId}
              className="text-text-muted hover:text-gold"
              labelColor={getLabelColor(id)}
              name={getName(id)}
            />
          </span>
        ))}
      </span>
    </div>
  );
}

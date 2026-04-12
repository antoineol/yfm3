import { useMemo } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { HandCard } from "../../db/use-hand.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import { FieldDisplay } from "../hand/FieldDisplay.tsx";
import { FusionResultsList } from "../hand/FusionResultsList.tsx";
import { HandDisplay } from "../hand/HandDisplay.tsx";
import { useZoneToggle } from "../hand/use-zone-toggle.ts";
import { DuelZoneView } from "./DuelZoneView.tsx";

const SHOW_FUSIONS_PHASES = new Set(["hand", "draw"]);

export function PlayerDuelView() {
  const bridge = useBridge();
  const terrain = bridge.stats?.terrain ?? 0;

  const handCards: HandCard[] = useMemo(
    () =>
      bridge.hand.map((cardId, i) => ({
        docId: `bridge-${String(i)}` as Id<"hand">,
        cardId,
      })),
    [bridge.hand],
  );

  // Opponent's turn → show field (hand is frozen anyway).
  const zonePhase = bridge.phase === "opponent" ? ("field" as const) : bridge.phase;
  const { focusedZone, switchZone } = useZoneToggle(true, zonePhase);

  const fusionsVisible = SHOW_FUSIONS_PHASES.has(bridge.phase);

  return (
    <>
      <DuelZoneView
        fieldCount={bridge.field.length}
        fieldNode={<FieldDisplay cards={bridge.field} terrain={terrain} />}
        focusedZone={focusedZone}
        handCount={handCards.length}
        handNode={
          <HandDisplay
            cards={handCards}
            drawing={bridge.phase === "draw"}
            frozen={!bridge.handReliable}
            terrain={terrain}
          />
        }
        onSwitchZone={switchZone}
      />
      {fusionsVisible && (
        <section>
          <FusionResultsList fieldCards={bridge.field} handCards={handCards} terrain={terrain} />
        </section>
      )}
    </>
  );
}

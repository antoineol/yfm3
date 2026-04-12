import { useMemo } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { HandCard } from "../../db/use-hand.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import { FieldDisplay } from "../hand/FieldDisplay.tsx";
import { FusionResultsList } from "../hand/FusionResultsList.tsx";
import { useZoneToggle } from "../hand/use-zone-toggle.ts";
import { DuelZoneView } from "./DuelZoneView.tsx";
import { OpponentHandGrid } from "./OpponentHandGrid.tsx";

export function OpponentDuelView() {
  const bridge = useBridge();
  const terrain = bridge.stats?.terrain ?? 0;

  // Fake HandCard objects — docIds are never accessed (no onPlayFusion).
  const handCards: HandCard[] = useMemo(
    () =>
      bridge.opponentHand.map((cardId, i) => ({
        docId: `opponent-${String(i)}` as Id<"hand">,
        cardId,
      })),
    [bridge.opponentHand],
  );

  const { focusedZone, switchZone } = useZoneToggle(true, bridge.opponentPhase);

  return (
    <div className="fm-opponent-theme flex flex-col gap-2">
      <DuelZoneView
        fieldCount={bridge.opponentField.length}
        fieldNode={<FieldDisplay cards={bridge.opponentField} terrain={terrain} />}
        focusedZone={focusedZone}
        handCount={bridge.opponentHand.length}
        handNode={<OpponentHandGrid cardIds={bridge.opponentHand} terrain={terrain} />}
        onSwitchZone={switchZone}
      />
      <section>
        <FusionResultsList
          fieldCards={bridge.opponentField}
          handCards={handCards}
          terrain={terrain}
        />
      </section>
    </div>
  );
}

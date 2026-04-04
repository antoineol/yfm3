import { useCallback, useState } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { FusionChainResult } from "../../../engine/fusion-chain-finder.ts";
import { useHandMutations } from "../../db/use-hand.ts";
import type { FieldCard } from "../../lib/bridge-state-interpreter.ts";

/** Manages the field state in manual (non-bridge) mode: playing fusions, clearing. */
export function useManualField() {
  const { removeMultipleFromHand } = useHandMutations();
  const [manualField, setManualField] = useState<FieldCard[]>([]);

  const clearField = useCallback(() => setManualField([]), []);

  const playFusion = useCallback(
    (materialDocIds: Id<"hand">[], result: FusionChainResult) => {
      if (materialDocIds.length > 0) {
        void removeMultipleFromHand({ ids: materialDocIds });
      }
      // Remove consumed field cards
      if (result.fieldMaterialCardIds.length > 0) {
        setManualField((prev) => {
          const next = [...prev];
          for (const fieldCardId of result.fieldMaterialCardIds) {
            const idx = next.findIndex((fc) => fc.cardId === fieldCardId);
            if (idx >= 0) next.splice(idx, 1);
          }
          return next;
        });
      }
      // Add fusion result to field
      setManualField((prev) => [
        ...prev,
        { cardId: result.resultCardId, atk: result.resultAtk, def: result.resultDef },
      ]);
    },
    [removeMultipleFromHand],
  );

  return { manualField, clearField, playFusion } as const;
}

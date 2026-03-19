import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import type { CardId } from "../../engine/data/card-model.ts";
import { openCardIdAtom } from "./atoms.ts";

/** Subscribe to card-id state and get actions. Use only when you need `cardId`. */
export function useCardDetail() {
  const cardId = useAtomValue(openCardIdAtom);
  const setCardId = useSetAtom(openCardIdAtom);
  const closeCard = useCallback(() => setCardId(null), [setCardId]);
  return { cardId, openCard: setCardId as (id: CardId) => void, closeCard };
}

/** Get the openCard setter only — does not re-render when the open card changes. */
export function useOpenCard(): (id: CardId) => void {
  return useSetAtom(openCardIdAtom);
}

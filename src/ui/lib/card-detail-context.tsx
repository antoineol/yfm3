import { createContext, type ReactNode, useContext, useMemo, useState } from "react";
import type { CardId } from "../../engine/data/card-model.ts";

interface CardDetailActions {
  openCard: (id: CardId) => void;
  closeCard: () => void;
}

interface CardDetailState extends CardDetailActions {
  cardId: CardId | null;
}

const ActionsContext = createContext<CardDetailActions | null>(null);
const StateContext = createContext<CardId | null>(null);

export function CardDetailProvider({ children }: { children: ReactNode }) {
  const [cardId, setCardId] = useState<CardId | null>(null);
  const actions = useMemo<CardDetailActions>(
    () => ({
      openCard: (id: CardId) => setCardId(id),
      closeCard: () => setCardId(null),
    }),
    [],
  );

  return (
    <ActionsContext.Provider value={actions}>
      <StateContext.Provider value={cardId}>{children}</StateContext.Provider>
    </ActionsContext.Provider>
  );
}

/** Subscribe to both card-id state and actions. Use only when you need `cardId`. */
export function useCardDetail(): CardDetailState {
  const actions = useContext(ActionsContext);
  const cardId = useContext(StateContext);
  if (!actions) throw new Error("useCardDetail must be used within a CardDetailProvider");
  return { cardId, ...actions };
}

/** Subscribe to actions only — does not re-render when the open card changes. */
export function useOpenCard(): (id: CardId) => void {
  const actions = useContext(ActionsContext);
  if (!actions) throw new Error("useOpenCard must be used within a CardDetailProvider");
  return actions.openCard;
}

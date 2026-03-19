import { createContext, type ReactNode, useCallback, useContext, useState } from "react";
import type { CardId } from "../../engine/data/card-model.ts";

interface CardDetailState {
  cardId: CardId | null;
  openCard: (id: CardId) => void;
  closeCard: () => void;
}

const CardDetailContext = createContext<CardDetailState | null>(null);

export function CardDetailProvider({ children }: { children: ReactNode }) {
  const [cardId, setCardId] = useState<CardId | null>(null);
  const openCard = useCallback((id: CardId) => setCardId(id), []);
  const closeCard = useCallback(() => setCardId(null), []);

  return (
    <CardDetailContext.Provider value={{ cardId, openCard, closeCard }}>
      {children}
    </CardDetailContext.Provider>
  );
}

export function useCardDetail(): CardDetailState {
  const ctx = useContext(CardDetailContext);
  if (!ctx) throw new Error("useCardDetail must be used within a CardDetailProvider");
  return ctx;
}

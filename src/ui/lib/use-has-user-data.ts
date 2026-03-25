import { useDeck } from "../db/use-deck.ts";
import { useOwnedCardTotals } from "../db/use-owned-card-totals.ts";

export function useHasUserData(): boolean {
  const ownedCardTotals = useOwnedCardTotals();
  const deck = useDeck();
  return (
    (ownedCardTotals !== undefined && Object.keys(ownedCardTotals).length > 0) ||
    (deck !== undefined && deck.length > 0)
  );
}

import { useMutation } from "convex/react";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { useDeckSize, useFusionDepth } from "../../db/use-user-preferences.ts";
import { currentDeckScoreAtom } from "../../lib/atoms.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import {
  useDeckRowsFromState,
  useHydrateCollectionState,
  useLastAddedCollectionState,
} from "./collection-state.ts";
import { useDeckSwapSuggestion } from "./use-deck-swap-suggestion.ts";

type AppliedSwap = { addedCardId: number; removedCardId: number };

export interface LastAddedCardHintHeaderModel {
  name: string;
  totalOwned: number;
  disableAdd: boolean;
  disableRemove: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onDismiss: () => void;
}

export type LastAddedCardHintSwapModel =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "applied"; applying: boolean; onRevert: () => void }
  | {
      kind: "suggestion";
      addedName: string;
      applying: boolean;
      improvement: number;
      onApply: () => void;
      onReject: () => void;
      removedName: string;
    };

export interface LastAddedCardHintModel {
  header: LastAddedCardHintHeaderModel;
  swap: LastAddedCardHintSwapModel;
}

export function useLastAddedCardHint(): LastAddedCardHintModel | null {
  useHydrateCollectionState();
  const deck = useDeckRowsFromState();
  const cardDb = useCardDb();
  const { addedCardId, availableInCollection, card, totalOwned } = useLastAddedCollectionState();
  const [appliedSwap, setAppliedSwap] = useState<AppliedSwap | null>(null);
  const addCard = useMutation(api.ownedCards.addCard);
  const removeCard = useMutation(api.ownedCards.removeCard);
  const clearHint = useMutation(api.userPreferences.clearLastAddedCard);
  const applySuggestedSwap = useMutation(api.deck.applySuggestedSwap);
  const [applying, setApplying] = useState(false);
  const { loading, suggestion, clearSuggestion } = useDeckSwapSuggestion({
    addedCardId,
    addedCardAvailableCopies: availableInCollection,
    currentDeckScore: useAtomValue(currentDeckScoreAtom),
    deck,
    deckSize: useDeckSize(),
    fusionDepth: useFusionDepth(),
  });

  useEffect(() => {
    if (
      appliedSwap &&
      (addedCardId === null || !card || totalOwned <= 0 || addedCardId !== appliedSwap.addedCardId)
    ) {
      setAppliedSwap(null);
    }
  }, [addedCardId, appliedSwap, card, totalOwned]);

  if (addedCardId === null || !card || totalOwned <= 0) return null;

  const removedName = suggestion
    ? (cardDb.cardsById.get(suggestion.removedCardId)?.name ?? `#${suggestion.removedCardId}`)
    : "";

  function runSwap({
    addCardId,
    removeCardId,
    successMessage,
    errorMessage,
    errorPrefix,
    onSuccess,
  }: {
    addCardId: number;
    removeCardId: number;
    successMessage: string;
    errorMessage: string;
    errorPrefix: string;
    onSuccess: () => void;
  }) {
    setApplying(true);
    applySuggestedSwap({ addCardId, removeCardId })
      .then(() => {
        onSuccess();
        toast.success(successMessage);
      })
      .catch((error) => {
        console.error(errorPrefix, error);
        toast.error(errorMessage);
      })
      .finally(() => setApplying(false));
  }

  return {
    header: {
      name: card.name,
      totalOwned,
      disableAdd: totalOwned >= 3,
      disableRemove: availableInCollection <= 0,
      onAdd: () => void addCard({ cardId: addedCardId }),
      onRemove: () => void removeCard({ cardId: addedCardId }),
      onDismiss: () => {
        setAppliedSwap(null);
        void clearHint({});
      },
    },
    swap: appliedSwap
      ? {
          kind: "applied",
          applying,
          onRevert: () =>
            runSwap({
              addCardId: appliedSwap.removedCardId,
              removeCardId: addedCardId,
              successMessage: "Deck swap reverted",
              errorMessage: "Could not revert deck swap",
              errorPrefix: "Suggested swap revert failed:",
              onSuccess: () => setAppliedSwap(null),
            }),
        }
      : suggestion
        ? {
            kind: "suggestion",
            addedName: card.name,
            applying,
            improvement: suggestion.improvement,
            onApply: () =>
              runSwap({
                addCardId: addedCardId,
                removeCardId: suggestion.removedCardId,
                successMessage: "Deck swap applied",
                errorMessage: "Could not apply deck swap",
                errorPrefix: "Suggested swap failed:",
                onSuccess: () => {
                  clearSuggestion();
                  setAppliedSwap({ addedCardId, removedCardId: suggestion.removedCardId });
                },
              }),
            onReject: clearSuggestion,
            removedName,
          }
        : loading
          ? { kind: "loading" }
          : { kind: "idle" },
  };
}

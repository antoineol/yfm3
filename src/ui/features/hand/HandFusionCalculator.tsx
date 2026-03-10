import { useCallback, useEffect, useRef, useState } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
import { HAND_SIZE } from "../../../engine/types/constants.ts";
import { PanelLoadingState, SectionLabel } from "../../components/panel-chrome.tsx";
import { ToggleGroup } from "../../components/ToggleGroup.tsx";
import { useDeck } from "../../db/use-deck.ts";
import { useHand, useHandMutations } from "../../db/use-hand.ts";
import { useFusionDepth } from "../../db/use-user-preferences.ts";
import { FusionResultsList } from "./FusionResultsList.tsx";
import { HandCardSelector } from "./HandCardSelector.tsx";
import { HandDisplay } from "./HandDisplay.tsx";

type SourceMode = "deck" | "all";

const SOURCE_OPTIONS: { value: SourceMode; label: string }[] = [
  { value: "all", label: "All cards" },
  { value: "deck", label: "Deck only" },
];

export function HandFusionCalculator() {
  const hand = useHand();
  const deck = useDeck();
  const fusionDepth = useFusionDepth();
  const { addToHand, removeFromHand, removeMultipleFromHand, clearHand } = useHandMutations();
  const [sourceMode, setSourceMode] = useState<SourceMode>("all");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const deckCardIds = deck?.map((d) => d.cardId);

  // Blur input when hand becomes full
  const handLength = hand?.length ?? 0;
  useEffect(() => {
    if (handLength >= HAND_SIZE) {
      inputRef.current?.blur();
    }
  }, [handLength]);

  const handlePlayFusion = useCallback(
    (materialDocIds: Id<"hand">[]) => {
      if (materialDocIds.length > 0) {
        void removeMultipleFromHand({ ids: materialDocIds });
      }
    },
    [removeMultipleFromHand],
  );

  if (hand === undefined) return <PanelLoadingState />;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5">
      {/* Card source selector + autocomplete */}
      <div className="flex flex-col gap-2">
        <ToggleGroup onChange={setSourceMode} options={SOURCE_OPTIONS} value={sourceMode} />
        <HandCardSelector
          deckCardIds={deckCardIds}
          handSize={hand.length}
          inputRef={inputRef}
          onSelect={(card) => void addToHand({ cardId: card.id })}
          sourceMode={sourceMode}
        />
      </div>

      {/* Hand display */}
      <section>
        <div className="flex items-baseline justify-between mb-2">
          <SectionLabel>
            Your Hand
            <span className="text-text-muted font-body font-normal ml-1.5">
              ({String(hand.length)}/{String(HAND_SIZE)})
            </span>
          </SectionLabel>
          {hand.length > 0 && (
            <button
              className="text-xs text-text-muted hover:text-stat-atk transition-colors cursor-pointer"
              onClick={() => void clearHand()}
              type="button"
            >
              Clear hand
            </button>
          )}
        </div>
        <HandDisplay cards={hand} onRemove={(docId) => void removeFromHand({ id: docId })} />
      </section>

      {/* Fusion results */}
      <section>
        <div className="mb-2">
          <SectionLabel>Possible Fusions</SectionLabel>
        </div>
        <FusionResultsList
          fusionDepth={fusionDepth}
          handCards={hand}
          onPlayFusion={handlePlayFusion}
        />
      </section>
    </div>
  );
}

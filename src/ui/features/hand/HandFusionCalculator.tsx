import { useCallback, useEffect, useRef } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
import { HAND_SIZE } from "../../../engine/types/constants.ts";
import { PanelLoadingState, SectionLabel } from "../../components/panel-chrome.tsx";
import { ToggleGroup } from "../../components/ToggleGroup.tsx";
import { useDeck } from "../../db/use-deck.ts";
import { useHand, useHandMutations } from "../../db/use-hand.ts";
import { useUpdatePreferences } from "../../db/use-update-preferences.ts";
import {
  type HandSourceMode,
  useFusionDepth,
  useHandSourceMode,
} from "../../db/use-user-preferences.ts";
import { useEmulatorBridge } from "../../lib/use-emulator-bridge.ts";
import { EmulatorBridgeBar } from "./EmulatorBridgeBar.tsx";
import { FusionResultsList } from "./FusionResultsList.tsx";
import { HandCardSelector } from "./HandCardSelector.tsx";
import { HandDisplay } from "./HandDisplay.tsx";

const SOURCE_OPTIONS: { value: HandSourceMode; label: string }[] = [
  { value: "all", label: "All cards" },
  { value: "deck", label: "Deck only" },
];

export function HandFusionCalculator() {
  const hand = useHand();
  const deck = useDeck();
  const fusionDepth = useFusionDepth();
  const sourceMode = useHandSourceMode();
  const updatePreferences = useUpdatePreferences();
  const { addToHand, removeFromHand, removeMultipleFromHand, clearHand } = useHandMutations();
  const bridge = useEmulatorBridge();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pendingFocusRef = useRef(false);

  const deckCardIds = deck?.map((d) => d.cardId);

  const handLength = hand?.length ?? 0;
  useEffect(() => {
    if (handLength >= HAND_SIZE) {
      inputRef.current?.blur();
    } else if (pendingFocusRef.current) {
      pendingFocusRef.current = false;
      inputRef.current?.focus();
    }
  }, [handLength]);

  const requestInputFocus = useCallback(() => {
    inputRef.current?.focus();
    pendingFocusRef.current = true;
  }, []);

  const handlePlayFusion = useCallback(
    (materialDocIds: Id<"hand">[]) => {
      if (materialDocIds.length > 0) {
        void removeMultipleFromHand({ ids: materialDocIds });
        requestInputFocus();
      }
    },
    [removeMultipleFromHand, requestInputFocus],
  );

  const handleSourceModeChange = useCallback(
    (value: HandSourceMode) => {
      if (value === sourceMode) return;
      updatePreferences({ handSourceMode: value });
      requestInputFocus();
    },
    [sourceMode, updatePreferences, requestInputFocus],
  );

  if (hand === undefined) return <PanelLoadingState />;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5">
      {/* Emulator bridge status */}
      <EmulatorBridgeBar bridge={bridge} currentHand={hand} />

      {/* Card source selector + autocomplete */}
      <div className="flex flex-col gap-2">
        <ToggleGroup
          onChange={handleSourceModeChange}
          options={SOURCE_OPTIONS}
          value={sourceMode}
        />
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
              className="text-xs text-text-muted hover:text-stat-atk transition-colors cursor-pointer py-2 px-3 -my-2 -mr-3 rounded-md"
              onClick={() => {
                void clearHand();
                requestInputFocus();
              }}
              type="button"
            >
              Clear hand
            </button>
          )}
        </div>
        <HandDisplay
          cards={hand}
          frozen={bridge.inDuel && !bridge.handReliable}
          onRemove={(docId) => {
            void removeFromHand({ id: docId });
            requestInputFocus();
          }}
        />
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

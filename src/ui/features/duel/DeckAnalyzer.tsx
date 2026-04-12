import { useCallback } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { FusionChainResult } from "../../../engine/fusion-chain-finder.ts";
import { HAND_SIZE } from "../../../engine/types/constants.ts";
import { PanelLoadingState, SectionLabel } from "../../components/panel-chrome.tsx";
import { ToggleGroup } from "../../components/ToggleGroup.tsx";
import { useHand, useHandMutations } from "../../db/use-hand.ts";
import { useUpdatePreferences } from "../../db/use-update-preferences.ts";
import { type HandSourceMode, useHandSourceMode } from "../../db/use-user-preferences.ts";
import { FieldDisplay } from "../hand/FieldDisplay.tsx";
import { FusionResultsList } from "../hand/FusionResultsList.tsx";
import { HandCardSelector } from "../hand/HandCardSelector.tsx";
import { HandDisplay } from "../hand/HandDisplay.tsx";
import { useHandInputFocus } from "../hand/use-hand-input-focus.ts";
import { useManualField } from "../hand/use-manual-field.ts";

const SOURCE_OPTIONS: { value: HandSourceMode; label: string }[] = [
  { value: "all", label: "All cards" },
  { value: "deck", label: "Deck only" },
];

export function DeckAnalyzer() {
  const hand = useHand();
  const sourceMode = useHandSourceMode();
  const updatePreferences = useUpdatePreferences();
  const { removeFromHand, clearHand } = useHandMutations();
  const { manualField, clearField, playFusion } = useManualField();
  const { inputRef, requestInputFocus } = useHandInputFocus(hand?.length ?? 0);

  const handlePlayFusion = useCallback(
    (materialDocIds: Id<"hand">[], result: FusionChainResult) => {
      playFusion(materialDocIds, result);
      requestInputFocus();
    },
    [playFusion, requestInputFocus],
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
    <>
      <div className="flex flex-col gap-2">
        <ToggleGroup
          onChange={handleSourceModeChange}
          options={SOURCE_OPTIONS}
          value={sourceMode}
        />
        <HandCardSelector inputRef={inputRef} />
      </div>

      {manualField.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>
              Your Field
              <span className="text-text-muted font-body font-normal ml-1.5">
                ({String(manualField.length)}/5)
              </span>
            </SectionLabel>
            <button
              className="text-xs text-text-muted hover:text-stat-atk transition-colors cursor-pointer py-2 px-3 -my-2 -mr-3 rounded-md"
              onClick={clearField}
              type="button"
            >
              Clear field
            </button>
          </div>
          <FieldDisplay cards={manualField} />
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-2">
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
          onRemove={(docId) => {
            void removeFromHand({ id: docId });
            requestInputFocus();
          }}
        />
      </section>

      <section>
        <div className="mb-1">
          <SectionLabel>Best Plays</SectionLabel>
        </div>
        <FusionResultsList
          fieldCards={manualField}
          handCards={hand}
          onPlayFusion={handlePlayFusion}
        />
      </section>
    </>
  );
}

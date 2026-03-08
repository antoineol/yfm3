import { useAtomValue } from "jotai";
import { DECK_SIZE, HAND_SIZE, MAX_FUSION_DEPTH } from "../../engine/types/constants.ts";
import { useUpdateDeckSize, useUpdateFusionDepth } from "../db/use-update-preferences.ts";
import { useDeckSize, useFusionDepth } from "../db/use-user-preferences.ts";
import { isOptimizingAtom } from "../lib/atoms.ts";

export function ConfigPanel() {
  const isOptimizing = useAtomValue(isOptimizingAtom);
  const deckSize = useDeckSize();
  const setDeckSize = useUpdateDeckSize();
  const fusionDepth = useFusionDepth();
  const setFusionDepth = useUpdateFusionDepth();

  function handleDeckSizeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDeckSize(Number(e.target.value));
  }

  function handleFusionDepthChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFusionDepth(Number(e.target.value));
  }

  return (
    <div className="flex items-center gap-4 mb-4 text-sm">
      <label className="flex items-center gap-1">
        Deck size:
        <input
          type="number"
          min={HAND_SIZE}
          max={DECK_SIZE}
          value={deckSize}
          onChange={handleDeckSizeChange}
          className="w-16 px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-center"
          disabled={isOptimizing}
        />
      </label>
      <label className="flex items-center gap-1">
        Fusion depth:
        <input
          type="number"
          min={1}
          max={MAX_FUSION_DEPTH}
          value={fusionDepth}
          onChange={handleFusionDepthChange}
          className="w-16 px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-center"
          disabled={isOptimizing}
        />
      </label>
    </div>
  );
}

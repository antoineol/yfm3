import { useMutation } from "convex/react";
import { useAtom, useAtomValue } from "jotai";
import { api } from "../../../convex/_generated/api";
import { DECK_SIZE, HAND_SIZE } from "../../engine/types/constants.ts";
import { deckSizeAtom, isOptimizingAtom, userIdAtom } from "../lib/atoms.ts";

export function ConfigPanel() {
  const userId = useAtomValue(userIdAtom);
  const [deckSize, setDeckSize] = useAtom(deckSizeAtom);
  const isOptimizing = useAtomValue(isOptimizingAtom);
  const updatePreferences = useMutation(api.collection.updatePreferences);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    if (v >= HAND_SIZE && v <= DECK_SIZE) {
      setDeckSize(v);
      if (userId) {
        updatePreferences({ userId, deckSize: v });
      }
    }
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
          onChange={handleChange}
          className="w-16 px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-center"
          disabled={isOptimizing}
        />
      </label>
    </div>
  );
}

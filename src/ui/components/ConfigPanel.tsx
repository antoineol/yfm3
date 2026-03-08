import { DECK_SIZE, HAND_SIZE } from "../../engine/types/constants.ts";

interface ConfigPanelProps {
  deckSize: number;
  onDeckSizeChange: (size: number) => void;
  isOptimizing: boolean;
}

export function ConfigPanel({ deckSize, onDeckSizeChange, isOptimizing }: ConfigPanelProps) {
  return (
    <div className="flex items-center gap-4 mb-4 text-sm">
      <label className="flex items-center gap-1">
        Deck size:
        <input
          type="number"
          min={HAND_SIZE}
          max={DECK_SIZE}
          value={deckSize}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= HAND_SIZE && v <= DECK_SIZE) onDeckSizeChange(v);
          }}
          className="w-16 px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-center"
          disabled={isOptimizing}
        />
      </label>
    </div>
  );
}

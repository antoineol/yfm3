import { useAtomValue } from "jotai";
import { z } from "zod";
import { DECK_SIZE, HAND_SIZE, MAX_FUSION_DEPTH } from "../../../engine/types/constants.ts";
import { useUpdateDeckSize, useUpdateFusionDepth } from "../../db/use-update-preferences.ts";
import { useDeckSize, useFusionDepth } from "../../db/use-user-preferences.ts";
import { useDraftField } from "../../hooks/use-draft-field.ts";
import { isOptimizingAtom } from "../../lib/atoms.ts";
import { OptimizeButton } from "../optimize/OptimizeButton.tsx";

const deckSizeSchema = z.number().int().min(HAND_SIZE).max(DECK_SIZE);
const fusionDepthSchema = z.number().int().min(1).max(MAX_FUSION_DEPTH);

export function ConfigPanel() {
  const isOptimizing = useAtomValue(isOptimizingAtom);
  const deckSize = useDeckSize();
  const commitDeckSize = useUpdateDeckSize();
  const fusionDepth = useFusionDepth();
  const commitFusionDepth = useUpdateFusionDepth();

  return (
    <div className="flex items-center gap-6 px-5 py-3 border-b border-border-subtle text-sm">
      <ConfigInput
        label="Deck size"
        value={deckSize}
        schema={deckSizeSchema}
        onCommit={commitDeckSize}
        disabled={isOptimizing}
      />
      <ConfigInput
        label="Fusion depth"
        value={fusionDepth}
        schema={fusionDepthSchema}
        onCommit={commitFusionDepth}
        disabled={isOptimizing}
      />
      <div className="ml-auto">
        <OptimizeButton />
      </div>
    </div>
  );
}

interface ConfigInputProps {
  label: string;
  value: number;
  schema: z.ZodType<number>;
  onCommit: (v: number) => void;
  disabled: boolean;
}

export function ConfigInput({ label, value, schema, onCommit, disabled }: ConfigInputProps) {
  const { inputProps, error } = useDraftField(value, schema, onCommit);

  return (
    <label className="flex items-center gap-2 text-text-secondary">
      {label}:
      <input
        {...inputProps}
        type="text"
        inputMode="numeric"
        disabled={disabled}
        className={`w-14 px-2 py-1 bg-bg-surface border rounded text-center font-mono text-text-primary transition-colors
					${error ? "border-stat-atk" : "border-border-subtle"}
					focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold
					disabled:opacity-40 disabled:cursor-not-allowed`}
      />
    </label>
  );
}

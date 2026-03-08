import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { DECK_SIZE, HAND_SIZE, MAX_FUSION_DEPTH } from "../../engine/types/constants.ts";
import { useUpdateDeckSize, useUpdateFusionDepth } from "../db/use-update-preferences.ts";
import { useDeckSize, useFusionDepth } from "../db/use-user-preferences.ts";
import { OptimizeButton } from "../features/optimize/OptimizeButton.tsx";
import { isOptimizingAtom } from "../lib/atoms.ts";

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
        min={HAND_SIZE}
        max={DECK_SIZE}
        onCommit={commitDeckSize}
        disabled={isOptimizing}
      />
      <ConfigInput
        label="Fusion depth"
        value={fusionDepth}
        min={1}
        max={MAX_FUSION_DEPTH}
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
  min: number;
  max: number;
  onCommit: (v: number) => void;
  disabled: boolean;
}

export function ConfigInput({ label, value, min, max, onCommit, disabled }: ConfigInputProps) {
  const [draft, setDraft] = useState(String(value));
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync from Convex when not editing
  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed === "" || Number.isNaN(Number(trimmed))) {
      setDraft(String(value));
      return;
    }
    const n = Number(trimmed);
    const clamped = Math.min(max, Math.max(min, Math.round(n)));
    setDraft(String(clamped));
    if (clamped !== value) onCommit(clamped);
  }

  const parsed = Number(draft);
  const outOfRange = draft !== "" && !Number.isNaN(parsed) && (parsed < min || parsed > max);

  return (
    <label className="flex items-center gap-2 text-text-secondary">
      {label}:
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => setEditing(true)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") inputRef.current?.blur();
        }}
        className={`w-14 px-2 py-1 bg-bg-surface border rounded text-center font-mono text-text-primary transition-colors
          ${outOfRange ? "border-stat-atk" : "border-border-subtle"}
          focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold
          disabled:opacity-40 disabled:cursor-not-allowed`}
      />
    </label>
  );
}

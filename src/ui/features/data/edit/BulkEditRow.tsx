import { useAtomValue, useSetAtom } from "jotai";
import { useRef, useState } from "react";
import { draftWeightsAtom, type PoolType, setPoolWeightForCardsAtom } from "./atoms.ts";

type Props = {
  pools: readonly PoolType[];
  targetCardIds: readonly number[];
  scopeLabel: string;
};

export function BulkEditRow({ pools, targetCardIds, scopeLabel }: Props) {
  const setForCards = useSetAtom(setPoolWeightForCardsAtom);
  const draft = useAtomValue(draftWeightsAtom);
  const disabled = targetCardIds.length === 0;
  return (
    <tr
      className="sticky top-7 z-10 border-t border-border-accent/60 bg-bg-panel"
      title="Type a weight to apply it to every row in scope."
    >
      <td className="py-0.5 px-0.5" />
      <td
        className="py-0.5 px-1 text-xs text-text-secondary italic text-right normal-case"
        colSpan={4}
      >
        {scopeLabel}
      </td>
      {pools.map((p) => (
        <BulkWeightCellPair
          currentPool={draft?.[p]}
          disabled={disabled}
          key={p}
          onApply={(n) => setForCards({ cardIds: targetCardIds, poolType: p, weight: n })}
        />
      ))}
    </tr>
  );
}

function BulkWeightCellPair({
  currentPool,
  disabled,
  onApply,
}: {
  currentPool: number[] | undefined;
  disabled: boolean;
  onApply: (n: number) => void;
}) {
  return (
    <>
      <td className="py-0.5 px-1 text-right">
        <BulkWeightInput currentPool={currentPool} disabled={disabled} onApply={onApply} />
      </td>
      <td className="py-0.5 px-1" />
    </>
  );
}

function BulkWeightInput({
  currentPool,
  disabled,
  onApply,
}: {
  currentPool: number[] | undefined;
  disabled: boolean;
  onApply: (n: number) => void;
}) {
  const [draft, setDraft] = useState("");
  // Clear the staged value when the column changes from *outside* the bulk
  // input (per-row edit, rebalance, revert, …). While the input has focus the
  // user is driving the change themselves, so self-triggered updates don't
  // self-clear. `currentPool` ref changes iff this pool's array was replaced.
  const lastPoolRef = useRef(currentPool);
  const isFocusedRef = useRef(false);
  if (lastPoolRef.current !== currentPool) {
    if (!isFocusedRef.current && draft !== "") setDraft("");
    lastPoolRef.current = currentPool;
  }

  return (
    <input
      className="py-0.5 px-1 text-sm font-mono tabular-nums text-right bg-bg-surface border border-border-subtle rounded w-14 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold disabled:opacity-40 disabled:cursor-not-allowed"
      disabled={disabled}
      inputMode="numeric"
      onBlur={() => {
        isFocusedRef.current = false;
      }}
      onChange={(e) => {
        const cleaned = e.currentTarget.value.replace(/[^\d]/g, "");
        setDraft(cleaned);
        if (cleaned === "") return;
        const parsed = Number.parseInt(cleaned, 10);
        if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 0xffff) {
          onApply(parsed);
        }
      }}
      onFocus={(e) => {
        isFocusedRef.current = true;
        e.currentTarget.select();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        else if (e.key === "Escape") {
          setDraft("");
          e.currentTarget.blur();
        }
      }}
      value={draft}
    />
  );
}

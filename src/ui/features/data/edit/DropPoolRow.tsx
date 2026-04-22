import { useSetAtom } from "jotai";
import { memo, useState } from "react";
import type { CardSpec } from "../../../../engine/data/card-model.ts";
import { CardName } from "../../../components/CardName.tsx";
import { cardTypeBorderColor } from "../../../components/card-entries.ts";
import { formatCardId } from "../../../lib/format.ts";
import { POOL_SUM, type PoolType, setWeightAtom } from "./atoms.ts";

type Props = {
  cardId: number;
  card: CardSpec | undefined;
  pools: readonly PoolType[];
  weights: Partial<Record<PoolType, number>>;
  pinned: boolean;
  modified: boolean;
  /** Called when the user toggles this row's pin checkbox.
   *  `desired` is what the click intends (true = become pinned, false = unpin).
   *  `shiftKey` is the native shift-key state at click time, so the parent can
   *  apply the desired state to every row between this and the last anchor. */
  onTogglePin: (cardId: number, desired: boolean, shiftKey: boolean) => void;
};

export const DropPoolRow = memo(DropPoolRowImpl);

function DropPoolRowImpl({ cardId, card, pools, weights, pinned, modified, onTogglePin }: Props) {
  const setWeight = useSetAtom(setWeightAtom);
  const isMonster = card?.isMonster ?? false;
  const borderColor = cardTypeBorderColor(card?.cardType, isMonster);

  return (
    <tr
      className={`border-t border-border-subtle/50 transition-colors duration-150 hover:bg-bg-hover even:bg-bg-surface/30 ${
        modified ? "bg-stat-up/5!" : ""
      }`}
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <td className="py-0.5 px-0.5 text-center">
        <input
          aria-label={`Pin ${card?.name ?? `card ${cardId}`}`}
          checked={pinned}
          className="accent-gold size-4 cursor-pointer align-middle"
          onChange={(e) => {
            const shift = (e.nativeEvent as MouseEvent).shiftKey === true;
            onTogglePin(cardId, e.currentTarget.checked, shift);
          }}
          type="checkbox"
        />
      </td>
      <td className="py-0.5 px-1 font-mono text-xs text-text-primary tabular-nums">
        {formatCardId(cardId)}
      </td>
      <td className="py-0.5 px-1 text-text-primary">
        {card ? (
          <CardName cardId={cardId} name={card.name} />
        ) : (
          <span className="text-text-secondary italic">(unknown card)</span>
        )}
      </td>
      <td className="py-0.5 px-1 text-right font-mono font-bold text-stat-atk tabular-nums">
        {isMonster ? card?.attack : ""}
      </td>
      <td className="py-0.5 px-1 text-right font-mono text-xs text-stat-def tabular-nums">
        {isMonster ? card?.defense : ""}
      </td>
      {pools.map((p) => {
        const w = weights[p] ?? 0;
        return (
          <WeightCellPair
            key={p}
            onCommit={(n) => setWeight({ cardId, weight: n, poolType: p })}
            weight={w}
          />
        );
      })}
    </tr>
  );
}

function WeightCellPair({ weight, onCommit }: { weight: number; onCommit: (n: number) => void }) {
  const percent = ((weight / POOL_SUM) * 100).toFixed(1);
  const dim = weight === 0 ? "opacity-50" : "";
  return (
    <>
      <td className="py-0.5 px-1 text-right">
        <WeightInput onCommit={onCommit} value={weight} />
      </td>
      <td
        className={`py-0.5 px-1 text-right font-mono text-xs text-text-secondary tabular-nums ${dim}`}
      >
        {percent}%
      </td>
    </>
  );
}

function WeightInput({ value, onCommit }: { value: number; onCommit: (n: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  // When a parent action (balance, revert, save) changes the authoritative
  // value, drop any in-progress draft so the displayed number matches state.
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(null);
  }
  const display = draft ?? String(value);

  function commit() {
    if (draft === null) return;
    const parsed = Number.parseInt(draft, 10);
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 0xffff) {
      onCommit(parsed);
    }
    setDraft(null);
  }

  return (
    <input
      className="py-0.5 px-1 text-sm font-mono tabular-nums text-right bg-bg-surface border border-border-subtle rounded w-14 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold"
      inputMode="numeric"
      onBlur={commit}
      onChange={(e) => {
        const cleaned = e.currentTarget.value.replace(/[^\d]/g, "");
        setDraft(cleaned);
        if (cleaned === "") return;
        const parsed = Number.parseInt(cleaned, 10);
        if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 0xffff) {
          onCommit(parsed);
        }
      }}
      onFocus={(e) => e.currentTarget.select()}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        else if (e.key === "Escape") {
          setDraft(null);
          e.currentTarget.blur();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          moveWeightFocus(e.currentTarget, "down");
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          moveWeightFocus(e.currentTarget, "up");
        }
      }}
      value={display}
    />
  );
}

/** Moves keyboard focus from this weight input to the same column in the
 *  previous/next table row. Uses DOM traversal (instead of ref plumbing)
 *  because the table is large and virtualizing ref maps would be fragile. */
function moveWeightFocus(el: HTMLInputElement, dir: "up" | "down") {
  const td = el.closest("td");
  const tr = td?.parentElement;
  if (!td || !tr) return;
  const cellIdx = Array.prototype.indexOf.call(tr.children, td);
  const neighborTr = dir === "down" ? tr.nextElementSibling : tr.previousElementSibling;
  const neighborTd = neighborTr?.children[cellIdx] as HTMLElement | undefined;
  const neighborInput = neighborTd?.querySelector("input") as HTMLInputElement | null;
  neighborInput?.focus();
}

import { useSetAtom } from "jotai";
import { memo, useState } from "react";
import type { CardSpec } from "../../../../engine/data/card-model.ts";
import { CardName } from "../../../components/CardName.tsx";
import { cardTypeBorderColor } from "../../../components/card-entries.ts";
import { formatCardId } from "../../../lib/format.ts";
import { POOL_SUM, setWeightAtom } from "./atoms.ts";

type Props = {
  cardId: number;
  card: CardSpec | undefined;
  weight: number;
  pinned: boolean;
  modified: boolean;
  /** Called when the user toggles this row's pin checkbox.
   *  `desired` is what the click intends (true = become pinned, false = unpin).
   *  `shiftKey` is the native shift-key state at click time, so the parent can
   *  apply the desired state to every row between this and the last anchor. */
  onTogglePin: (cardId: number, desired: boolean, shiftKey: boolean) => void;
};

export const DropPoolRow = memo(DropPoolRowImpl);

function DropPoolRowImpl({ cardId, card, weight, pinned, modified, onTogglePin }: Props) {
  const setWeight = useSetAtom(setWeightAtom);
  const isMonster = card?.isMonster ?? false;
  const borderColor = cardTypeBorderColor(card?.cardType, isMonster);
  const percent = ((weight / POOL_SUM) * 100).toFixed(1);

  return (
    <tr
      className={`border-t border-border-subtle/50 transition-colors duration-150 hover:bg-bg-hover even:bg-bg-surface/30 ${
        weight === 0 ? "opacity-60" : ""
      } ${modified ? "bg-stat-up/5!" : ""}`}
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <td className="py-0.5 px-1 text-center">
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
      <td className="py-0.5 px-2 text-right font-mono font-bold text-stat-atk tabular-nums">
        {isMonster ? card?.attack : ""}
      </td>
      <td className="py-0.5 px-2 text-right font-mono text-xs text-stat-def tabular-nums">
        {isMonster ? card?.defense : ""}
      </td>
      <td className="py-0.5 px-2 text-right">
        <WeightInput onCommit={(n) => setWeight({ cardId, weight: n })} value={weight} />
      </td>
      <td className="py-0.5 px-2 text-right font-mono text-xs text-text-secondary tabular-nums">
        {percent}%
      </td>
    </tr>
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
      className="py-0.5 px-1.5 text-sm font-mono tabular-nums text-right bg-bg-surface border border-border-subtle rounded w-16 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold"
      inputMode="numeric"
      onBlur={commit}
      onChange={(e) => setDraft(e.currentTarget.value.replace(/[^\d]/g, ""))}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          setDraft(null);
          e.currentTarget.blur();
        }
      }}
      value={display}
    />
  );
}

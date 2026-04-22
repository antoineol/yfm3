import { useSetAtom } from "jotai";
import { memo } from "react";
import type { BridgeCard } from "../../../engine/worker/messages.ts";
import { CardName } from "../../components/CardName.tsx";
import { setQuantityAtom } from "./atoms.ts";
import { QuantityStepper } from "./QuantityStepper.tsx";

type LedgerRowProps = {
  index: number;
  quantity: number;
  totalOwned: number;
  modified: boolean;
  card: BridgeCard | undefined;
};

export const LedgerRow = memo(LedgerRowImpl);

function LedgerRowImpl({ index, quantity, totalOwned, modified, card }: LedgerRowProps) {
  const setQuantity = useSetAtom(setQuantityAtom);
  const owned = totalOwned > 0;
  const displayId = card ? String(card.id).padStart(3, "0") : String(index + 1).padStart(3, "0");

  return (
    <div
      className={`grid grid-cols-[56px_minmax(0,1fr)_auto] gap-3 items-center px-3 py-1.5 border-b border-border-subtle/40 hover:bg-bg-hover/60 transition-colors ${
        owned ? "" : "opacity-70"
      }`}
    >
      <div className="flex items-center gap-1 font-mono text-xs text-text-secondary tabular-nums">
        {modified && (
          <span className="size-1.5 rounded-full bg-stat-up shrink-0" title="Modified" />
        )}
        <span>{displayId}</span>
      </div>
      <div className="min-w-0">
        {card ? (
          <CardName
            cardId={card.id}
            className={`text-sm ${owned ? "text-text-primary" : "text-text-secondary italic"}`}
            name={card.name}
          />
        ) : (
          <span className="text-sm text-text-secondary italic">(unknown card)</span>
        )}
      </div>
      <div className="flex justify-end">
        <QuantityStepper onChange={(n) => setQuantity({ index, quantity: n })} value={quantity} />
      </div>
    </div>
  );
}

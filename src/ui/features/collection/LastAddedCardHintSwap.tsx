import type { RefObject } from "react";
import { Button } from "../../components/Button.tsx";
import { CardName } from "../../components/CardName.tsx";
import type { LastAddedCardHintSwapModel } from "./use-last-added-card-hint.ts";

export function LastAddedCardHintSwap({
  inputRef,
  swap,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  swap: LastAddedCardHintSwapModel;
}) {
  const focusInput = () => inputRef.current?.focus();
  if (swap.kind === "idle") return null;

  if (swap.kind === "loading") {
    return <div className="text-text-secondary">Checking deck upgrade...</div>;
  }

  if (swap.kind === "applied") {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="text-text-secondary">Deck swap applied.</p>
        <Button
          disabled={swap.applying}
          onClick={() => {
            swap.onRevert();
            focusInput();
          }}
          size="sm"
          variant="outline"
        >
          Revert
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-text-secondary">
        Upgrade deck: swap out{" "}
        <span className="text-text-muted font-mono text-xs">#{swap.removedCardId}</span>{" "}
        <CardName
          cardId={swap.removedCardId}
          className="text-text-primary font-medium"
          name={swap.removedName}
        />{" "}
        for <span className="text-text-muted font-mono text-xs">#{swap.addedCardId}</span>{" "}
        <CardName
          cardId={swap.addedCardId}
          className="text-text-primary font-medium"
          name={swap.addedName}
        />{" "}
        <span className="font-mono text-stat-up">{`(+${swap.improvement.toFixed(1)} ATK)`}</span>
      </p>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          disabled={swap.applying}
          onClick={() => {
            swap.onReject();
            focusInput();
          }}
          size="sm"
          variant="ghost"
        >
          Reject
        </Button>
        <Button
          disabled={swap.applying}
          onClick={() => {
            swap.onApply();
            focusInput();
          }}
          size="sm"
          variant="outline"
        >
          Apply swap
        </Button>
      </div>
    </div>
  );
}

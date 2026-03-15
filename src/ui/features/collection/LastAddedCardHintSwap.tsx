import { Button } from "../../components/Button.tsx";
import type { LastAddedCardHintSwapModel } from "./use-last-added-card-hint.ts";

export function LastAddedCardHintSwap({ swap }: { swap: LastAddedCardHintSwapModel }) {
  if (swap.kind === "idle") return null;

  if (swap.kind === "loading") {
    return <div className="text-text-secondary">Checking deck upgrade...</div>;
  }

  if (swap.kind === "applied") {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="text-text-secondary">Deck swap applied.</p>
        <Button disabled={swap.applying} onClick={swap.onRevert} size="sm" variant="outline">
          Revert
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-text-secondary">
        Upgrade deck: swap out{" "}
        <span className="text-text-primary font-medium">{swap.removedName}</span> for{" "}
        <span className="text-text-primary font-medium">{swap.addedName}</span>{" "}
        <span className="font-mono text-stat-up">{`(+${swap.improvement.toFixed(1)} ATK)`}</span>
      </p>
      <div className="flex items-center gap-1 shrink-0">
        <Button disabled={swap.applying} onClick={swap.onReject} size="sm" variant="ghost">
          Reject
        </Button>
        <Button disabled={swap.applying} onClick={swap.onApply} size="sm" variant="outline">
          Apply swap
        </Button>
      </div>
    </div>
  );
}

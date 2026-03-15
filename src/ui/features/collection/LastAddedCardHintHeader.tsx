import { CardActionButton } from "../../components/CardActionButton.tsx";
import type { LastAddedCardHintHeaderModel } from "./use-last-added-card-hint.ts";

export function LastAddedCardHintHeader({ header }: { header: LastAddedCardHintHeaderModel }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-text-secondary">Last added:</span>
      <span className="text-text-primary font-medium truncate">{header.name}</span>
      <span className="text-text-muted font-mono">({header.totalOwned}/3)</span>
      <div className="flex items-center gap-0.5 ml-auto shrink-0">
        <CardActionButton
          disabled={header.disableAdd}
          onClick={header.onAdd}
          title="Add another copy"
          variant="add"
        >
          +
        </CardActionButton>
        <CardActionButton
          disabled={header.disableRemove}
          onClick={header.onRemove}
          title="Remove one copy"
          variant="remove"
        >
          −
        </CardActionButton>
        <CardActionButton onClick={header.onDismiss} title="Dismiss" variant="dismiss">
          ×
        </CardActionButton>
      </div>
    </div>
  );
}

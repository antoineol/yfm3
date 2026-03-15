import { LastAddedCardHintHeader } from "./LastAddedCardHintHeader.tsx";
import { LastAddedCardHintSwap } from "./LastAddedCardHintSwap.tsx";
import { useLastAddedCardHint } from "./use-last-added-card-hint.ts";

export function LastAddedCardHint() {
  const hint = useLastAddedCardHint();

  if (!hint) return null;

  return (
    <div className="flex flex-col gap-2 px-2 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-xs">
      <LastAddedCardHintHeader header={hint.header} />
      <LastAddedCardHintSwap swap={hint.swap} />
    </div>
  );
}

import type { RefObject } from "react";
import { LastAddedCardHintHeader } from "./LastAddedCardHintHeader.tsx";
import { LastAddedCardHintSwap } from "./LastAddedCardHintSwap.tsx";
import { useLastAddedCardHint } from "./use-last-added-card-hint.ts";

export function LastAddedCardHint({ inputRef }: { inputRef: RefObject<HTMLInputElement | null> }) {
  const hint = useLastAddedCardHint();

  if (!hint) return null;

  return (
    <div className="flex flex-col gap-2 px-2 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-xs">
      <LastAddedCardHintHeader header={hint.header} inputRef={inputRef} />
      <LastAddedCardHintSwap swap={hint.swap} />
    </div>
  );
}

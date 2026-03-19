import type { RefObject } from "react";
import { LastAddedCardHintHeader } from "./LastAddedCardHintHeader.tsx";
import { LastAddedCardHintSwap } from "./LastAddedCardHintSwap.tsx";
import { useLastAddedCardHint } from "./use-last-added-card-hint.ts";

export function LastAddedCardHint({
  comboboxOpen,
  inputRef,
}: {
  comboboxOpen: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const hint = useLastAddedCardHint();

  if (!hint) return null;

  return (
    <div className="flex flex-col gap-2 px-2 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-xs">
      <LastAddedCardHintHeader
        comboboxOpen={comboboxOpen}
        header={hint.header}
        inputRef={inputRef}
      />
      <LastAddedCardHintSwap inputRef={inputRef} swap={hint.swap} />
    </div>
  );
}

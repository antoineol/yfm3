import type { RefObject } from "react";
import { useEffect } from "react";
import { CardActionButton } from "../../components/CardActionButton.tsx";
import { CardName } from "../../components/CardName.tsx";
import type { LastAddedCardHintHeaderModel } from "./use-last-added-card-hint.ts";

export function LastAddedCardHintHeader({
  comboboxOpen,
  header,
  inputRef,
}: {
  comboboxOpen: boolean;
  header: LastAddedCardHintHeaderModel;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const focusInput = () => inputRef.current?.focus();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "+" && !header.disableAdd) {
        e.preventDefault();
        header.onAdd();
        inputRef.current?.focus();
      } else if (
        e.key === "-" &&
        !header.disableRemove &&
        (e.target as HTMLElement)?.tagName !== "INPUT"
      ) {
        e.preventDefault();
        header.onRemove();
        inputRef.current?.focus();
      } else if (e.key === "Escape" && !comboboxOpen) {
        e.preventDefault();
        header.onDismiss();
        inputRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [comboboxOpen, header, inputRef]);

  return (
    <div className="flex items-center gap-1">
      <span className="text-text-secondary">Last added:</span>
      <span className="text-text-muted font-mono text-xs">#{header.id}</span>
      <CardName
        cardId={header.id}
        className="text-text-primary font-medium truncate"
        name={header.name}
      />
      {header.isMonster && (
        <span className="text-text-muted font-mono">
          {header.attack}/{header.defense}
        </span>
      )}
      <span className="text-text-muted font-mono">({header.totalOwned}/3)</span>
      <div className="flex items-center gap-0.5 ml-auto shrink-0">
        <CardActionButton
          disabled={header.disableAdd}
          onClick={() => {
            header.onAdd();
            focusInput();
          }}
          title="Add another copy (+)"
          variant="add"
        >
          +
        </CardActionButton>
        <CardActionButton
          disabled={header.disableRemove}
          onClick={() => {
            header.onRemove();
            focusInput();
          }}
          title="Remove one copy (-)"
          variant="remove"
        >
          −
        </CardActionButton>
        <CardActionButton
          onClick={() => {
            header.onDismiss();
            focusInput();
          }}
          title="Dismiss (Esc)"
          variant="dismiss"
        >
          ×
        </CardActionButton>
      </div>
    </div>
  );
}

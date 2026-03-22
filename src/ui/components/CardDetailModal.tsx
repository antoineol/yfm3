import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { useEffect } from "react";
import type { CardSpec } from "../../engine/data/card-model.ts";
import { useCardDb } from "../lib/card-db-context.tsx";
import { useCardDetail } from "../lib/card-detail-context.tsx";
import { CardDetailBody } from "./CardDetail.tsx";
import { CloseButton } from "./CloseButton.tsx";
import { IconButton } from "./IconButton.tsx";

export function CardDetailModal() {
  const { cardId, closeCard } = useCardDetail();
  const { cardsById } = useCardDb();
  const card = cardId ? cardsById.get(cardId) : undefined;
  const isOpen = cardId !== null;
  useBackClose(isOpen, closeCard);

  return (
    <BaseDialog.Root onOpenChange={(v) => !v && closeCard()} open={isOpen}>
      <BaseDialog.Portal keepMounted>
        <BaseDialog.Backdrop className="fm-modal-backdrop fixed inset-0 z-50" />
        <BaseDialog.Popup className="fm-modal-popup fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-bg-panel border border-border-accent rounded-xl w-[calc(100vw-2rem)] max-w-3xl max-h-[calc(100vh-2rem)] overflow-y-auto focus:outline-none">
          {card && <CardDetailContent card={card} />}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

const BACK_CLOSE_KEY = "cardDetailModal";

/** Clean up orphaned history entry left by a page refresh while the modal was open. */
if (typeof window !== "undefined" && (history.state as Record<string, unknown>)?.[BACK_CLOSE_KEY]) {
  history.back();
}

/** Push a history entry while `isOpen` is true so the hardware back button calls `onClose`. */
function useBackClose(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;

    history.pushState({ [BACK_CLOSE_KEY]: true }, "");
    let closedByBack = false;

    const onPopState = () => {
      closedByBack = true;
      onClose();
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      // Closed via UI (backdrop / close button / Escape) — remove the history entry we pushed.
      if (!closedByBack) history.back();
    };
  }, [isOpen, onClose]);
}

function CardDetailContent({ card }: { card: CardSpec }) {
  return (
    <CardDetailBody
      card={card}
      footer={
        <div className="flex justify-end pt-1 lg:hidden">
          <BaseDialog.Close className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-bg-surface/60 px-3.5 py-2 text-xs font-medium text-text-muted transition-colors duration-150 hover:border-gold/40 hover:text-gold active:scale-[0.97] focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none">
            <svg
              aria-hidden="true"
              className="size-3.5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
            Close
          </BaseDialog.Close>
        </div>
      }
      header={
        <div className="flex items-start justify-between gap-2">
          <BaseDialog.Title className="font-display text-base sm:text-lg font-bold text-gold leading-tight">
            {card.name}
            <span className="ml-2 align-middle text-[11px] font-mono font-normal text-text-muted/50">
              #{card.id}
            </span>
          </BaseDialog.Title>
          <div className="flex items-center gap-1">
            <IconButton
              label="Open in new tab"
              onClick={() =>
                window.open(`${window.location.pathname}#data/cards/${card.id}`, "_blank")
              }
            >
              <svg
                aria-hidden="true"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" x2="21" y1="14" y2="3" />
              </svg>
            </IconButton>
            <span className="hidden lg:inline">
              <BaseDialog.Close render={<CloseButton label="Close" />} />
            </span>
          </div>
        </div>
      }
    />
  );
}

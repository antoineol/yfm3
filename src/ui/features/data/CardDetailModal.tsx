import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { useEffect, useRef } from "react";
import type { CardSpec } from "../../../engine/data/card-model.ts";
import { CloseButton } from "../../components/CloseButton.tsx";
import { IconButton } from "../../components/IconButton.tsx";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { useCardDetail } from "../../lib/card-detail-context.tsx";
import { CardDetailBody } from "./CardDetail.tsx";

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
        <BaseDialog.Popup className="fm-modal-popup fixed inset-0 z-50 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-3xl sm:max-h-[calc(100dvh-3rem)] bg-bg-panel sm:rounded-xl sm:border sm:border-border-accent flex flex-col focus:outline-none">
          <div className="flex-1 overflow-y-auto min-h-0">
            {card && <CardDetailContent card={card} />}
          </div>
          {card && <MobileCloseFooter />}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

/**
 * Intercept the hardware back button while `isOpen` and call `onClose`
 * instead of navigating.
 *
 * Pushes a sentinel history entry when the modal opens so that pressing
 * back only pops the sentinel — real history entries are never consumed.
 * When the modal is closed by other means (X button, backdrop), the
 * sentinel is removed programmatically.
 */
function useBackClose(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    // Push a sentinel so "back" pops it instead of a real entry.
    history.pushState({ modalSentinel: true }, "");

    let closedByBack = false;

    const onPopState = () => {
      closedByBack = true;
      onCloseRef.current();
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
      // Modal closed by UI (not back button) — remove the sentinel.
      if (!closedByBack) {
        history.back();
      }
    };
  }, [isOpen]);
}

function MobileCloseFooter() {
  return (
    <div className="flex justify-end border-t border-border-subtle p-3 sm:hidden">
      <BaseDialog.Close className="flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-surface/60 px-4 py-2.5 text-sm font-medium text-text-muted transition-colors duration-150 hover:border-gold/40 hover:text-gold active:scale-[0.97] focus-visible:ring-1 focus-visible:ring-gold focus-visible:outline-none">
        <svg
          aria-hidden="true"
          className="size-4"
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
  );
}

function CardDetailContent({ card }: { card: CardSpec }) {
  return (
    <CardDetailBody
      card={card}
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
            <span className="hidden sm:inline">
              <BaseDialog.Close render={<CloseButton label="Close" />} />
            </span>
          </div>
        </div>
      }
    />
  );
}

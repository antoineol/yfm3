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

  useEffect(() => {
    if (!isOpen) return;
    history.pushState({ cardDetailOpen: true }, "");
    const onPopState = () => closeCard();
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      // If modal closes programmatically (not via back button), remove the history entry
      if (history.state?.cardDetailOpen) history.back();
    };
  }, [isOpen, closeCard]);

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

function CardDetailContent({ card }: { card: CardSpec }) {
  return (
    <CardDetailBody
      card={card}
      header={
        <div className="flex items-start justify-between gap-2">
          <BaseDialog.Title className="font-display text-base sm:text-lg font-bold text-gold leading-tight">
            {card.name}
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
            <BaseDialog.Close render={<CloseButton label="Close" />} />
          </div>
        </div>
      }
    />
  );
}

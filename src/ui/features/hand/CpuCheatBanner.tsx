import { useEffect, useRef, useState } from "react";
import type { CardId } from "../../../engine/data/card-model.ts";
import { CardName } from "../../components/CardName.tsx";
import { CloseButton } from "../../components/CloseButton.tsx";
import { useCheatMode } from "../../db/use-user-preferences.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { artworkSrc } from "../../lib/format.ts";
import { useSelectedMod } from "../../lib/use-selected-mod.ts";

/**
 * Banner that appears when the CPU AI swaps cards in its hand.
 * Visible on both Player/Opponent tabs while cheat mode is enabled.
 * Auto-dismisses when the player's turn starts; manually dismissable via X.
 * Uses the same grid-template-rows animation pattern as CheatViewSwitch.
 */
export function CpuCheatBanner() {
  const { cpuSwaps, phase } = useBridge();
  const cheatMode = useCheatMode();
  const [manuallyDismissed, setManuallyDismissed] = useState(false);

  // Auto-dismiss when phase leaves "opponent" (player's turn starts)
  const prevPhaseRef = useRef(phase);
  useEffect(() => {
    if (prevPhaseRef.current !== "opponent" && phase === "opponent") {
      setManuallyDismissed(true);
    }
    prevPhaseRef.current = phase;
  }, [phase]);

  // Reset dismiss state when new swaps arrive
  const swapCount = cpuSwaps.length;
  const prevSwapCountRef = useRef(swapCount);
  useEffect(() => {
    if (swapCount > prevSwapCountRef.current) {
      setManuallyDismissed(false);
    }
    prevSwapCountRef.current = swapCount;
  }, [swapCount]);

  const hasSwaps = cheatMode && cpuSwaps.length > 0 && !manuallyDismissed;

  return (
    <div className={`fm-cheat-banner-wrap ${hasSwaps ? "fm-cheat-banner-wrap--open" : ""}`}>
      <div>
        <aside aria-label="CPU cheat detected" className="fm-cheat-banner">
          <img
            alt=""
            className="fm-cheat-banner-portrait"
            src="/images/cheat-mode/opponent-cheated.webp"
          />
          <div className="fm-cheat-banner-body">
            <header className="fm-cheat-banner-header">
              <span className="fm-cheat-banner-tag">Cheat Detected</span>
              <CloseButton label="Dismiss" onClick={() => setManuallyDismissed(true)} size="sm" />
            </header>
            <ul className="fm-cheat-banner-list">
              {cpuSwaps.map((swap) => (
                <SwapEntry key={swapKey(swap)} swap={swap} />
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SwapEntry({
  swap,
}: {
  swap: { fromCardId: number; toCardId: number; slotIndex: number; timestamp: number };
}) {
  const { cardsById } = useCardDb();
  const modId = useSelectedMod();
  const from = cardsById.get(swap.fromCardId);
  const to = cardsById.get(swap.toCardId);

  return (
    <li className="fm-cheat-banner-swap">
      <div className="fm-cheat-banner-cards">
        <img
          alt={from?.name ?? `#${String(swap.fromCardId)}`}
          className="fm-cheat-banner-thumb"
          src={artworkSrc(modId, swap.fromCardId)}
        />
        <span className="fm-cheat-banner-arrow" />
        <img
          alt={to?.name ?? `#${String(swap.toCardId)}`}
          className="fm-cheat-banner-thumb"
          src={artworkSrc(modId, swap.toCardId)}
        />
        <span className="fm-cheat-banner-text">
          <CardName
            cardId={swap.fromCardId as CardId}
            className="fm-cheat-banner-name"
            name={from?.name ?? `Card #${String(swap.fromCardId)}`}
          />
          {" swapped with "}
          <CardName
            cardId={swap.toCardId as CardId}
            className="fm-cheat-banner-name"
            name={to?.name ?? `Card #${String(swap.toCardId)}`}
          />
        </span>
      </div>
    </li>
  );
}

function swapKey(s: { slotIndex: number; timestamp: number }): string {
  return `${String(s.slotIndex)}-${String(s.timestamp)}`;
}

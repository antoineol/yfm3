import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "../../../../convex/_generated/api";
import type { CardId } from "../../../engine/data/card-model.ts";
import { CardName } from "../../components/CardName.tsx";
import { CloseButton } from "../../components/CloseButton.tsx";
import { useCheatMode, useCpuSwaps } from "../../db/use-user-preferences.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { artworkSrc } from "../../lib/format.ts";
import { useSelectedMod } from "../../lib/use-selected-mod.ts";

/**
 * Banner that appears when the CPU AI swaps cards in its hand.
 * Visible on both Player/Opponent tabs while cheat mode is enabled.
 * Auto-dismisses (clears Convex) when the player's turn starts.
 * Manually dismissable via X button.
 */
export function CpuCheatBanner() {
  const { phase } = useBridge();
  const cpuSwaps = useCpuSwaps();
  const cheatMode = useCheatMode();
  const clearCpuSwaps = useMutation(api.userSettings.clearCpuSwaps);

  // Auto-dismiss when phase transitions to "opponent" (player's turn ends)
  const prevPhaseRef = useRef(phase);
  useEffect(() => {
    if (prevPhaseRef.current !== "opponent" && phase === "opponent") {
      void clearCpuSwaps();
    }
    prevPhaseRef.current = phase;
  }, [phase, clearCpuSwaps]);

  const hasSwaps = cheatMode && cpuSwaps.length > 0;

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
              <CloseButton label="Dismiss" onClick={() => void clearCpuSwaps()} size="sm" />
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

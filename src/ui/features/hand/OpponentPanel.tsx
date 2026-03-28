import { useMemo } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
import { HAND_SIZE } from "../../../engine/types/constants.ts";
import { MiniGameCard } from "../../components/MiniGameCard.tsx";
import { SectionLabel } from "../../components/panel-chrome.tsx";
import type { HandCard } from "../../db/use-hand.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { FieldDisplay } from "./FieldDisplay.tsx";
import { FusionResultsList } from "./FusionResultsList.tsx";
import { useZoneToggle } from "./use-zone-toggle.ts";
import { ZonePanel } from "./ZonePanel.tsx";

/**
 * Opponent view — mirrors the player's layout (3D zone arena when synced,
 * flat sections when manual). Inherits purple theme from `.fm-opponent-theme`.
 * Best plays are always visible (not phase-gated).
 */
export function OpponentPanel() {
  const bridge = useBridge();
  const isSynced = bridge.status === "connected" && bridge.inDuel;
  const isWaitingForDuel = bridge.status === "connected" && !bridge.inDuel;

  const opponentHand = bridge.opponentHand;
  const opponentField = bridge.opponentField;

  // Fake HandCard objects — docIds are never accessed (no onPlayFusion).
  const fakeHandCards: HandCard[] = useMemo(
    () =>
      opponentHand.map((cardId, i) => ({
        docId: `opponent-${String(i)}` as Id<"hand">,
        cardId,
      })),
    [opponentHand],
  );

  const { focusedZone, animatedSetZone } = useZoneToggle(isSynced, bridge.phase);

  return (
    <>
      {/* ── Synced mode: 3D arena (same as player) ── */}
      {isSynced && (
        <div className="fm-zone-arena">
          {(focusedZone === "hand"
            ? (["hand", "field"] as const)
            : (["field", "hand"] as const)
          ).map((zone) => (
            <div className="fm-zone-slot" key={zone} style={{ viewTransitionName: `${zone}-zone` }}>
              {zone === "hand" ? (
                <ZonePanel
                  active={focusedZone === "hand"}
                  count={opponentHand.length}
                  label="Hand"
                  maxCount={HAND_SIZE}
                >
                  <OpponentCardGrid cardIds={opponentHand} />
                </ZonePanel>
              ) : (
                <ZonePanel
                  active={focusedZone === "field"}
                  count={opponentField.length}
                  label="Field"
                  maxCount={5}
                >
                  <FieldDisplay cards={opponentField} />
                </ZonePanel>
              )}
              {focusedZone !== zone && (
                <button
                  aria-label={`Switch to ${zone}`}
                  className="fm-zone-focus-btn"
                  onClick={() => animatedSetZone(zone)}
                  type="button"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Manual mode: flat sections (same as player) ── */}
      {!isSynced && !isWaitingForDuel && (
        <>
          <section>
            <div className="flex items-center justify-between mb-2">
              <SectionLabel>
                Opponent Hand
                <span className="text-text-muted font-body font-normal ml-1.5">
                  ({String(opponentHand.length)}/{String(HAND_SIZE)})
                </span>
              </SectionLabel>
            </div>
            <OpponentCardGrid cardIds={opponentHand} />
          </section>

          {opponentField.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <SectionLabel>
                  Opponent Field
                  <span className="text-text-muted font-body font-normal ml-1.5">
                    ({String(opponentField.length)}/5)
                  </span>
                </SectionLabel>
              </div>
              <FieldDisplay cards={opponentField} />
            </section>
          )}
        </>
      )}

      {/* ── Best plays (always visible — not phase-gated like player) ── */}
      {!isWaitingForDuel && (
        <section>
          {!isSynced && (
            <div className="mb-1">
              <SectionLabel>Best Plays</SectionLabel>
            </div>
          )}
          <FusionResultsList fieldCards={opponentField} handCards={fakeHandCards} />
        </section>
      )}
    </>
  );
}

// ── Opponent card grid (no Convex docIds needed) ──────────────────

function OpponentCardGrid({ cardIds }: { cardIds: number[] }) {
  const { cardsById } = useCardDb();
  const slots = Array.from({ length: 5 }, (_, i) => cardIds[i] ?? null);

  return (
    <ul aria-label="Opponent's hand" className="grid grid-cols-5 gap-2 sm:gap-3 list-none p-0 m-0">
      {slots.map((cardId, i) => {
        const card = cardId != null ? cardsById.get(cardId) : undefined;
        return card ? (
          <li key={`opp-${String(i)}-${String(cardId)}`}>
            <MiniGameCard card={card} />
          </li>
        ) : (
          <li className="fm-mini-empty" key={`opp-empty-${String(i)}`}>
            <span className="text-text-muted/30 text-xs font-mono">{i + 1}</span>
          </li>
        );
      })}
    </ul>
  );
}

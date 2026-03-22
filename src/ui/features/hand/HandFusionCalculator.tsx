import { useCallback, useEffect, useRef, useState } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { FusionChainResult } from "../../../engine/fusion-chain-finder.ts";
import { HAND_SIZE } from "../../../engine/types/constants.ts";
import { PanelLoadingState, SectionLabel } from "../../components/panel-chrome.tsx";
import { ToggleGroup } from "../../components/ToggleGroup.tsx";
import { useDeck } from "../../db/use-deck.ts";
import { useHand, useHandMutations } from "../../db/use-hand.ts";
import { useUpdatePreferences } from "../../db/use-update-preferences.ts";
import {
  type HandSourceMode,
  useFusionDepth,
  useHandSourceMode,
} from "../../db/use-user-preferences.ts";
import type { DuelStats, EmulatorBridge, FieldCard } from "../../lib/use-emulator-bridge.ts";
import { EmulatorBridgeBar } from "./EmulatorBridgeBar.tsx";
import { FieldDisplay } from "./FieldDisplay.tsx";
import { FusionResultsList } from "./FusionResultsList.tsx";
import { HandCardSelector } from "./HandCardSelector.tsx";
import { HandDisplay } from "./HandDisplay.tsx";
import { PostDuelSuggestion } from "./PostDuelSuggestion.tsx";
import { useAutoSyncHand } from "./use-auto-sync-hand.ts";
import { usePostDuelSuggestion } from "./use-post-duel-suggestion.ts";

const SOURCE_OPTIONS: { value: HandSourceMode; label: string }[] = [
  { value: "all", label: "All cards" },
  { value: "deck", label: "Deck only" },
];

type FocusedZone = "hand" | "field";

/** Only phases where the player is actively deciding — show fusions here, hide everywhere else. */
const SHOW_FUSIONS_PHASES = new Set(["hand", "draw"]);

export function HandFusionCalculator({ bridge }: { bridge: EmulatorBridge }) {
  const hand = useHand();
  const deck = useDeck();
  const fusionDepth = useFusionDepth();
  const sourceMode = useHandSourceMode();
  const updatePreferences = useUpdatePreferences();
  const { addToHand, removeFromHand, removeMultipleFromHand, clearHand } = useHandMutations();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pendingFocusRef = useRef(false);

  // Auto-sync hand from bridge (always active, even when bar is hidden)
  useAutoSyncHand(bridge, hand ?? []);
  const deckCardIds = deck?.map((d) => d.cardId);
  const postDuel = usePostDuelSuggestion(bridge, deckCardIds);

  const isSynced = bridge.status === "connected" && bridge.inDuel;

  // ── Manual mode field (populated when user clicks "Play") ─────
  const [manualField, setManualField] = useState<FieldCard[]>([]);

  // ── Zone toggle (hand/field, synced mode only) ───────────────
  const [focusedZone, setFocusedZone] = useState<FocusedZone>("hand");

  useEffect(() => {
    if (!isSynced) {
      setFocusedZone("hand");
      return;
    }
    // Auto-switch based on game phase:
    // hand/draw → hand expanded (player is deciding)
    // fusion/field/battle/opponent → field expanded (action is on the board)
    // other → keep current (transitional, don't flicker)
    if (bridge.phase === "hand" || bridge.phase === "draw") {
      setFocusedZone("hand");
    } else if (bridge.phase !== "other") {
      setFocusedZone("field");
    }
  }, [bridge.phase, isSynced]);

  // ── Manual mode input focus management ───────────────────────

  const handLength = hand?.length ?? 0;
  useEffect(() => {
    if (handLength >= HAND_SIZE) {
      inputRef.current?.blur();
    } else if (pendingFocusRef.current) {
      pendingFocusRef.current = false;
      inputRef.current?.focus();
    }
  }, [handLength]);

  const requestInputFocus = useCallback(() => {
    inputRef.current?.focus();
    pendingFocusRef.current = true;
  }, []);

  const handlePlayFusion = useCallback(
    (materialDocIds: Id<"hand">[], result: FusionChainResult) => {
      if (materialDocIds.length > 0) {
        void removeMultipleFromHand({ ids: materialDocIds });
      }
      // Remove consumed field cards
      if (result.fieldMaterialCardIds.length > 0) {
        setManualField((prev) => {
          const next = [...prev];
          for (const fieldCardId of result.fieldMaterialCardIds) {
            const idx = next.findIndex((fc) => fc.cardId === fieldCardId);
            if (idx >= 0) next.splice(idx, 1);
          }
          return next;
        });
      }
      // Add fusion result to field
      setManualField((prev) => [
        ...prev,
        { cardId: result.resultCardId, atk: result.resultAtk, def: result.resultDef },
      ]);
      requestInputFocus();
    },
    [removeMultipleFromHand, requestInputFocus],
  );

  const handleSourceModeChange = useCallback(
    (value: HandSourceMode) => {
      if (value === sourceMode) return;
      updatePreferences({ handSourceMode: value });
      requestInputFocus();
    },
    [sourceMode, updatePreferences, requestInputFocus],
  );

  if (hand === undefined) return <PanelLoadingState />;

  const isWaitingForDuel = bridge.status === "connected" && !bridge.inDuel;
  const hasPostDuelContent =
    postDuel.state === "optimizing" ||
    postDuel.state === "result" ||
    postDuel.state === "no_change";
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-3">
      {/* ── Bridge status bar (only when connected) ── */}
      {bridge.status === "connected" && <EmulatorBridgeBar bridge={bridge} />}

      {/* ── Post-duel suggestion (shown even while inDuel is stale) ── */}
      {hasPostDuelContent && <PostDuelSuggestion suggestion={postDuel} />}

      {/* ── Waiting for duel / duel ended (only when no post-duel content) ── */}
      {isWaitingForDuel &&
        !hasPostDuelContent &&
        (bridge.phase === "ended" ? (
          <DuelEnded lp={bridge.lp} stats={bridge.stats} />
        ) : (
          <WaitingForDuel />
        ))}

      {/* ── Manual controls (only when bridge is not connected) ── */}
      {bridge.status !== "connected" && (
        <div className="flex flex-col gap-2">
          <ToggleGroup
            onChange={handleSourceModeChange}
            options={SOURCE_OPTIONS}
            value={sourceMode}
          />
          <HandCardSelector
            deckCardIds={deckCardIds}
            handSize={hand.length}
            inputRef={inputRef}
            onSelect={(card) => void addToHand({ cardId: card.id })}
            sourceMode={sourceMode}
          />
        </div>
      )}

      {/* ── Synced mode: 3D arena with both zones always visible ── */}
      {isSynced && (
        <div className="fm-zone-arena">
          <ZonePanel
            active={focusedZone === "field"}
            count={bridge.field.length}
            label="Field"
            maxCount={5}
            onFocus={() => setFocusedZone("field")}
            zone="field"
          >
            <FieldDisplay cards={bridge.field} />
          </ZonePanel>

          <ZonePanel
            active={focusedZone === "hand"}
            count={hand.length}
            label="Hand"
            maxCount={HAND_SIZE}
            onFocus={() => setFocusedZone("hand")}
            zone="hand"
          >
            <HandDisplay cards={hand} frozen={bridge.inDuel && !bridge.handReliable} />
          </ZonePanel>
        </div>
      )}

      {/* ── Manual mode: field section ── */}
      {!isSynced && !isWaitingForDuel && manualField.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>
              Your Field
              <span className="text-text-muted font-body font-normal ml-1.5">
                ({String(manualField.length)}/5)
              </span>
            </SectionLabel>
            <button
              className="text-xs text-text-muted hover:text-stat-atk transition-colors cursor-pointer py-2 px-3 -my-2 -mr-3 rounded-md"
              onClick={() => setManualField([])}
              type="button"
            >
              Clear field
            </button>
          </div>
          <FieldDisplay cards={manualField} />
        </section>
      )}

      {/* ── Manual mode: hand section ── */}
      {!isSynced && !isWaitingForDuel && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>
              Your Hand
              <span className="text-text-muted font-body font-normal ml-1.5">
                ({String(hand.length)}/{String(HAND_SIZE)})
              </span>
            </SectionLabel>
            {hand.length > 0 && (
              <button
                className="text-xs text-text-muted hover:text-stat-atk transition-colors cursor-pointer py-2 px-3 -my-2 -mr-3 rounded-md"
                onClick={() => {
                  void clearHand();
                  requestInputFocus();
                }}
                type="button"
              >
                Clear hand
              </button>
            )}
          </div>
          <HandDisplay
            cards={hand}
            onRemove={(docId) => {
              void removeFromHand({ id: docId });
              requestInputFocus();
            }}
          />
        </section>
      )}

      {/* ── Fusion results (only during hand/draw in synced mode, always in manual) ── */}
      {!isWaitingForDuel && (!isSynced || SHOW_FUSIONS_PHASES.has(bridge.phase)) && (
        <section>
          <div className="mb-2">
            <SectionLabel>Best Plays</SectionLabel>
          </div>
          <FusionResultsList
            fieldCards={isSynced ? bridge.field : manualField}
            fusionDepth={fusionDepth}
            handCards={hand}
            onPlayFusion={isSynced ? undefined : handlePlayFusion}
          />
        </section>
      )}
    </div>
  );
}

// ── Waiting-for-duel empty state ────────────────────────────────

function WaitingForDuel() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      {/* Five face-down card silhouettes */}
      <div className="flex gap-2">
        {["a", "b", "c", "d", "e"].map((slot) => (
          <div
            className="w-10 h-14 sm:w-12 sm:h-16 rounded border border-border-subtle/40 bg-bg-surface/60"
            key={slot}
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--color-border-subtle) 25%, transparent 25%, transparent 50%, var(--color-border-subtle) 50%, var(--color-border-subtle) 75%, transparent 75%)",
              backgroundSize: "8px 8px",
              opacity: 0.25,
            }}
          />
        ))}
      </div>
      <p className="text-text-muted text-sm">Start a duel to see your hand and fusions</p>
    </div>
  );
}

// ── Duel-ended summary ───────────────────────────────────────

function DuelEnded({ lp, stats }: { lp: [number, number] | null; stats: DuelStats | null }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <p className="text-gold font-display font-semibold tracking-wider uppercase text-sm">
        Duel complete
      </p>
      {lp && (
        <p className="text-text-muted text-xs tabular-nums">
          LP {String(lp[0])} vs {String(lp[1])}
        </p>
      )}
      {stats && stats.fusions > 0 && (
        <p className="text-text-muted/60 text-xs">
          {String(stats.fusions)} fusion{stats.fusions > 1 ? "s" : ""} performed
        </p>
      )}
    </div>
  );
}

// ── Zone panel (3D-perspective card zone) ──────────────────────

function ZonePanel({
  zone,
  active,
  label,
  count,
  maxCount,
  onFocus,
  children,
}: {
  zone: FocusedZone;
  active: boolean;
  label: string;
  count: number;
  maxCount: number;
  onFocus: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`fm-zone fm-zone--${zone} ${active ? "fm-zone--active" : "fm-zone--inactive"}`}>
      <div className="fm-zone-header">
        <span className="fm-zone-header-label">{label}</span>
        <span className="fm-zone-header-count">
          {String(count)}/{String(maxCount)}
        </span>
      </div>
      {children}
      {!active && (
        <button
          aria-label={`Switch to ${label.toLowerCase()}`}
          className="fm-zone-focus-btn"
          onClick={onFocus}
          type="button"
        />
      )}
    </div>
  );
}

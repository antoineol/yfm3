import { useCallback, useMemo } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { FusionChainResult } from "../../../engine/fusion-chain-finder.ts";
import { HAND_SIZE } from "../../../engine/types/constants.ts";
import { PanelLoadingState, SectionLabel } from "../../components/panel-chrome.tsx";
import { ToggleGroup } from "../../components/ToggleGroup.tsx";
import { useDeck } from "../../db/use-deck.ts";
import { type HandCard, useHand, useHandMutations } from "../../db/use-hand.ts";
import { useUpdatePreferences } from "../../db/use-update-preferences.ts";
import {
  type HandSourceMode,
  useCheatMode,
  useCheatView,
  useHandSourceMode,
} from "../../db/use-user-preferences.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import type { DuelStats } from "../../lib/bridge-state-interpreter.ts";
import { CheatViewSwitch } from "./CheatViewSwitch.tsx";
import { CpuCheatBanner } from "./CpuCheatBanner.tsx";
import { EmulatorBridgeBar } from "./EmulatorBridgeBar.tsx";
import { FieldDisplay } from "./FieldDisplay.tsx";
import { FusionResultsList } from "./FusionResultsList.tsx";
import { HandCardSelector } from "./HandCardSelector.tsx";
import { HandDisplay } from "./HandDisplay.tsx";
import { OpponentPanel } from "./OpponentPanel.tsx";
import { PostDuelSuggestion } from "./PostDuelSuggestion.tsx";
import { RankTracker } from "./RankTracker.tsx";
import { useAutoSyncHand } from "./use-auto-sync-hand.ts";
import { useCheatViewAutoSwitch } from "./use-cheat-view-auto-switch.ts";
import { useHandInputFocus } from "./use-hand-input-focus.ts";
import { useManualField } from "./use-manual-field.ts";
import { usePostDuelSuggestion } from "./use-post-duel-suggestion.ts";
import { useSyncCpuSwaps } from "./use-sync-cpu-swaps.ts";
import { useZoneToggle } from "./use-zone-toggle.ts";
import { ZoneArena } from "./ZoneArena.tsx";

const SOURCE_OPTIONS: { value: HandSourceMode; label: string }[] = [
  { value: "all", label: "All cards" },
  { value: "deck", label: "Deck only" },
];

/** Only phases where the player is actively deciding — show fusions here, hide everywhere else. */
const SHOW_FUSIONS_PHASES = new Set(["hand", "draw"]);

export function HandFusionCalculator() {
  const bridge = useBridge();
  const hand = useHand();
  const deck = useDeck();
  const sourceMode = useHandSourceMode();
  const cheatMode = useCheatMode();
  const cheatView = useCheatView();
  const updatePreferences = useUpdatePreferences();
  const { removeFromHand, clearHand } = useHandMutations();

  // Side-effect hooks
  useAutoSyncHand(bridge);
  useSyncCpuSwaps();
  useCheatViewAutoSwitch();

  const deckCardIds = deck?.map((d) => d.cardId);
  const postDuel = usePostDuelSuggestion(bridge, deckCardIds);
  const { manualField, clearField, playFusion } = useManualField();
  const { inputRef, requestInputFocus } = useHandInputFocus(hand?.length ?? 0);

  const isSynced = bridge.status === "connected" && bridge.inDuel;
  const terrain = isSynced ? (bridge.stats?.terrain ?? 0) : 0;
  const showOpponent = cheatMode && cheatView === "opponent" && bridge.inDuel;

  // In synced mode, derive hand directly from the bridge snapshot (same poll
  // cycle as field) so that hand + field are always consistent.
  const bridgeHandCards: HandCard[] = useMemo(
    () =>
      bridge.hand.map((cardId, i) => ({
        docId: `bridge-${String(i)}` as Id<"hand">,
        cardId,
      })),
    [bridge.hand],
  );
  const effectiveHand = isSynced ? bridgeHandCards : hand;

  // ── Composed callbacks ─────────────────────────────────────────

  const handlePlayFusion = useCallback(
    (materialDocIds: Id<"hand">[], result: FusionChainResult) => {
      playFusion(materialDocIds, result);
      requestInputFocus();
    },
    [playFusion, requestInputFocus],
  );

  const handleSourceModeChange = useCallback(
    (value: HandSourceMode) => {
      if (value === sourceMode) return;
      updatePreferences({ handSourceMode: value });
      requestInputFocus();
    },
    [sourceMode, updatePreferences, requestInputFocus],
  );

  // ── Zone toggle (hand/field, synced mode only) ─────────────────
  const zonePhase = bridge.phase === "opponent" ? ("field" as const) : bridge.phase;
  const { focusedZone, switchZone } = useZoneToggle(isSynced, zonePhase);

  if (effectiveHand === undefined) return <PanelLoadingState />;

  const isWaitingForDuel = bridge.status === "connected" && !bridge.inDuel;
  const hasPostDuelContent =
    postDuel.state === "optimizing" ||
    postDuel.state === "result" ||
    postDuel.state === "no_change";
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-2">
      {/* ── Bridge status bar (only when connected) ── */}
      {bridge.status === "connected" && <EmulatorBridgeBar />}

      {/* ── Post-duel suggestion (shown even while inDuel is stale) ── */}
      {hasPostDuelContent && <PostDuelSuggestion suggestion={postDuel} />}

      {/* ── Live rank tracker (synced duels only) ── */}
      <RankTracker />

      {/* ── Waiting for duel / duel ended (only when no post-duel content) ── */}
      {isWaitingForDuel &&
        !hasPostDuelContent &&
        (bridge.phase === "ended" ? (
          <DuelEnded lp={bridge.lp} stats={bridge.stats} />
        ) : (
          <WaitingForDuel />
        ))}

      {/* ── CPU cheat banner + Player/Opponent switch (animated with cheat mode) ── */}
      <CpuCheatBanner />
      <CheatViewSwitch />

      {/* ── Opponent view (cheat mode) ── */}
      {showOpponent ? (
        <div className="fm-opponent-theme flex flex-col gap-2">
          <OpponentPanel />
        </div>
      ) : (
        <>
          {/* ── Manual controls (only when bridge is not connected) ── */}
          {bridge.status !== "connected" && (
            <div className="flex flex-col gap-2">
              <ToggleGroup
                onChange={handleSourceModeChange}
                options={SOURCE_OPTIONS}
                value={sourceMode}
              />
              <HandCardSelector inputRef={inputRef} />
            </div>
          )}

          {/* ── Synced mode: 3D arena with both zones always visible ── */}
          {isSynced && (
            <ZoneArena
              field={{
                children: <FieldDisplay cards={bridge.field} terrain={terrain} />,
                count: bridge.field.length,
                maxCount: 5,
              }}
              focusedZone={focusedZone}
              hand={{
                children: (
                  <HandDisplay
                    cards={effectiveHand}
                    drawing={bridge.phase === "draw"}
                    frozen={bridge.inDuel && !bridge.handReliable}
                    terrain={terrain}
                  />
                ),
                count: effectiveHand.length,
                maxCount: HAND_SIZE,
              }}
              onSwitchZone={switchZone}
            />
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
                  onClick={clearField}
                  type="button"
                >
                  Clear field
                </button>
              </div>
              <FieldDisplay cards={manualField} />
            </section>
          )}

          {/* ── Manual mode: hand section ── */}
          {!isSynced && !isWaitingForDuel && effectiveHand && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <SectionLabel>
                  Your Hand
                  <span className="text-text-muted font-body font-normal ml-1.5">
                    ({String(effectiveHand.length)}/{String(HAND_SIZE)})
                  </span>
                </SectionLabel>
                {effectiveHand.length > 0 && (
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
                cards={effectiveHand}
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
              {!isSynced && (
                <div className="mb-1">
                  <SectionLabel>Best Plays</SectionLabel>
                </div>
              )}
              <FusionResultsList
                fieldCards={isSynced ? bridge.field : manualField}
                handCards={effectiveHand}
                onPlayFusion={isSynced ? undefined : handlePlayFusion}
                terrain={terrain}
              />
            </section>
          )}
        </>
      )}
    </div>
  );
}

// ── Waiting-for-duel empty state ────────────────────────────────

function WaitingForDuel() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
      {/* Five face-down card silhouettes with staggered pulse */}
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            className="w-10 h-14 sm:w-12 sm:h-16 rounded border border-gold-dim/30 bg-bg-surface/60 animate-pulse"
            key={i}
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--color-border-subtle) 25%, transparent 25%, transparent 50%, var(--color-border-subtle) 50%, var(--color-border-subtle) 75%, transparent 75%)",
              backgroundSize: "8px 8px",
              opacity: 0.35,
              animationDelay: `${String(i * 150)}ms`,
            }}
          />
        ))}
      </div>
      <div className="space-y-1.5">
        <p className="text-text-secondary text-sm font-medium">Start a duel to see your hand</p>
        <p className="text-text-muted/60 text-xs">
          Your best fusion plays will appear here automatically
        </p>
      </div>
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

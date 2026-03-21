import { useCallback, useEffect, useRef, useState } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
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
import { formatCardId } from "../../lib/format.ts";
import { useEmulatorBridge } from "../../lib/use-emulator-bridge.ts";
import { EmulatorBridgeBar } from "./EmulatorBridgeBar.tsx";
import { FieldDisplay } from "./FieldDisplay.tsx";
import { FusionResultsList } from "./FusionResultsList.tsx";
import { HandCardSelector } from "./HandCardSelector.tsx";
import { HandDisplay } from "./HandDisplay.tsx";
import { useAutoSyncHand } from "./use-auto-sync-hand.ts";

const SOURCE_OPTIONS: { value: HandSourceMode; label: string }[] = [
  { value: "all", label: "All cards" },
  { value: "deck", label: "Deck only" },
];

type FocusedZone = "hand" | "field";

/** Phases where fusion suggestions are irrelevant — the player has already committed. */
const HIDE_FUSIONS_PHASES = new Set(["fusion", "field", "battle"]);

export function HandFusionCalculator() {
  const hand = useHand();
  const deck = useDeck();
  const fusionDepth = useFusionDepth();
  const sourceMode = useHandSourceMode();
  const updatePreferences = useUpdatePreferences();
  const { addToHand, removeFromHand, removeMultipleFromHand, clearHand } = useHandMutations();
  const bridge = useEmulatorBridge();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pendingFocusRef = useRef(false);

  // Auto-sync hand from bridge (always active, even when bar is hidden)
  useAutoSyncHand(bridge, hand ?? []);

  const isSynced = bridge.status === "connected" && bridge.inDuel;

  // ── Zone toggle (hand/field, synced mode only) ───────────────
  const [focusedZone, setFocusedZone] = useState<FocusedZone>("hand");

  useEffect(() => {
    if (!isSynced) {
      setFocusedZone("hand");
      return;
    }
    // Auto-switch based on game phase
    if (bridge.phase === "field" || bridge.phase === "battle") {
      setFocusedZone("field");
    } else if (bridge.phase === "hand" || bridge.phase === "draw") {
      setFocusedZone("hand");
    }
    // Don't auto-switch during opponent/fusion/other — keep current
  }, [bridge.phase, isSynced]);

  // ── Manual mode input focus management ───────────────────────
  const deckCardIds = deck?.map((d) => d.cardId);

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
    (materialDocIds: Id<"hand">[]) => {
      if (materialDocIds.length > 0) {
        void removeMultipleFromHand({ ids: materialDocIds });
        requestInputFocus();
      }
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

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-3">
      {/* ── Bridge status bar (only when connected) ── */}
      {bridge.status === "connected" && <EmulatorBridgeBar bridge={bridge} />}

      {/* ── Manual controls (hidden in synced mode) ── */}
      {!isSynced && (
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

      {/* ── Hand zone ── */}
      <ZoneSection
        actions={
          hand.length > 0 && !isSynced ? (
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
          ) : undefined
        }
        cardIds={hand.map((c) => c.cardId)}
        collapsible={isSynced}
        count={hand.length}
        expanded={!isSynced || focusedZone === "hand"}
        label="Your Hand"
        maxCount={HAND_SIZE}
        onToggle={() => setFocusedZone("hand")}
      >
        <HandDisplay
          cards={hand}
          frozen={bridge.inDuel && !bridge.handReliable}
          onRemove={
            isSynced
              ? undefined
              : (docId) => {
                  void removeFromHand({ id: docId });
                  requestInputFocus();
                }
          }
        />
      </ZoneSection>

      {/* ── Field zone (synced mode only) ── */}
      {isSynced && (
        <ZoneSection
          cardIds={bridge.field}
          collapsible
          count={bridge.field.length}
          expanded={focusedZone === "field"}
          label="Field"
          maxCount={5}
          onToggle={() => setFocusedZone("field")}
        >
          <FieldDisplay cardIds={bridge.field} />
        </ZoneSection>
      )}

      {/* ── Fusion results (hidden during fusion/field/battle in synced mode) ── */}
      {(!isSynced || !HIDE_FUSIONS_PHASES.has(bridge.phase)) && (
        <section>
          <div className="mb-2">
            <SectionLabel>Possible Fusions</SectionLabel>
          </div>
          <FusionResultsList
            fusionDepth={fusionDepth}
            handCards={hand}
            onPlayFusion={isSynced ? undefined : handlePlayFusion}
          />
        </section>
      )}
    </div>
  );
}

// ── Zone section with animated expand/collapse ─────────────────

function ZoneSection({
  expanded,
  collapsible,
  label,
  count,
  maxCount,
  cardIds,
  onToggle,
  actions,
  children,
}: {
  expanded: boolean;
  collapsible: boolean;
  label: string;
  count: number;
  maxCount: number;
  cardIds: number[];
  onToggle: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        {collapsible ? (
          <button
            className="flex items-center gap-1.5 group/zone cursor-pointer"
            onClick={onToggle}
            type="button"
          >
            <ZoneChevron expanded={expanded} />
            <SectionLabel>
              {label}
              <span className="text-text-muted font-body font-normal ml-1.5">
                ({String(count)}/{String(maxCount)})
              </span>
            </SectionLabel>
          </button>
        ) : (
          <SectionLabel>
            {label}
            <span className="text-text-muted font-body font-normal ml-1.5">
              ({String(count)}/{String(maxCount)})
            </span>
          </SectionLabel>
        )}

        {/* Collapsed: inline thumbnails | Expanded: action buttons */}
        {!expanded && collapsible && cardIds.length > 0 && <InlineThumbnails cardIds={cardIds} />}
        {expanded && actions}
      </div>

      <div className={`fm-zone-content ${expanded ? "fm-zone-content--expanded" : ""}`}>
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </section>
  );
}

function ZoneChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`w-3 h-3 text-text-muted transition-transform duration-300 ${expanded ? "rotate-90" : ""}`}
      fill="none"
      role="img"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <title>Toggle</title>
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InlineThumbnails({ cardIds }: { cardIds: number[] }) {
  return (
    <div className="flex gap-1 items-center">
      {cardIds.map((cardId, i) => (
        <img
          alt="card"
          className="fm-zone-thumb"
          key={`thumb-${String(i)}-${String(cardId)}`}
          src={`/images/artwork/${formatCardId(cardId)}.webp`}
        />
      ))}
    </div>
  );
}

/**
 * Duel cursor discovery probe.
 *
 * Enable with:
 *   YFM_DIAG_CURSOR=1 bun bridge
 *
 * Disabled by default because logs can include opponent hidden card ids.
 *
 * This intentionally watches only known card-slot status bytes plus a single
 * suspected selected-card id discovered from passive RAM refs.
 */

import type { GameState, OffsetProfile } from "../memory.ts";

const HIGHLIGHT_BIT = 0x04;
const STABLE_MS = 150;
const SUSPECTED_TARGET_CARD_REL = 0xfe; // NTSC-U: 0x9b338, discovered passively.

export type CursorSlotZone = "playerHand" | "playerField" | "opponentHand" | "opponentField";

export type CursorStatusSlot = {
  zone: CursorSlotZone;
  index: number;
  cardId: number;
  status: number;
  highlighted: boolean;
};

export type CursorTargetCandidate = {
  offset: number;
  cardId: number;
  matches: CursorStatusSlot[];
};

export interface CursorProbe {
  onStateChange(view: DataView, state: GameState, profile: OffsetProfile | null): void;
}

export function createCursorProbe(): CursorProbe {
  let wasInDuel = false;
  let duelN = 0;
  let lastEmittedKey = "";
  let pendingKey = "";
  let pendingSince = 0;

  function onStateChange(view: DataView, state: GameState, profile: OffsetProfile | null): void {
    const phase = state.duelPhase;
    const inDuel = phase != null && phase >= 0x01 && phase <= 0x0b;

    if (!inDuel || !profile) {
      if (wasInDuel) {
        console.log(`[cursor-probe] === Duel #${duelN} ended ===`);
      }
      wasInDuel = false;
      lastEmittedKey = "";
      pendingKey = "";
      pendingSince = 0;
      return;
    }

    const slots = buildCursorStatusSlots(state);
    const target = readSuspectedCursorTarget(view, profile, slots);
    const key = cursorStatusKey(phase, state.turnIndicator, slots, target.cardId);
    const now = Date.now();

    if (!wasInDuel) {
      duelN++;
      console.log(
        `[cursor-probe] === Duel #${duelN} started (${profile.label}, phase=0x${phase.toString(16)}) ===`,
      );
      console.log(
        `[cursor-probe] ${formatCursorStatus(phase, state.sceneId, state.turnIndicator, slots, target)}`,
      );
      lastEmittedKey = key;
      pendingKey = key;
      pendingSince = now;
      wasInDuel = true;
      return;
    }

    if (key !== pendingKey) {
      pendingKey = key;
      pendingSince = now;
    } else if (key !== lastEmittedKey && now - pendingSince >= STABLE_MS) {
      console.log(
        `[cursor-probe] ${formatCursorStatus(phase, state.sceneId, state.turnIndicator, slots, target)}`,
      );
      lastEmittedKey = key;
    }

    wasInDuel = true;
  }

  return { onStateChange };
}

export function buildCursorStatusSlots(state: GameState): CursorStatusSlot[] {
  return [
    ...buildZoneSlots("playerHand", state.hand),
    ...buildZoneSlots("playerField", state.field),
    ...buildZoneSlots("opponentHand", state.opponentHand),
    ...buildZoneSlots("opponentField", state.opponentField),
  ];
}

export function cursorStatusKey(
  phase: number,
  turnIndicator: number | null,
  slots: readonly CursorStatusSlot[],
  targetCardId: number,
): string {
  return `${phase}|${turnIndicator ?? "?"}|${targetCardId}|${slots.map((slot) => slot.status.toString(16)).join(",")}`;
}

export function formatCursorStatus(
  phase: number,
  sceneId: number | null,
  turnIndicator: number | null,
  slots: readonly CursorStatusSlot[],
  target: CursorTargetCandidate,
): string {
  const highlighted = slots.filter((slot) => slot.highlighted && slot.cardId > 0);
  return (
    `phase=0x${phase.toString(16)} scene=${formatSceneId(sceneId)} turn=${turnIndicator ?? "?"} ` +
    `target=${formatCursorTarget(target)} ` +
    `highlight=${highlighted.length > 0 ? highlighted.map(formatCursorSlot).join(" ") : "none"} ` +
    `hand=${formatZoneCards(slots, "playerHand")} field=${formatZoneCards(slots, "playerField")} ` +
    `oppField=${formatZoneCards(slots, "opponentField")} ` +
    `statuses=${slots.map(formatCursorSlotStatus).join(" ")}`
  );
}

export function readSuspectedCursorTarget(
  view: DataView,
  profile: OffsetProfile,
  slots: readonly CursorStatusSlot[],
): CursorTargetCandidate {
  const offset = profile.duelPhase + SUSPECTED_TARGET_CARD_REL;
  const cardId = offset >= 0 && offset + 1 < view.byteLength ? view.getUint16(offset, true) : 0;
  return {
    offset,
    cardId,
    matches: slots.filter((slot) => slot.cardId === cardId),
  };
}

function buildZoneSlots(
  zone: CursorSlotZone,
  slots: readonly { cardId: number; status: number }[],
): CursorStatusSlot[] {
  return slots.map((slot, index) => ({
    zone,
    index,
    cardId: slot.cardId,
    status: slot.status,
    highlighted: (slot.status & HIGHLIGHT_BIT) !== 0,
  }));
}

function formatCursorSlot(slot: CursorStatusSlot): string {
  return `${slot.zone}[${slot.index + 1}]#${slot.cardId}:${slot.status.toString(16)}`;
}

function formatCursorSlotStatus(slot: CursorStatusSlot): string {
  return `${slot.zone[0]}${slot.index + 1}:${slot.status.toString(16)}`;
}

function formatSceneId(sceneId: number | null): string {
  return sceneId == null ? "?" : `0x${sceneId.toString(16)}`;
}

function formatZoneCards(slots: readonly CursorStatusSlot[], zone: CursorSlotZone): string {
  return `[${slots
    .filter((slot) => slot.zone === zone)
    .map((slot) => `${slot.index + 1}:${slot.cardId}`)
    .join(" ")}]`;
}

function formatCursorTarget(target: CursorTargetCandidate): string {
  const prefix = `0x${target.offset.toString(16)}#${target.cardId}`;
  if (target.cardId <= 0) return `${prefix}:none`;
  if (target.matches.length === 0) return `${prefix}:unmatched`;
  return `${prefix}:${target.matches.map(formatCursorSlot).join("/")}`;
}

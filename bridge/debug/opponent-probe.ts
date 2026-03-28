/**
 * Opponent card slot discovery probe.
 *
 * Scans card-sized (0x1C stride) slots in the region after the player field
 * to find opponent hand and field card data. Also probes the opponent hand
 * slot tracking at lpP2+offset (same structure as player at lpP1+offset).
 *
 * Usage from serve.ts:
 *
 *   import { createOpponentProbe } from "./debug/opponent-probe.ts";
 *   const oppProbe = createOpponentProbe();
 *
 *   // Inside poll loop, on state change:
 *   oppProbe.onStateChange(view, state, profile);
 *
 * Expected output during a duel:
 *   - Card slots with valid IDs (1-722) and reasonable ATK/DEF in the
 *     region after the player field (0x1A7BFC onwards)
 *   - Opponent hand slot tracking at lpP2+offset matching the pattern
 *     seen for the player (deal indices + 0xFF for cards that left hand)
 *
 * How to verify:
 *   1. Start a duel and note which cards the opponent plays to field
 *   2. Check the probe output for matching card IDs
 *   3. The opponent hand should show 5 cards initially, decreasing as they play
 */

import type { GameState, OffsetProfile } from "../memory.ts";
import { peekU8, peekU16 } from "../memory.ts";

const HAND_STRIDE = 0x1c;
const PLAYER_FIELD_END = 0x1a7b70 + 5 * HAND_STRIDE; // 0x1A7BFC

/** Number of 0x1C-byte slots to scan after the player field. */
const SCAN_SLOTS = 20;

/** Extended scan: scan further past known zones for hidden card-sized data. */
const EXTENDED_SCAN_SLOTS = 40;
/** CPU deck pool: 722 × uint16 entries (per-card-ID availability table). */
const CPU_DECK_POOL = 0x1781d8;
const CPU_DECK_POOL_ENTRIES = 722;
/** Extended P2 hand slot scan: read up to 20 entries (CPU may have 20-card hand). */
const EXTENDED_HAND_SLOT_COUNT = 20;

export interface OpponentProbe {
  onStateChange(view: DataView, state: GameState, profile: OffsetProfile | null): void;
}

function readSlot(
  view: DataView,
  base: number,
): { cardId: number; atk: number; def: number; equipBoost: number; status: number } {
  const cardId = peekU16(view, base);
  const baseAtk = peekU16(view, base + 0x02);
  const baseDef = peekU16(view, base + 0x04);
  const equipBoost = peekU16(view, base + 0x06);
  const status = peekU8(view, base + 0x0b);
  return { cardId, atk: baseAtk + equipBoost, def: baseDef + equipBoost, equipBoost, status };
}

function fmtSlot(slot: ReturnType<typeof readSlot>, idx: number, offset: number): string {
  if (slot.cardId === 0 && slot.status === 0) return `  [${idx}] 0x${offset.toString(16)}: (empty)`;
  const eq = slot.equipBoost > 0 ? ` +${slot.equipBoost}eq` : "";
  return (
    `  [${idx}] 0x${offset.toString(16)}: ` +
    `id=${slot.cardId} atk=${slot.atk} def=${slot.def}${eq} ` +
    `status=0x${slot.status.toString(16).padStart(2, "0")}`
  );
}

export function createOpponentProbe(): OpponentProbe {
  let lastPhase: number | null = null;
  let wasInDuel = false;
  let duelN = 0;
  let lastFieldKey = "";

  function logSlots(view: DataView, label: string): void {
    console.log(`[opp-probe] ${label}`);

    // Player hand/field (reference)
    console.log("[opp-probe] --- Player hand (0x1A7AE4) ---");
    for (let i = 0; i < 5; i++) {
      const off = 0x1a7ae4 + i * HAND_STRIDE;
      console.log(fmtSlot(readSlot(view, off), i, off));
    }
    console.log("[opp-probe] --- Player field (0x1A7B70) ---");
    for (let i = 0; i < 5; i++) {
      const off = 0x1a7b70 + i * HAND_STRIDE;
      console.log(fmtSlot(readSlot(view, off), i, off));
    }

    // Scan region after player field
    console.log(`[opp-probe] --- Scan after player field (${SCAN_SLOTS} slots from 0x1A7BFC) ---`);
    for (let i = 0; i < SCAN_SLOTS; i++) {
      const off = PLAYER_FIELD_END + i * HAND_STRIDE;
      console.log(fmtSlot(readSlot(view, off), i, off));
    }
  }

  function logHandSlotTracking(view: DataView, profile: OffsetProfile, label: string): void {
    // Player hand slot tracking (reference)
    const p1Dealt = peekU8(view, profile.lpP1 + 0x04);
    const p1Slots: string[] = [];
    for (let i = 0; i < 5; i++) {
      const v = peekU8(view, profile.handSlots + i);
      p1Slots.push(v === 0xff ? "FF" : String(v));
    }
    console.log(`[opp-probe] ${label} P1: dealt=${p1Dealt} slots=[${p1Slots.join(",")}]`);

    // Opponent hand slot tracking (speculative: same relative offset from lpP2)
    // Try multiple offset variants in case the structure differs
    const lpP2 = profile.lpP2;
    const playerSlotOffset = profile.handSlots - profile.lpP1;
    const playerDealtOffset = profile.cardsDealt - profile.lpP1;

    const p2Dealt = peekU8(view, lpP2 + playerDealtOffset);
    const p2Slots: string[] = [];
    for (let i = 0; i < 5; i++) {
      const v = peekU8(view, lpP2 + playerSlotOffset + i);
      p2Slots.push(v === 0xff ? "FF" : String(v));
    }
    console.log(
      `[opp-probe] ${label} P2 (lpP2+${playerSlotOffset}): dealt=${p2Dealt} slots=[${p2Slots.join(",")}]`,
    );

    // Also dump raw bytes around lpP2 for investigation
    const base = lpP2 - 0x10;
    const hex: string[] = [];
    for (let i = 0; i < 0x30; i++) {
      hex.push(
        peekU8(view, base + i)
          .toString(16)
          .padStart(2, "0"),
      );
    }
    console.log(`[opp-probe] ${label} P2 raw (lpP2-0x10..lpP2+0x20):`);
    console.log(`[opp-probe]   ${hex.slice(0, 16).join(" ")}  (lpP2-0x10..lpP2-0x01)`);
    console.log(`[opp-probe]   ${hex.slice(16, 32).join(" ")}  (lpP2+0x00..lpP2+0x0F)`);
    console.log(`[opp-probe]   ${hex.slice(32, 48).join(" ")}  (lpP2+0x10..lpP2+0x1F)`);
  }

  function logCpuShuffledDeck(view: DataView, label: string): void {
    const CpuShuffledDeck = 0x178038;
    const ids: number[] = [];
    for (let i = 0; i < 40; i++) {
      ids.push(peekU16(view, CpuShuffledDeck + i * 2));
    }
    const valid = ids.filter((id) => id > 0 && id < 723);
    console.log(`[opp-probe] ${label} CPU deck (${valid.length} valid): ${valid.join(" ")}`);
  }

  /** Scan past the known card zones (player+opponent = 30 slots) for more card-sized data. */
  function logExtendedSlotScan(view: DataView, label: string): void {
    // Start scanning after opponent field (0x1A7D14 + 5*0x1C = 0x1A7DA0)
    const scanBase = 0x1a7da0;
    const found: string[] = [];
    for (let i = 0; i < EXTENDED_SCAN_SLOTS; i++) {
      const off = scanBase + i * HAND_STRIDE;
      const slot = readSlot(view, off);
      if (slot.cardId > 0 && slot.cardId < 723) {
        found.push(
          `  [${i}] 0x${off.toString(16)}: id=${slot.cardId} atk=${slot.atk} def=${slot.def} status=0x${slot.status.toString(16).padStart(2, "0")}`,
        );
      }
    }
    if (found.length > 0) {
      console.log(
        `[opp-probe] ${label} EXTENDED SCAN (${found.length} valid cards after 0x1A7DA0):`,
      );
      for (const line of found) console.log(`[opp-probe] ${line}`);
    } else {
      console.log(
        `[opp-probe] ${label} EXTENDED SCAN: no valid cards in ${EXTENDED_SCAN_SLOTS} slots after 0x1A7DA0`,
      );
    }
  }

  /** Read up to 20 P2 hand slot entries (CPU might have extended hand beyond 5 visible). */
  function logExtendedP2HandSlots(view: DataView, profile: OffsetProfile, label: string): void {
    const lpP2 = profile.lpP2;
    const playerSlotOffset = profile.handSlots - profile.lpP1;
    const p2SlotsBase = lpP2 + playerSlotOffset;

    const entries: string[] = [];
    for (let i = 0; i < EXTENDED_HAND_SLOT_COUNT; i++) {
      const v = peekU8(view, p2SlotsBase + i);
      entries.push(v === 0xff ? "FF" : String(v));
    }
    console.log(
      `[opp-probe] ${label} P2 extended hand slots (${EXTENDED_HAND_SLOT_COUNT} entries from lpP2+${playerSlotOffset}):`,
    );
    console.log(
      `[opp-probe]   [${entries.slice(0, 5).join(",")}] | [${entries.slice(5, 10).join(",")}] | [${entries.slice(10, 15).join(",")}] | [${entries.slice(15, 20).join(",")}]`,
    );
  }

  /** Dump the CPU deck pool (722 × uint16 — per-card-ID availability table). */
  function logCpuDeckPool(view: DataView, label: string): void {
    const nonZero: Array<{ cardId: number; value: number }> = [];
    for (let i = 0; i < CPU_DECK_POOL_ENTRIES; i++) {
      const v = peekU16(view, CPU_DECK_POOL + i * 2);
      if (v > 0) nonZero.push({ cardId: i + 1, value: v });
    }
    console.log(
      `[opp-probe] ${label} CPU deck pool (${nonZero.length} non-zero entries at 0x${CPU_DECK_POOL.toString(16)}):`,
    );
    // Show first 20 entries for brevity
    const preview = nonZero.slice(0, 20).map((e) => `${e.cardId}=${e.value}`);
    console.log(`[opp-probe]   first 20: ${preview.join(" ")}`);
    if (nonZero.length > 20) {
      console.log(`[opp-probe]   ... and ${nonZero.length - 20} more`);
    }
  }

  /** Scan for a hand-size byte near the duelist config area. */
  function logDuelistConfigArea(view: DataView, profile: OffsetProfile, label: string): void {
    // The duelist ID lives at profile.duelistId. Scan bytes around it for
    // values that could be a hand size (5-20 range)
    const base = profile.duelistId - 0x20;
    const hex: string[] = [];
    for (let i = 0; i < 0x60; i++) {
      hex.push(
        peekU8(view, base + i)
          .toString(16)
          .padStart(2, "0"),
      );
    }
    console.log(
      `[opp-probe] ${label} Duelist config area (duelistId=0x${profile.duelistId.toString(16)} ± 0x20):`,
    );
    for (let row = 0; row < 6; row++) {
      const off = base + row * 0x10;
      const marker = off === profile.duelistId ? " <-- duelistId" : "";
      console.log(
        `[opp-probe]   0x${off.toString(16)}: ${hex.slice(row * 16, row * 16 + 16).join(" ")}${marker}`,
      );
    }
  }

  function onStateChange(view: DataView, state: GameState, profile: OffsetProfile | null): void {
    const inDuel = state.duelPhase != null && state.duelPhase >= 0x01 && state.duelPhase <= 0x0b;

    // Entering duel
    if (inDuel && !wasInDuel) {
      duelN++;
      const tag = `ENTER duel#${duelN}`;
      console.log(
        `[opp-probe] === Duel #${duelN} started (phase=0x${state.duelPhase?.toString(16)}) ===`,
      );
      logSlots(view, tag);
      logCpuShuffledDeck(view, tag);
      if (profile) {
        logHandSlotTracking(view, profile, tag);
        logExtendedP2HandSlots(view, profile, tag);
        logDuelistConfigArea(view, profile, tag);
      }
      logExtendedSlotScan(view, tag);
      logCpuDeckPool(view, tag);
    }

    // Phase change
    if (inDuel && state.duelPhase !== lastPhase) {
      const tag = `phase 0x${lastPhase?.toString(16) ?? "?"} → 0x${state.duelPhase?.toString(16)}`;
      logSlots(view, tag);
      if (profile) {
        logHandSlotTracking(view, profile, "phase change");
        logExtendedP2HandSlots(view, profile, "phase change");
      }
    }

    // Field change (opponent plays a card — most interesting event)
    const fieldKey = state.field.map((s) => `${s.cardId}:${s.status}`).join(",");
    if (inDuel && fieldKey !== lastFieldKey && lastFieldKey !== "") {
      logSlots(view, "FIELD CHANGE");
      if (profile) {
        logHandSlotTracking(view, profile, "FIELD CHANGE");
        logExtendedP2HandSlots(view, profile, "FIELD CHANGE");
      }
    }
    lastFieldKey = fieldKey;

    // Leaving duel
    if (!inDuel && wasInDuel) {
      console.log(`[opp-probe] === Duel #${duelN} ended ===`);
      logSlots(view, `EXIT duel#${duelN}`);
    }

    wasInDuel = inDuel;
    lastPhase = state.duelPhase;
  }

  return { onStateChange };
}

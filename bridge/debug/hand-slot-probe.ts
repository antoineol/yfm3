/**
 * NTSC-U hand slot verification probe.
 *
 * Verifies that the hand slot index array discovered on PAL (lpP1+0x06..0x0C)
 * exists at the same relative offsets on NTSC-U.
 *
 * PAL has fusionCounter at lpP1-0x0B, NTSC-U at lpP1-0x0C, so there may be
 * a 1-byte structural shift. The probe dumps a wider region (lpP1-0x10 to
 * lpP1+0x20) to catch offsets even if shifted.
 *
 * Usage from serve.ts:
 *
 *   import { createHandSlotProbe } from "./debug/hand-slot-probe.ts";
 *   const handProbe = createHandSlotProbe();
 *
 *   // Inside poll loop, on state change:
 *   handProbe.onStateChange(view, state, profile);
 *
 * Expected output during a duel:
 *   - After deal: cardsDealt=5, slots=[0,1,2,3,4]
 *   - After play: one slot becomes FF
 *   - After draw: cardsDealt increments, new index replaces FF
 *   - After fusion: two slots become FF
 */

import type { GameState, OffsetProfile } from "../memory.ts";
import { peekU8, peekU16 } from "../memory.ts";

export interface HandSlotProbe {
  onStateChange(view: DataView, state: GameState, profile: OffsetProfile | null): void;
}

/**
 * Create a hand slot probe instance.
 * Logs the LP region structure on every phase change and hand change.
 */
export function createHandSlotProbe(): HandSlotProbe {
  let lastPhase: number | null = null;
  let lastHandKey = "";
  let duelN = 0;
  let wasInDuel = false;

  function logRegion(view: DataView, lp: number, label: string): void {
    // Dump lpP1-0x10 to lpP1+0x20 (48 bytes) as hex
    const base = lp - 0x10;
    const len = 0x30;
    const hex: string[] = [];
    for (let i = 0; i < len; i++) {
      hex.push(
        peekU8(view, base + i)
          .toString(16)
          .padStart(2, "0"),
      );
    }
    console.log(`[hand-probe] ${label} | raw (lp-0x10..lp+0x20):`);
    console.log(`[hand-probe]   ${hex.slice(0, 16).join(" ")}  (lp-0x10..lp-0x01)`);
    console.log(`[hand-probe]   ${hex.slice(16, 32).join(" ")}  (lp+0x00..lp+0x0F)`);
    console.log(`[hand-probe]   ${hex.slice(32, 48).join(" ")}  (lp+0x10..lp+0x1F)`);

    // Log interpreted values at PAL-equivalent offsets
    const cardsDealt = peekU8(view, lp + 0x06);
    const slots: string[] = [];
    for (let i = 0; i < 5; i++) {
      const v = peekU8(view, lp + 0x08 + i);
      slots.push(v === 0xff ? "FF" : String(v));
    }
    const lpVal = peekU16(view, lp);
    const fusNtsc = peekU8(view, lp - 0x0c); // NTSC-U known offset
    const fusPal = peekU8(view, lp - 0x0b); // PAL known offset
    console.log(
      `[hand-probe]   LP=${lpVal} fus(ntsc-0x0C)=${fusNtsc} fus(pal-0x0B)=${fusPal}` +
        ` dealt=${cardsDealt} slots=[${slots.join(",")}]`,
    );

    // Also probe 1-byte-shifted offsets in case structure differs
    const cardsDealtShifted = peekU8(view, lp + 0x05);
    const slotsShifted: string[] = [];
    for (let i = 0; i < 5; i++) {
      const v = peekU8(view, lp + 0x07 + i);
      slotsShifted.push(v === 0xff ? "FF" : String(v));
    }
    console.log(
      `[hand-probe]   (shifted -1) dealt=${cardsDealtShifted} slots=[${slotsShifted.join(",")}]`,
    );
  }

  function onStateChange(view: DataView, state: GameState, profile: OffsetProfile | null): void {
    if (!profile?.lpP1) return;

    const inDuel = state.duelPhase != null && state.duelPhase >= 0x01 && state.duelPhase <= 0x0d;

    // Entering duel
    if (inDuel && !wasInDuel) {
      duelN++;
      console.log(
        `[hand-probe] === Duel #${duelN} started (${profile.label}, phase=0x${state.duelPhase?.toString(16)}) ===`,
      );
      logRegion(view, profile.lpP1, `ENTER duel#${duelN}`);
    }

    // Phase change
    if (inDuel && state.duelPhase !== lastPhase) {
      logRegion(
        view,
        profile.lpP1,
        `phase 0x${lastPhase?.toString(16) ?? "?"} → 0x${state.duelPhase?.toString(16)}`,
      );
    }

    // Hand change (card IDs changed)
    const handKey = state.hand.map((s) => `${s.cardId}:${s.status}`).join(",");
    if (inDuel && handKey !== lastHandKey && lastHandKey !== "") {
      logRegion(view, profile.lpP1, "HAND CHANGE");
    }
    lastHandKey = handKey;

    // Leaving duel
    if (!inDuel && wasInDuel) {
      console.log(`[hand-probe] === Duel #${duelN} ended ===`);
      logRegion(view, profile.lpP1, `EXIT duel#${duelN}`);
    }

    wasInDuel = inDuel;
    lastPhase = state.duelPhase;
  }

  return { onStateChange };
}

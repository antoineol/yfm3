/**
 * Detects CPU card swaps ("cheats") by comparing consecutive raw opponent
 * hand snapshots from the bridge. The CPU AI replaces card IDs in-place
 * without the dealt counter incrementing — we catch that by spotting
 * valid-to-valid card ID changes in a slot whose deal index didn't change.
 *
 * Key distinction between swaps, draws, and shifts:
 * - SWAP: same deal index (handSlots[i] unchanged), different card ID
 * - DRAW: slot was empty (prevHandSlots[i] = 0xFF), now occupied
 * - SHIFT: different deal index (handSlots[i] changed) — game reorganized
 *   the hand after fusions, moving cards to fill gaps
 */

export type CpuSwap = {
  slotIndex: number;
  fromCardId: number;
  toCardId: number;
  timestamp: number;
};

type RawSlot = { cardId: number; atk: number; def: number };

/**
 * Compare two consecutive raw opponent hand snapshots and return any swaps.
 *
 * A swap is detected when:
 * - Both `wasInDuel` and `isInDuel` are true (skip duel-start transitions)
 * - A card ID at position `i` changed between prev and curr
 * - Both old and new card IDs are valid (1-722)
 * - The new card has non-zero stats (filters out intermediate 0/0 writes)
 * - The deal index at this slot did NOT change (same handSlots[i] value)
 *   — this is the key check: a real swap keeps the deal index, a shift changes it
 */
export function detectCpuSwaps(
  prevHand: RawSlot[] | undefined,
  currHand: RawSlot[] | undefined,
  prevHandSlots: number[] | null | undefined,
  currHandSlots: number[] | null | undefined,
  wasInDuel: boolean,
  isInDuel: boolean,
  now: number,
): CpuSwap[] {
  if (!wasInDuel || !isInDuel) return [];
  if (!prevHand || !currHand) return [];

  const swaps: CpuSwap[] = [];
  const len = Math.min(prevHand.length, currHand.length);

  for (let i = 0; i < len; i++) {
    const prev = prevHand[i];
    const curr = currHand[i];
    if (!prev || !curr) continue;

    const oldId = prev.cardId;
    const newId = curr.cardId;

    if (oldId === newId) continue;
    if (oldId < 1 || oldId > 722) continue; // was empty
    if (newId < 1 || newId > 722) continue; // became empty
    if (curr.atk === 0 && curr.def === 0) continue; // incomplete write

    // When hand slot tracking is available, the definitive swap check:
    // a real swap keeps the same deal index but changes the card ID.
    // A draw or shift changes the deal index (or goes from 0xFF to a value).
    if (prevHandSlots && currHandSlots) {
      const prevSlot = prevHandSlots[i];
      const currSlot = currHandSlots[i];
      // Slot was empty before (draw) or deal index changed (shift) → not a swap
      if (prevSlot === 0xff || currSlot === 0xff) continue;
      if (prevSlot !== currSlot) continue;
    }

    swaps.push({ slotIndex: i, fromCardId: oldId, toCardId: newId, timestamp: now });
  }

  return swaps;
}

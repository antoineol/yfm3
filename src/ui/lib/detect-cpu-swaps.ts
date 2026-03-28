/**
 * Detects CPU card swaps ("cheats") by comparing consecutive **interpreted**
 * opponent hand snapshots. Uses the same filtered hand that drives the UI,
 * so fusion-consumed cards are already excluded.
 *
 * Detection only runs when hand size AND field size are both unchanged —
 * meaning no draws, plays, or fusions occurred. Under these conditions,
 * any card ID change at a position is a swap.
 */

export type CpuSwap = {
  slotIndex: number;
  fromCardId: number;
  toCardId: number;
  timestamp: number;
};

export function detectCpuSwaps(
  prevHand: number[],
  currHand: number[],
  prevFieldCount: number,
  currFieldCount: number,
  wasInDuel: boolean,
  isInDuel: boolean,
  now: number,
): CpuSwap[] {
  if (!wasInDuel || !isInDuel) return [];
  if (prevHand.length !== currHand.length) return [];
  if (prevFieldCount !== currFieldCount) return [];

  const swaps: CpuSwap[] = [];

  for (let i = 0; i < prevHand.length; i++) {
    const prev = prevHand[i];
    const curr = currHand[i];
    if (prev == null || curr == null) continue;
    if (prev !== curr) {
      swaps.push({ slotIndex: i, fromCardId: prev, toCardId: curr, timestamp: now });
    }
  }

  return swaps;
}

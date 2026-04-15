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

/** A snapshot of the opponent's board state needed for swap detection. */
export type SwapSnapshot = {
  opponentHand: number[];
  opponentFieldCount: number;
  inDuel: boolean;
};

/**
 * High-level swap accumulator: detects new swaps between two snapshots,
 * deduplicates against already-known swaps, and returns the next swap list.
 *
 * - Returns `[]` when the duel ended (clears history).
 * - Returns `existing` unchanged when it's not the opponent's turn or no
 *   new swaps are found.
 */
export function accumulateCpuSwaps(
  existing: CpuSwap[],
  prev: SwapSnapshot,
  curr: SwapSnapshot,
  effectivePhase: string,
  now: number,
): CpuSwap[] {
  if (!curr.inDuel) return existing.length === 0 ? existing : [];
  if (effectivePhase !== "opponent") return existing;

  const raw = detectCpuSwaps(
    prev.opponentHand,
    curr.opponentHand,
    prev.opponentFieldCount,
    curr.opponentFieldCount,
    prev.inDuel,
    curr.inDuel,
    now,
  );

  if (raw.length === 0) return existing;

  const unique = deduplicateSwaps(raw, existing);
  return unique.length > 0 ? [...existing, ...unique] : existing;
}

/** Filter out swaps already present (same or reversed direction) in `existing`. */
function deduplicateSwaps(newSwaps: CpuSwap[], existing: CpuSwap[]): CpuSwap[] {
  return newSwaps.filter(
    (s) =>
      !existing.some(
        (e) =>
          e.slotIndex === s.slotIndex &&
          ((e.fromCardId === s.fromCardId && e.toCardId === s.toCardId) ||
            (e.fromCardId === s.toCardId && e.toCardId === s.fromCardId)),
      ),
  );
}

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

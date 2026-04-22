// ---------------------------------------------------------------------------
// Invariant enforcement: rebalance unpinned weights so the pool sums to 2048.
//
// Pinned cards keep their current draft value. Unpinned cards get scaled
// proportionally to their *original* (on-disk) weights — so the pool's
// natural distribution is preserved where the user hasn't opinionated it.
// Rounding shortfall goes to the largest unpinned entry, keeping the sum
// exact (required by the game's `rand() & 0x7FF` indexing).
// ---------------------------------------------------------------------------

export const POOL_SUM = 2048;

/**
 * @param draft     Current in-memory pool weights (722 entries, indexed 0-based).
 * @param pinnedSet 1-based card IDs whose draft weights must be preserved.
 * @param original  Original on-disk weights, used as the proportional template
 *                  for unpinned cards.
 * @returns New array where pinned entries are unchanged and unpinned entries
 *          have been rescaled so the total equals POOL_SUM.
 */
export function balanceUnpinned(
  draft: readonly number[],
  pinnedSet: ReadonlySet<number>,
  original: readonly number[],
): number[] {
  const result = [...draft];
  const pinnedSum = sumByIndex(result, (i) => pinnedSet.has(i + 1));
  const remaining = POOL_SUM - pinnedSum;

  if (remaining < 0) {
    // Pinned already exceed the budget — zero unpinned and let the summary
    // bar flag the over-allocation to the user.
    for (let i = 0; i < result.length; i++) {
      if (!pinnedSet.has(i + 1)) result[i] = 0;
    }
    return result;
  }

  const origUnpinnedSum = sumByIndex(original, (i) => !pinnedSet.has(i + 1));
  if (origUnpinnedSum === 0) {
    // Nothing to scale from — leave unpinned at zero so save is blocked until
    // the user edits explicitly.
    for (let i = 0; i < result.length; i++) {
      if (!pinnedSet.has(i + 1)) result[i] = 0;
    }
    return result;
  }

  let allocated = 0;
  let largestIdx = -1;
  let largestAlloc = -1;
  for (let i = 0; i < result.length; i++) {
    if (pinnedSet.has(i + 1)) continue;
    const orig = original[i] ?? 0;
    const scaled = Math.floor((orig * remaining) / origUnpinnedSum);
    result[i] = scaled;
    allocated += scaled;
    if (scaled > largestAlloc) {
      largestAlloc = scaled;
      largestIdx = i;
    }
  }

  const deficit = remaining - allocated;
  if (deficit !== 0 && largestIdx >= 0) {
    result[largestIdx] = Math.max(0, (result[largestIdx] ?? 0) + deficit);
  }
  return result;
}

function sumByIndex(arr: readonly number[], predicate: (i: number) => boolean): number {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    if (predicate(i)) sum += arr[i] ?? 0;
  }
  return sum;
}

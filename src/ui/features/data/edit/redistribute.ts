// ---------------------------------------------------------------------------
// Invariant enforcement: rebalance unpinned weights so the pool sums to 2048.
//
// Pinned cards keep their current draft value. Unpinned cards get scaled
// proportionally to a caller-supplied template — typically the current draft,
// so the user's edits to unpinned cards are preserved (their relative ratios
// stay the same, only the magnitude is rescaled to absorb the slack from
// pinned changes). Rounding shortfall goes to the largest unpinned entry,
// keeping the sum exact (required by the game's `rand() & 0x7FF` indexing).
// ---------------------------------------------------------------------------

export const POOL_SUM = 2048;

/**
 * @param draft     Current in-memory pool weights (722 entries, indexed 0-based).
 * @param pinnedSet 1-based card IDs whose draft weights must be preserved.
 * @param template  Weights used as the proportional template for unpinned
 *                  cards — callers pass the current draft to preserve in-flight
 *                  edits, or the original on-disk array for a "reset to vanilla
 *                  proportions" semantic.
 * @returns New array where pinned entries are unchanged and unpinned entries
 *          have been rescaled so the total equals POOL_SUM.
 */
export function balanceUnpinned(
  draft: readonly number[],
  pinnedSet: ReadonlySet<number>,
  template: readonly number[],
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

  const templateUnpinnedSum = sumByIndex(template, (i) => !pinnedSet.has(i + 1));
  if (templateUnpinnedSum === 0) {
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
    const templateValue = template[i] ?? 0;
    const scaled = Math.floor((templateValue * remaining) / templateUnpinnedSum);
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

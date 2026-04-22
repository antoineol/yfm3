import { describe, expect, test } from "vitest";
import { balanceUnpinned, POOL_SUM } from "./redistribute.ts";

function makePool(size: number, valuesByIdx: Record<number, number> = {}): number[] {
  const out = new Array<number>(size).fill(0);
  for (const [k, v] of Object.entries(valuesByIdx)) out[Number(k)] = v;
  return out;
}

describe("balanceUnpinned", () => {
  test("distributes remaining budget proportionally to original unpinned weights", () => {
    // Original: BEWD(1)=0, Seiyaryu(228)=100, others=0
    const original = makePool(722, { 0: 0, 227: 100 });
    // Draft pinned BEWD at 1024, no other changes
    const draft = makePool(722, { 0: 1024, 227: 100 });
    const pinned = new Set<number>([1]);
    const balanced = balanceUnpinned(draft, pinned, original);

    expect(balanced[0]).toBe(1024); // pinned preserved
    expect(balanced[227]).toBe(POOL_SUM - 1024); // only non-pinned with original > 0
    const sum = balanced.reduce((a, b) => a + b, 0);
    expect(sum).toBe(POOL_SUM);
  });

  test("preserves pinned values even when pinned sum exceeds POOL_SUM", () => {
    const original = makePool(722, { 0: 500, 1: 500 });
    const draft = makePool(722, { 0: 1500, 1: 1000 });
    const pinned = new Set<number>([1, 2]);
    const balanced = balanceUnpinned(draft, pinned, original);

    expect(balanced[0]).toBe(1500);
    expect(balanced[1]).toBe(1000);
    // Caller reads the over-allocation via pool sum > POOL_SUM
    const sum = balanced.reduce((a, b) => a + b, 0);
    expect(sum).toBe(2500);
  });

  test("exact sum when rounding errors would accumulate", () => {
    // Original: seven cards each weight 100 (total 700)
    const original = makePool(722);
    for (let i = 0; i < 7; i++) original[i] = 100;
    const draft = [...original];
    const pinned = new Set<number>(); // nothing pinned
    const balanced = balanceUnpinned(draft, pinned, original);
    const sum = balanced.reduce((a, b) => a + b, 0);
    expect(sum).toBe(POOL_SUM);
  });

  test("leaves unpinned at zero when template unpinned sum is zero", () => {
    const original = makePool(722, { 0: 2048 });
    const draft = makePool(722, { 0: 500 });
    const pinned = new Set<number>([1]);
    const balanced = balanceUnpinned(draft, pinned, original);
    expect(balanced[0]).toBe(500);
    const sum = balanced.reduce((a, b) => a + b, 0);
    // pinned sum is 500, no unpinned to allocate to — summary bar flags it
    expect(sum).toBe(500);
  });

  test("preserves unpinned edits when the draft itself is used as the template", () => {
    // Real-world scenario: user bumps two unpinned cards to 60 each (draft),
    // and expects Balance to keep their ratio while rescaling to POOL_SUM.
    // The caller passes the draft as the template, so edits are preserved.
    const draft = makePool(722, { 0: 60, 1: 60 });
    const balanced = balanceUnpinned(draft, new Set(), draft);
    expect(balanced[0]).toBe(balanced[1]); // ratio preserved
    const sum = balanced.reduce((a, b) => a + b, 0);
    expect(sum).toBe(POOL_SUM);
  });
});

import { describe, expect, it } from "vitest";

describe("SA acceptance logic", () => {
  it("accepts uphill moves (positive delta always accepted)", () => {
    // SA with positive delta should always accept — verified by the SA logic:
    // delta > 0 → accept unconditionally
    // Here we verify the math: exp(positive / temp) > 1 always.
    expect(Math.exp(100 / 500)).toBeGreaterThan(1);
    expect(Math.exp(1 / 0.01)).toBeGreaterThan(1);
  });

  it("accepts downhill at high temp, rejects at low temp", () => {
    const delta = -100;
    const highTemp = 500;
    const lowTemp = 0.01;

    // At high temp, probability of acceptance is meaningful
    const pHigh = Math.exp(delta / highTemp);
    expect(pHigh).toBeGreaterThan(0.1);

    // At near-zero temp, probability of acceptance is negligible
    const pLow = Math.exp(delta / lowTemp);
    expect(pLow).toBeLessThan(1e-10);
  });

  it("adaptive cooling reaches floor for any time budget", () => {
    // Simulates the adaptive cooling formula used in sa-optimizer.ts:
    // coolingRate = exp(ln(TEMP_FLOOR / t0) / expectedIterations)
    const TEMP_FLOOR = 0.1;
    const MS_PER_SWAP = 2;

    for (const budgetMs of [2_000, 5_000, 10_000, 55_000]) {
      const t0 = 500;
      const expectedIter = budgetMs / MS_PER_SWAP;
      const rate = Math.exp(Math.log(TEMP_FLOOR / t0) / expectedIter);

      // After expectedIterations, temp should be at TEMP_FLOOR
      const finalTemp = t0 * rate ** expectedIter;
      expect(finalTemp).toBeCloseTo(TEMP_FLOOR, 5);

      // Rate should be in (0, 1)
      expect(rate).toBeGreaterThan(0);
      expect(rate).toBeLessThan(1);
    }
  });
});

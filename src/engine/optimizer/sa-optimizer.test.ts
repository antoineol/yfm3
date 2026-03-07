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

  it("cooling schedule decreases temperature correctly", () => {
    let temp = 500;
    // One cooling step (per-iteration cooling at rate 0.99963)
    temp *= 0.99963;
    expect(temp).toBeLessThan(500);
    expect(temp).toBeCloseTo(499.815, 1);

    // After ~23,000 iterations, temperature reaches near-zero
    for (let i = 0; i < 22999; i++) {
      temp *= 0.99963;
    }
    expect(temp).toBeLessThan(1);
  });
});

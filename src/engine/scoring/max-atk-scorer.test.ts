import { describe, expect, it } from "vitest";

import { createBuffers } from "../types/buffers.ts";
import { MaxAtkScorer } from "./max-atk-scorer.ts";

const scorer = new MaxAtkScorer();

describe("MaxAtkScorer", () => {
  it("returns a number", () => {
    const b = createBuffers();
    b.cardAtk[1] = 500;
    b.cardAtk[2] = 600;
    b.cardAtk[3] = 700;
    b.cardAtk[4] = 800;
    b.cardAtk[5] = 900;
    const hand = new Uint16Array([1, 2, 3, 4, 5]);
    const result = scorer.evaluateHand(hand, b);
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("max of hand", () => {
    const b = createBuffers();
    b.cardAtk[10] = 100;
    b.cardAtk[20] = 250;
    b.cardAtk[30] = 3000;
    b.cardAtk[40] = 150;
    b.cardAtk[50] = 2000;
    const hand = new Uint16Array([10, 20, 30, 40, 50]);
    const result = scorer.evaluateHand(hand, b);
    expect(result).toBe(3000);
  });
});

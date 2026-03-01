import type { IScorer } from "../types/interfaces.ts";

export class DummyScorer implements IScorer {
  evaluateHand(hand: Uint16Array, _fusionTable: Int16Array, cardAtk: Int16Array): number {
    let max = 0;
    for (let i = 0; i < 5; i++) {
      const atk = cardAtk[hand[i] ?? 0] ?? 0;
      if (atk > max) max = atk;
    }
    return max;
  }
}

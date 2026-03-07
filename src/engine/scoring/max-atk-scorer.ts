import type { AttackValue } from "../data/card-model.ts";
import type { OptBuffers } from "../types/buffers.ts";
import type { IScorer } from "../types/interfaces.ts";

/**
 * Step-0 scorer: ignores fusions, returns the highest base ATK among the 5 cards.
 * Will be replaced by a fusion-chain evaluator in a later phase.
 */
export class MaxAtkScorer implements IScorer {
  evaluateHand(hand: Uint16Array, buf: OptBuffers): AttackValue {
    let max = 0;
    for (let i = 0; i < 5; i++) {
      const atk = buf.cardAtk[hand[i] ?? 0] ?? 0;
      if (atk > max) max = atk;
    }
    return max;
  }
}

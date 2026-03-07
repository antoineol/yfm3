import type { AttackValue } from "../data/card-model.ts";
import type { OptBuffers } from "../types/buffers.ts";
import { FUSION_NONE, MAX_CARD_ID } from "../types/constants.ts";
import type { IScorer } from "../types/interfaces.ts";

/**
 * DFS fusion-chain hand evaluator.
 *
 * Given 5 cards, explores all fusion chains up to 3 fusions deep
 * (4 materials consumed) and returns the highest ATK achievable.
 *
 * Zero allocations in the hot path — uses a pre-allocated Int16Array
 * with stride-5 addressing for the DFS stack.
 */
export class FusionScorer implements IScorer {
  /**
   * Pre-allocated stack buffer: 3 DFS levels × 5 card slots.
   * Level layout (hand shrinks each fusion):
   *   Level 0: [0..4]   — 5 cards, C(5,2)=10 pairs
   *   Level 1: [5..8]   — 4 cards, C(4,2)=6  pairs
   *   Level 2: [10..12] — 3 cards, C(3,2)=3  pairs
   */
  private readonly stackBuffer = new Int16Array(3 * 5);

  evaluateHand(hand: Uint16Array, buf: OptBuffers): AttackValue {
    const sb = this.stackBuffer;
    const ft = buf.fusionTable;
    const atk = buf.cardAtk;

    // Copy hand into level 0 and find max base ATK
    let maxAtk = 0;
    for (let i = 0; i < 5; i++) {
      const id = hand[i] ?? 0;
      sb[i] = id;
      const a = atk[id] ?? 0;
      if (a > maxAtk) maxAtk = a;
    }

    maxAtk = this.dfs(sb, ft, atk, 0, 5, maxAtk);
    return maxAtk;
  }

  private dfs(
    sb: Int16Array,
    ft: Int16Array,
    atk: Int16Array,
    level: number,
    handSize: number,
    maxAtk: number,
  ): number {
    const base = level * 5;

    for (let i = 0; i < handSize - 1; i++) {
      const cardA = sb[base + i] ?? 0;
      for (let j = i + 1; j < handSize; j++) {
        const cardB = sb[base + j] ?? 0;

        const result = ft[cardA * MAX_CARD_ID + cardB] ?? FUSION_NONE;
        if (result === FUSION_NONE) continue;

        const resultAtk = atk[result] ?? 0;
        if (resultAtk > maxAtk) maxAtk = resultAtk;

        const newHandSize = handSize - 1;
        if (newHandSize < 2 || level >= 2) continue;

        // Copy remaining cards + result into next level
        const nextBase = (level + 1) * 5;
        let write = 0;
        for (let k = 0; k < handSize; k++) {
          if (k !== i && k !== j) {
            sb[nextBase + write] = sb[base + k] ?? 0;
            write++;
          }
        }
        sb[nextBase + write] = result;

        maxAtk = this.dfs(sb, ft, atk, level + 1, newHandSize, maxAtk);
      }
    }

    return maxAtk;
  }
}

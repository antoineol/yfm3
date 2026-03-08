import { getConfig } from "../config.ts";
import type { AttackValue } from "../data/card-model.ts";
import type { OptBuffers } from "../types/buffers.ts";
import { FUSION_NONE, MAX_CARD_ID, MAX_FUSION_DEPTH } from "../types/constants.ts";
import type { IScorer } from "../types/interfaces.ts";

/**
 * DFS fusion-chain hand evaluator.
 *
 * Given 5 cards, explores all fusion chains up to `fusionDepth` fusions deep
 * (fusionDepth + 1 materials consumed) and returns the highest ATK achievable.
 *
 * Zero allocations in the hot path — uses a pre-allocated Int16Array
 * with stride-5 addressing for the DFS stack.
 */
export class FusionScorer implements IScorer {
  /**
   * Pre-allocated stack buffer: MAX_FUSION_DEPTH DFS levels × 5 card slots.
   * Sized for worst case so the instance is reusable across config changes.
   */
  private readonly stackBuffer = new Int16Array(MAX_FUSION_DEPTH * 5);

  evaluateHand(hand: Uint16Array, buf: OptBuffers): AttackValue {
    const sb = this.stackBuffer;
    const ft = buf.fusionTable;
    const atk = buf.cardAtk;
    const maxLevel = getConfig().fusionDepth;

    // Copy hand into level 0 and find max base ATK
    let maxAtk = 0;
    for (let i = 0; i < 5; i++) {
      const id = hand[i] ?? 0;
      sb[i] = id;
      const a = atk[id] ?? 0;
      if (a > maxAtk) maxAtk = a;
    }

    maxAtk = this.dfs(sb, ft, atk, 0, 5, maxAtk, maxLevel);
    return maxAtk;
  }

  private dfs(
    sb: Int16Array,
    ft: Int16Array,
    atk: Int16Array,
    level: number,
    handSize: number,
    maxAtk: number,
    maxLevel: number,
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
        if (newHandSize < 2 || level >= maxLevel - 1) continue;

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

        maxAtk = this.dfs(sb, ft, atk, level + 1, newHandSize, maxAtk, maxLevel);
      }
    }

    return maxAtk;
  }
}

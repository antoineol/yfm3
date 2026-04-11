import { getConfig } from "../config.ts";
import type { AttackValue } from "../data/card-model.ts";
import type { OptBuffers } from "../types/buffers.ts";
import { FUSION_NONE, MAX_CARD_ID, MAX_FUSION_DEPTH } from "../types/constants.ts";
import type { IScorer } from "../types/interfaces.ts";

function equipBonus(equipId: number, mmId: number, mmBonus: number, stdBonus: number): number {
  return equipId === mmId ? mmBonus : stdBonus;
}

/**
 * DFS fusion-chain hand evaluator.
 *
 * Given 5 cards, explores all fusion chains up to `fusionDepth` fusions deep
 * (fusionDepth + 1 materials consumed) and returns the highest ATK achievable,
 * including equip bonuses applied after the last fusion in a chain.
 *
 * Equipment is always the terminal action: after all fusions, compatible
 * equip cards remaining in hand are applied (bonuses cumulate).
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
    const ec = buf.equipCompat;
    const cfg = getConfig();
    const maxLevel = cfg.fusionDepth;
    const mmId = cfg.megamorphId;
    const mmBonus = cfg.megamorphBonus;
    const stdBonus = cfg.equipBonus;

    // Copy hand into level 0
    for (let i = 0; i < 5; i++) {
      sb[i] = hand[i] ?? 0;
    }

    // Direct plays: base ATK + all compatible equip bonuses from other hand cards
    let maxAtk = 0;
    for (let i = 0; i < 5; i++) {
      const id = sb[i] ?? 0;
      let effective = atk[id] ?? 0;
      for (let j = 0; j < 5; j++) {
        if (j === i) continue;
        const eqId = sb[j] ?? 0;
        if (ec[eqId * MAX_CARD_ID + id]) {
          effective += equipBonus(eqId, mmId, mmBonus, stdBonus);
        }
      }
      if (effective > maxAtk) maxAtk = effective;
    }

    maxAtk = this.dfs(sb, ft, atk, ec, 0, 5, maxAtk, maxLevel, mmId, mmBonus, stdBonus);
    return maxAtk;
  }

  private dfs(
    sb: Int16Array,
    ft: Int16Array,
    atk: Int16Array,
    ec: Uint8Array,
    level: number,
    handSize: number,
    maxAtk: number,
    maxLevel: number,
    mmId: number,
    mmBonus: number,
    stdBonus: number,
  ): number {
    const base = level * 5;

    for (let i = 0; i < handSize - 1; i++) {
      const cardA = sb[base + i] ?? 0;
      for (let j = i + 1; j < handSize; j++) {
        // FM rule: after the first fusion, one material must be the previous
        // result (always the last element — see copy loop below).
        if (level > 0 && j !== handSize - 1) continue;

        const cardB = sb[base + j] ?? 0;

        const result = ft[cardA * MAX_CARD_ID + cardB] ?? FUSION_NONE;
        if (result === FUSION_NONE) continue;

        // Effective ATK = fusion result + all compatible equip bonuses from remaining cards
        const resultAtk = atk[result] ?? 0;
        let effective = resultAtk;
        for (let k = 0; k < handSize; k++) {
          if (k === i || k === j) continue;
          const eqId = sb[base + k] ?? 0;
          if (ec[eqId * MAX_CARD_ID + result]) {
            effective += equipBonus(eqId, mmId, mmBonus, stdBonus);
          }
        }
        if (effective > maxAtk) maxAtk = effective;

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

        maxAtk = this.dfs(
          sb,
          ft,
          atk,
          ec,
          level + 1,
          newHandSize,
          maxAtk,
          maxLevel,
          mmId,
          mmBonus,
          stdBonus,
        );
      }
    }

    return maxAtk;
  }
}

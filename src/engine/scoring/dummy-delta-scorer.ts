import { HAND_SIZE, NUM_HANDS } from "../types/constants.ts";
import type { IDeltaScorer, IScorer } from "../types/interfaces.ts";

export class DummyDeltaScorer implements IDeltaScorer {
  private readonly pendingScores = new Int16Array(NUM_HANDS);
  private readonly pendingIds = new Uint16Array(NUM_HANDS);
  private pendingCount = 0;
  private readonly handBuf = new Uint16Array(5);

  computeDelta(
    deck: Int16Array,
    slotIndex: number,
    handIndices: Uint8Array,
    handScores: Int16Array,
    affectedHandIds: Uint16Array,
    affectedHandOffsets: Uint32Array,
    affectedHandCounts: Uint16Array,
    fusionTable: Int16Array,
    cardAtk: Int16Array,
    scorer: IScorer,
  ): number {
    const count = affectedHandCounts[slotIndex] ?? 0;
    const offset = affectedHandOffsets[slotIndex] ?? 0;
    let delta = 0;
    this.pendingCount = 0;

    for (let i = 0; i < count; i++) {
      const handId = affectedHandIds[offset + i] ?? 0;
      const handBase = handId * HAND_SIZE;

      for (let j = 0; j < HAND_SIZE; j++) {
        this.handBuf[j] = deck[handIndices[handBase + j] ?? 0] ?? 0;
      }

      const newScore = scorer.evaluateHand(this.handBuf, fusionTable, cardAtk);
      delta += newScore - (handScores[handId] ?? 0);

      this.pendingIds[this.pendingCount] = handId;
      this.pendingScores[this.pendingCount] = newScore;
      this.pendingCount++;
    }

    return delta;
  }

  commitDelta(handScores: Int16Array): void {
    for (let i = 0; i < this.pendingCount; i++) {
      handScores[this.pendingIds[i] ?? 0] = this.pendingScores[i] ?? 0;
    }
    this.pendingCount = 0;
  }
}

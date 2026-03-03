import type { OptBuffers } from "../types/buffers.ts";
import { HAND_SIZE, NUM_HANDS } from "../types/constants.ts";
import type { IDeltaEvaluator, IScorer } from "../types/interfaces.ts";

/**
 * Incremental delta evaluator: re-evaluates only the ~1,875 hands (avg)
 * affected by a single deck-slot swap, instead of all 15,000.
 */
export class DeltaEvaluator implements IDeltaEvaluator {
  private readonly pendingScores = new Int16Array(NUM_HANDS);
  private readonly pendingIds = new Uint16Array(NUM_HANDS);
  private pendingCount = 0;
  /** Reusable 5-card buffer to avoid allocations when resolving card IDs. */
  private readonly handBuf = new Uint16Array(5);

  computeDelta(slotIndex: number, buf: OptBuffers, scorer: IScorer): number {
    const count = buf.affectedHandCounts[slotIndex] ?? 0;
    const offset = buf.affectedHandOffsets[slotIndex] ?? 0;
    let delta = 0;
    this.pendingCount = 0;

    for (let i = 0; i < count; i++) {
      const handId = buf.affectedHandIds[offset + i] ?? 0;
      const handBase = handId * HAND_SIZE;

      // Resolve hand's deck-slot indices into actual card IDs from the (mutated) deck
      for (let j = 0; j < HAND_SIZE; j++) {
        this.handBuf[j] = buf.deck[buf.handSlots[handBase + j] ?? 0] ?? 0;
      }

      const newScore = scorer.evaluateHand(this.handBuf, buf);
      delta += newScore - (buf.handScores[handId] ?? 0);

      // Stage the new score (don't write to handScores yet — swap may be rejected)
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

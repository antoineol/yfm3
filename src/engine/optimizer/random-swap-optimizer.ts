import { DECK_SIZE, MAX_CARD_ID } from "../types/constants.ts";
import type { IDeltaScorer, IOptimizer, IScorer } from "../types/interfaces.ts";

export class RandomSwapOptimizer implements IOptimizer {
  run(
    deck: Int16Array,
    cardCounts: Uint8Array,
    availableCounts: Uint8Array,
    handIndices: Uint8Array,
    handScores: Int16Array,
    affectedHandIds: Uint16Array,
    affectedHandOffsets: Uint32Array,
    affectedHandCounts: Uint16Array,
    fusionTable: Int16Array,
    cardAtk: Int16Array,
    scorer: IScorer,
    deltaScorer: IDeltaScorer,
    maxIterations: number,
  ): number {
    let totalScore = 0;
    for (let i = 0; i < handScores.length; i++) {
      totalScore += handScores[i] ?? 0;
    }

    for (let iter = 0; iter < maxIterations; iter++) {
      const slot = (Math.random() * DECK_SIZE) | 0;
      const oldCard = deck[slot] ?? 0;

      const newCard = (Math.random() * MAX_CARD_ID) | 0;
      if (newCard === oldCard) continue;
      if ((cardCounts[newCard] ?? 0) >= (availableCounts[newCard] ?? 0)) continue;

      deck[slot] = newCard;
      cardCounts[oldCard] = (cardCounts[oldCard] ?? 1) - 1;
      cardCounts[newCard] = (cardCounts[newCard] ?? 0) + 1;

      const delta = deltaScorer.computeDelta(
        deck,
        slot,
        handIndices,
        handScores,
        affectedHandIds,
        affectedHandOffsets,
        affectedHandCounts,
        fusionTable,
        cardAtk,
        scorer,
      );

      if (delta > 0) {
        deltaScorer.commitDelta(handScores);
        totalScore += delta;
      } else {
        deck[slot] = oldCard;
        cardCounts[newCard] = (cardCounts[newCard] ?? 1) - 1;
        cardCounts[oldCard] = (cardCounts[oldCard] ?? 0) + 1;
      }
    }

    return totalScore;
  }
}

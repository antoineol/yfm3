export interface IScorer {
  evaluateHand(hand: Uint16Array, fusionTable: Int16Array, cardAtk: Int16Array): number;
}

export interface IDeltaScorer {
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
  ): number;

  /** Write pending scores into handScores. Call ONLY after accepting a move. */
  commitDelta(handScores: Int16Array): void;
}

export interface IOptimizer {
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
  ): number;
}

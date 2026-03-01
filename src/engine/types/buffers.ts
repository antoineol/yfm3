import { DECK_SIZE, HAND_SIZE, MAX_CARD_ID, NUM_HANDS } from "./constants.ts";

export interface OptBuffers {
  readonly fusionTable: Int16Array;
  readonly cardAtk: Int16Array;
  readonly deck: Int16Array;
  readonly cardCounts: Uint8Array;
  readonly availableCounts: Uint8Array;
  readonly handIndices: Uint8Array;
  readonly handScores: Int16Array;
  readonly affectedHandIds: Uint16Array;
  readonly affectedHandOffsets: Uint32Array;
  readonly affectedHandCounts: Uint16Array;
}

export function createBuffers(): OptBuffers {
  return {
    fusionTable: new Int16Array(MAX_CARD_ID * MAX_CARD_ID),
    cardAtk: new Int16Array(MAX_CARD_ID),
    deck: new Int16Array(DECK_SIZE),
    cardCounts: new Uint8Array(MAX_CARD_ID),
    availableCounts: new Uint8Array(MAX_CARD_ID),
    handIndices: new Uint8Array(NUM_HANDS * HAND_SIZE),
    handScores: new Int16Array(NUM_HANDS),
    affectedHandIds: new Uint16Array(NUM_HANDS * HAND_SIZE),
    affectedHandOffsets: new Uint32Array(DECK_SIZE),
    affectedHandCounts: new Uint16Array(DECK_SIZE),
  };
}

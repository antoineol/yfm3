import { DECK_SIZE, HAND_SIZE, MAX_CARD_ID, NUM_HANDS } from "./constants.ts";

/**
 * All pre-allocated typed-array buffers used by the optimizer.
 * Grouped into three categories:
 *   1. Game data lookups (fusionTable, cardAtk)
 *   2. Deck state (deck, cardCounts, availableCounts)
 *   3. Monte Carlo hand sampling & reverse lookup (handSlots, handScores, affected*)
 */
export interface OptBuffers {
  /** Flat 722x722 fusion lookup. fusionTable[a * 722 + b] = result card ID, or -1 if no fusion. */
  readonly fusionTable: Int16Array;
  /** cardAtk[cardId] = base attack value of that card. */
  readonly cardAtk: Int16Array;
  /** The current 40-card deck, stored as card IDs. Mutated during optimization. */
  readonly deck: Int16Array;
  /** cardCounts[cardId] = how many copies of that card are currently in the deck. */
  readonly cardCounts: Uint8Array;
  /** availableCounts[cardId] = how many copies the player owns (upper bound for cardCounts). */
  readonly availableCounts: Uint8Array;
  /** Flat array of NUM_HANDS * 5 deck-slot indices (0..39). Each group of 5 is one sampled hand. */
  readonly handSlots: Uint8Array;
  /** handScores[h] = best attack achievable from hand h under the current deck. */
  readonly handScores: Int16Array;
  /**
   * Reverse lookup: for each deck slot, which hand IDs reference it.
   * Read via affectedHandOffsets and affectedHandCounts.
   */
  readonly affectedHandIds: Uint16Array;
  /** affectedHandOffsets[slot] = start index in affectedHandIds for this deck slot. */
  readonly affectedHandOffsets: Uint32Array;
  /** affectedHandCounts[slot] = number of hands that reference this deck slot. */
  readonly affectedHandCounts: Uint16Array;
}

/** Allocate all optimizer buffers (zero-initialized by typed-array constructors). */
export function createBuffers(): OptBuffers {
  return {
    fusionTable: new Int16Array(MAX_CARD_ID * MAX_CARD_ID),
    cardAtk: new Int16Array(MAX_CARD_ID),
    deck: new Int16Array(DECK_SIZE),
    cardCounts: new Uint8Array(MAX_CARD_ID),
    availableCounts: new Uint8Array(MAX_CARD_ID),
    handSlots: new Uint8Array(NUM_HANDS * HAND_SIZE),
    handScores: new Int16Array(NUM_HANDS),
    affectedHandIds: new Uint16Array(NUM_HANDS * HAND_SIZE),
    affectedHandOffsets: new Uint32Array(DECK_SIZE),
    affectedHandCounts: new Uint16Array(DECK_SIZE),
  };
}

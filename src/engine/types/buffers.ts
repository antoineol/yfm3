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
  /**
   * Flat array of NUM_HANDS * 5 deck-slot indices (0..39).
   * Each group of 5 is one sampled hand, stored as slot positions — NOT card IDs.
   * To get the actual card: `deck[handSlots[h * 5 + j]]`.
   * Slot-based storage means hands never need regeneration when the deck mutates (CRN technique).
   */
  readonly handSlots: Uint8Array;
  /** handScores[h] = best attack achievable from hand h under the current deck. */
  readonly handScores: Int16Array;
  /**
   * Reverse lookup (CSR layout): maps each deck slot to the hands that reference it.
   * When slot `s` changes, only hands in affectedHandIds[offset..offset+count] need rescoring
   * (where offset = affectedHandOffsets[s], count = affectedHandCounts[s]).
   */
  readonly affectedHandIds: Uint16Array;
  /** affectedHandOffsets[slot] = start index in affectedHandIds for this slot's segment. */
  readonly affectedHandOffsets: Uint32Array;
  /** affectedHandCounts[slot] = number of hands referencing this slot (~1,875 avg). */
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

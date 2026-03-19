/** Exclusive upper bound for card IDs (cards are 1..722). Used to size flat lookup tables. */
export const MAX_CARD_ID = 723;

/** A valid deck contains exactly 40 cards. */
export const DECK_SIZE = 40;

/** Opening hand draws 5 cards from the deck. */
export const HAND_SIZE = 5;

/** Number of random hands sampled for Monte Carlo scoring. ~15k balances accuracy vs speed. */
export const NUM_HANDS = 15_000;

/** Maximum copies of a single card allowed in a deck. */
export const MAX_COPIES = 3;

/** A deck position (0..39). */
export type SlotIndex = number;

/** Default fusion chain depth (number of fusions per hand evaluation). */
export const DEFAULT_FUSION_DEPTH = 3;

/** Maximum supported fusion depth (used for buffer pre-allocation). */
export const MAX_FUSION_DEPTH = 4;

/** Sentinel value in the fusion table meaning "no fusion exists for this pair". */
export const FUSION_NONE = -1;

/**
 * Precomputed C(n, 5) for n = 0..40.
 * Used to determine the total number of 5-card hands for a given deck size.
 */
// prettier-ignore
export const CHOOSE_5: readonly number[] = [
  0,
  0,
  0,
  0,
  0, // n = 0..4
  1,
  6,
  21,
  56,
  126, // n = 5..9
  252,
  462,
  792,
  1287,
  2002, // n = 10..14
  3003,
  4368,
  6188,
  8568,
  11628, // n = 15..19
  15504,
  20349,
  26334,
  33649,
  42504, // n = 20..24
  53130,
  65780,
  80730,
  98280,
  118755, // n = 25..29
  142506,
  169911,
  201376,
  237336,
  278256, // n = 30..34
  324632,
  376992,
  435897,
  501942,
  575757, // n = 35..39
  658008, // n = 40
];

/** Total number of distinct card IDs in the game (0..721). Used to size flat lookup tables. */
export const MAX_CARD_ID = 722;

/** A valid deck contains exactly 40 cards. */
export const DECK_SIZE = 40;

/** Opening hand draws 5 cards from the deck. */
export const HAND_SIZE = 5;

/** Number of random hands sampled for Monte Carlo scoring. ~15k balances accuracy vs speed. */
export const NUM_HANDS = 15_000;

/** Maximum copies of a single card allowed in a deck. */
export const MAX_COPIES = 3;

/** Sentinel value in the fusion table meaning "no fusion exists for this pair". */
export const FUSION_NONE = -1;

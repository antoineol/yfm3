import { MAX_COPIES } from "../types/constants.ts";
import type { CardId, CardSpec } from "./card-model.ts";

export interface CardDb {
  cards: CardSpec[];
  cardsById: Map<CardId, CardSpec>;
  cardsByName: Map<string, CardSpec>;
  /**
   * Per-card deck-copy cap (1, 2, or 3). Sparse — cards absent from this map
   * default to `MAX_COPIES` (3). Populated from the mod's SLUS limit table.
   */
  maxCopiesById: Map<CardId, number>;
}

export function createCardDb(): CardDb {
  return {
    cards: [],
    cardsById: new Map(),
    cardsByName: new Map(),
    maxCopiesById: new Map(),
  };
}

/** Look up the deck-copy cap for `cardId` from `db`, falling back to `MAX_COPIES`. */
export function maxCopiesFor(db: CardDb, cardId: CardId): number {
  return db.maxCopiesById.get(cardId) ?? MAX_COPIES;
}

export function addCard(cardDb: CardDb, card: CardSpec) {
  if (!card.id || !card.name) {
    throw new Error("CardSpec must have an id and a name");
  }
  if (cardDb.cardsById.has(card.id)) {
    throw new Error("CardSpec already exists");
  }
  cardDb.cards.push(card);
  cardDb.cardsById.set(card.id, card);
  cardDb.cardsByName.set(card.name, card);
}

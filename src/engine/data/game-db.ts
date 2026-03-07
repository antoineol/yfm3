import type { CardId, CardSpec } from "./card-model.ts";

export interface CardDb {
  cards: CardSpec[];
  cardsById: Map<CardId, CardSpec>;
  cardsByName: Map<string, CardSpec>;
}

export function createCardDb(): CardDb {
  return {
    cards: [],
    cardsById: new Map(),
    cardsByName: new Map(),
  };
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

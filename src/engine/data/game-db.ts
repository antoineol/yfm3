import type { CardId, CardSpec, FusionMaterials } from "./card-model.ts";
import { generateNextId } from "./id-generator.ts";

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

export function addFusion(cardDb: CardDb, fusion: FusionMaterials) {
  const { name, attack, defense } = fusion;
  let spec = cardDb.cardsByName.get(name);
  if (!spec) {
    spec = {
      id: generateNextId(),
      name,
      kinds: [],
      attack,
      defense,
    };
    addCard(cardDb, spec);
  }
}

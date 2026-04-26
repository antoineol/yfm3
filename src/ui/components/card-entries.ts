import type { CardSpec } from "../../engine/data/card-model.ts";
import type { CardDb } from "../../engine/data/game-db.ts";
import { DECK_SIZE } from "../../engine/types/constants.ts";

export type DiffStatus = "added" | "removed" | "kept";

export interface CardEntry {
  id: number;
  name: string;
  isMonster: boolean;
  cardType?: string;
  atk: number;
  def: number;
  qty: number;
  kind1?: string;
  kind2?: string;
  kind3?: string;
  color?: string;
  diffStatus?: DiffStatus;
  /** Copies available in collection (not in deck). */
  collectionCount?: number;
  /** Copies currently in deck. */
  deckCount?: number;
  /** Starchip cost (used by the Starchip view). */
  cost?: number;
  /** Render the row at reduced opacity without filtering it out. */
  dimmed?: boolean;
  /** Unique key for React when multiple rows share the same card id. */
  rowKey?: string;
}

export function buildCardEntries(
  idQtyPairs: Iterable<[number, number]>,
  cardDb: CardDb,
): CardEntry[] {
  const entries: CardEntry[] = [];
  for (const [id, qty] of idQtyPairs) {
    const card: CardSpec | undefined = cardDb.cardsById.get(id);
    entries.push({
      id,
      name: card?.name ?? `#${id}`,
      isMonster: card?.isMonster ?? true,
      cardType: card?.cardType,
      atk: card?.attack ?? 0,
      def: card?.defense ?? 0,
      qty,
      kind1: card?.kinds[0],
      kind2: card?.kinds[1],
      kind3: card?.kinds[2],
      color: card?.color,
    });
  }
  return entries.sort((a, b) => b.atk - a.atk);
}

/** One CardEntry per element in `ids` (duplicates produce separate rows, each with qty 1). */
export function buildFlatEntries(ids: number[], cardDb: CardDb): CardEntry[] {
  const entries: CardEntry[] = [];
  const seenCount = new Map<number, number>();
  for (const id of ids) {
    const idx = seenCount.get(id) ?? 0;
    seenCount.set(id, idx + 1);
    const card: CardSpec | undefined = cardDb.cardsById.get(id);
    entries.push({
      id,
      name: card?.name ?? `#${id}`,
      isMonster: card?.isMonster ?? true,
      cardType: card?.cardType,
      atk: card?.attack ?? 0,
      def: card?.defense ?? 0,
      qty: 1,
      kind1: card?.kinds[0],
      kind2: card?.kinds[1],
      kind3: card?.kinds[2],
      color: card?.color,
      rowKey: `${id}-${idx}`,
    });
  }
  return entries.sort((a, b) => b.atk - a.atk);
}

export function countById(ids: number[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  return counts;
}

const equipTypes = new Set(["Equip", "Équipement"]);

function isUtilityCard(card: CardSpec): boolean {
  return !card.isMonster && !equipTypes.has(card.cardType ?? "");
}

/** Count Magic/Trap/Ritual cards in a deck (non-monster, non-equip). */
export function countUtilityCards(
  deckIds: number[],
  cardsById: ReadonlyMap<number, CardSpec>,
): number {
  let count = 0;
  for (const id of deckIds) {
    const card = cardsById.get(id);
    if (card && isUtilityCard(card)) count++;
  }
  return count;
}

/**
 * Pad a scoring-only deck with utility cards (Magic/Trap/Ritual) from the
 * current deck so the result is a full 40-card deck. This prevents the diff
 * from showing "remove Raigeki" when those cards are outside optimizer scope.
 */
export function padWithUtilityCards(
  scoringDeck: number[],
  currentDeck: number[],
  cardsById: ReadonlyMap<number, CardSpec>,
  scoringSlots: number,
): number[] {
  const utilitySlots = DECK_SIZE - scoringSlots;
  if (utilitySlots <= 0) return scoringDeck;

  const scoringCounts = countById(scoringDeck);
  const currentCounts = countById(currentDeck);
  const utilityCards: number[] = [];

  for (const [id, curQty] of currentCounts) {
    if (utilityCards.length >= utilitySlots) break;
    const card = cardsById.get(id);
    if (!card || !isUtilityCard(card)) continue;
    const surplus = curQty - (scoringCounts.get(id) ?? 0);
    for (let i = 0; i < surplus && utilityCards.length < utilitySlots; i++) {
      utilityCards.push(id);
    }
  }

  return [...scoringDeck, ...utilityCards];
}

/* ── Card-type border colors (matches GameCard frame palettes) ── */

const typeBorderColors: Record<string, string> = {
  Magic: "#308838",
  Equip: "#308838",
  Trap: "#c04888",
  Ritual: "#2858c0",
};
const monsterBorderColor = "#b89838";

export function cardTypeBorderColor(cardType?: string, isMonster?: boolean): string {
  if (cardType && typeBorderColors[cardType]) return typeBorderColors[cardType];
  if (isMonster !== false) return monsterBorderColor;
  return monsterBorderColor;
}

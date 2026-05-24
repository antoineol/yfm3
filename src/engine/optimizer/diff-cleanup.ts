import type { OptBuffers } from "../types/buffers.ts";
import { MAX_CARD_ID } from "../types/constants.ts";
import type { IDeltaEvaluator, IScorer } from "../types/interfaces.ts";

/**
 * Revert noisy full-rebuild changes back toward the current deck when the sampled
 * score does not decrease. The caller should exact-validate the cleaned deck.
 */
export function cleanupDeckAgainstCurrent(
  buf: OptBuffers,
  scorer: IScorer,
  deltaEvaluator: IDeltaEvaluator,
  currentDeck: readonly number[],
  score: number,
  deadline: number,
): number {
  if (currentDeck.length < buf.scoringSlots) return score;

  const targetCounts = countCards(currentDeck);

  while (performance.now() < deadline) {
    let acceptedInPass = false;

    for (let slot = 0; slot < buf.scoringSlots; slot++) {
      if (performance.now() >= deadline) return score;

      const oldCard = buf.deck[slot] ?? 0;
      if (!isExcess(buf, targetCounts, oldCard)) continue;

      const accepted = tryRevertSlot(buf, scorer, deltaEvaluator, targetCounts, slot);
      if (accepted == null) continue;

      score += accepted;
      acceptedInPass = true;
      break;
    }

    if (!acceptedInPass) return score;
  }

  return score;
}

function tryRevertSlot(
  buf: OptBuffers,
  scorer: IScorer,
  deltaEvaluator: IDeltaEvaluator,
  targetCounts: Uint8Array,
  slot: number,
): number | null {
  const oldCard = buf.deck[slot] ?? 0;

  for (let newCard = 1; newCard < MAX_CARD_ID; newCard++) {
    if (!isMissingFromCurrent(buf, targetCounts, newCard)) continue;
    if (!canAddCard(buf, newCard)) continue;

    applySwap(buf, slot, oldCard, newCard);
    const delta = deltaEvaluator.computeDelta(slot, buf, scorer);
    if (delta >= 0) {
      deltaEvaluator.commitDelta(buf.handScores);
      return delta;
    }
    applySwap(buf, slot, newCard, oldCard);
  }

  return null;
}

function countCards(deck: readonly number[]): Uint8Array {
  const counts = new Uint8Array(MAX_CARD_ID);
  for (const cardId of deck) {
    if (cardId > 0 && cardId < MAX_CARD_ID) counts[cardId] = (counts[cardId] ?? 0) + 1;
  }
  return counts;
}

function isExcess(buf: OptBuffers, targetCounts: Uint8Array, cardId: number): boolean {
  return cardId > 0 && (buf.cardCounts[cardId] ?? 0) > (targetCounts[cardId] ?? 0);
}

function isMissingFromCurrent(buf: OptBuffers, targetCounts: Uint8Array, cardId: number): boolean {
  return (buf.cardCounts[cardId] ?? 0) < (targetCounts[cardId] ?? 0);
}

function canAddCard(buf: OptBuffers, cardId: number): boolean {
  return (buf.cardCounts[cardId] ?? 0) < (buf.availableCounts[cardId] ?? 0);
}

function applySwap(buf: OptBuffers, slot: number, oldCard: number, newCard: number): void {
  buf.deck[slot] = newCard;
  buf.cardCounts[oldCard] = (buf.cardCounts[oldCard] ?? 0) - 1;
  buf.cardCounts[newCard] = (buf.cardCounts[newCard] ?? 0) + 1;
}

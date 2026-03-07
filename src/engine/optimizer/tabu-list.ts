import { DECK_SIZE } from "../types/constants.ts";

const TABU_SIZE = 8;

/**
 * Per-slot ring buffer tracking the last 8 rejected cards per slot.
 * Prevents the SA loop from re-trying recently rejected candidates.
 */
export function createTabuList() {
  const buffer = new Uint16Array(DECK_SIZE * TABU_SIZE);
  const index = new Uint8Array(DECK_SIZE);

  function isTabu(slot: number, cardId: number): boolean {
    const base = slot * TABU_SIZE;
    for (let i = 0; i < TABU_SIZE; i++) {
      if (buffer[base + i] === cardId) return true;
    }
    return false;
  }

  function addTabu(slot: number, cardId: number): void {
    const base = slot * TABU_SIZE;
    buffer[base + (index[slot] ?? 0)] = cardId;
    index[slot] = ((index[slot] ?? 0) + 1) % TABU_SIZE;
  }

  return { isTabu, addTabu };
}

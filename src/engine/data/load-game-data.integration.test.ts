import { describe, expect, it } from "vitest";
import { createBuffers } from "../types/buffers.ts";
import { FUSION_NONE, MAX_CARD_ID } from "../types/constants.ts";
import { loadGameData } from "./load-game-data.ts";

// ---------------------------------------------------------------------------
// loadGameData integration tests (binary CSV data)
// ---------------------------------------------------------------------------

describe("loadGameData", () => {
  it("returns all 722 cards with IDs in range", () => {
    const buf = createBuffers();
    const cards = loadGameData(buf);

    expect(cards.length).toBe(722);
    for (const card of cards) {
      expect(card.id).toBeGreaterThan(0);
      expect(card.id).toBeLessThan(MAX_CARD_ID);
    }
  });

  it("populates cardAtk for all returned cards", () => {
    const buf = createBuffers();
    const cards = loadGameData(buf);

    for (const card of cards) {
      expect(buf.cardAtk[card.id]).toBe(card.attack);
    }
  });

  it("fusion results all have IDs within buffer bounds", () => {
    const buf = createBuffers();
    loadGameData(buf);

    for (let i = 0; i < MAX_CARD_ID * MAX_CARD_ID; i++) {
      const resultId = buf.fusionTable[i] ?? 0;
      if (resultId === FUSION_NONE) continue;
      expect(resultId).toBeGreaterThan(0);
      expect(resultId).toBeLessThan(MAX_CARD_ID);
    }
  });

  it("enables chain fusions", () => {
    const buf = createBuffers();
    loadGameData(buf);

    let chainFound = false;
    for (let a = 1; a < MAX_CARD_ID && !chainFound; a++) {
      if ((buf.cardAtk[a] ?? 0) <= 0) continue;
      for (let b = a + 1; b < MAX_CARD_ID && !chainFound; b++) {
        if ((buf.cardAtk[b] ?? 0) <= 0) continue;
        const r = buf.fusionTable[a * MAX_CARD_ID + b] ?? FUSION_NONE;
        if (r === FUSION_NONE) continue;
        for (let c = 1; c < MAX_CARD_ID; c++) {
          const r2 = buf.fusionTable[r * MAX_CARD_ID + c] ?? FUSION_NONE;
          if (r2 !== FUSION_NONE) {
            chainFound = true;
            break;
          }
        }
      }
    }
    expect(chainFound).toBe(true);
  });
});

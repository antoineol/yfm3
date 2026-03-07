import { describe, expect, it } from "vitest";
import { createBuffers } from "../types/buffers.ts";
import { FUSION_NONE, MAX_CARD_ID } from "../types/constants.ts";
import { loadGameData } from "./load-game-data.ts";

// ---------------------------------------------------------------------------
// loadGameData integration tests (real CSV data)
// ---------------------------------------------------------------------------

describe("loadGameData", () => {
  it("returns only base cards (not fusion-only)", () => {
    const buf = createBuffers();
    const baseCards = loadGameData(buf);

    // All returned IDs in range
    for (const card of baseCards) {
      expect(card.id).toBeGreaterThan(0);
      expect(card.id).toBeLessThan(MAX_CARD_ID);
    }

    // More cards have ATK in the buffer than were returned
    let cardsWithAtk = 0;
    for (let i = 0; i < MAX_CARD_ID; i++) {
      if ((buf.cardAtk[i] ?? 0) > 0) cardsWithAtk++;
    }
    expect(cardsWithAtk).toBeGreaterThan(baseCards.length);
  });

  it("populates cardAtk for both base and fusion-only cards", () => {
    const buf = createBuffers();
    loadGameData(buf);

    // Every fusion result in the table has valid ATK
    for (let i = 0; i < MAX_CARD_ID * MAX_CARD_ID; i++) {
      const resultId = buf.fusionTable[i] ?? 0;
      if (resultId === FUSION_NONE) continue;
      expect(buf.cardAtk[resultId] ?? 0).toBeGreaterThan(0);
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

  it("enables chain fusions through fusion-only intermediates", () => {
    const buf = createBuffers();
    loadGameData(buf);

    // Find at least one chain: base+base→fusionOnly, fusionOnly+x→y
    let chainFound = false;
    for (let a = 1; a < MAX_CARD_ID && !chainFound; a++) {
      if ((buf.cardAtk[a] ?? 0) <= 0) continue;
      for (let b = a + 1; b < MAX_CARD_ID && !chainFound; b++) {
        if ((buf.cardAtk[b] ?? 0) <= 0) continue;
        const r = buf.fusionTable[a * MAX_CARD_ID + b] ?? FUSION_NONE;
        if (r === FUSION_NONE) continue;
        // Check if r can fuse further
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

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createBuffers } from "../types/buffers.ts";
import { MAX_CARD_ID } from "../types/constants.ts";
import { loadGameData, loadGameDataFromStrings } from "./load-game-data.ts";

const DATA_DIR = path.resolve(import.meta.dirname, "../../../public/data");

describe("loadGameDataFromStrings", () => {
  it("produces identical buffers and cards as loadGameData", () => {
    const buf1 = createBuffers();
    const cards1 = loadGameData(buf1);

    const cardsCsv = fs.readFileSync(path.join(DATA_DIR, "cards.csv"), "utf-8");
    const fusionsCsv = fs.readFileSync(path.join(DATA_DIR, "fusions.csv"), "utf-8");

    const buf2 = createBuffers();
    const cards2 = loadGameDataFromStrings(buf2, cardsCsv, fusionsCsv);

    expect(cards2.map((c) => c.id)).toEqual(cards1.map((c) => c.id));
    expect(cards2.map((c) => c.attack)).toEqual(cards1.map((c) => c.attack));
    expect(Array.from(buf2.cardAtk)).toEqual(Array.from(buf1.cardAtk));
    expect(Array.from(buf2.fusionTable)).toEqual(Array.from(buf1.fusionTable));
  });

  it("loads all 722 cards and populates cardAtk", () => {
    const buf = createBuffers();
    const cards = loadGameData(buf);

    expect(cards.length).toBe(722);
    // Card 1: Baby Dragon, ATK=1200 (from binary CSV)
    expect(buf.cardAtk[1]).toBe(1200);
    // Card 2: ATK=1400
    expect(buf.cardAtk[2]).toBe(1400);
  });

  it("parses card names from CSV", () => {
    const buf = createBuffers();
    const cards = loadGameData(buf);

    const card1 = cards.find((c) => c.id === 1);
    expect(card1?.name).toBe("Baby Dragon");

    const card11 = cards.find((c) => c.id === 11);
    expect(card11?.name).toBe("Lord Of D.");
  });

  it("parses card names containing commas", () => {
    const buf = createBuffers();
    const cards = loadGameData(buf);

    const card192 = cards.find((c) => c.id === 192);
    expect(card192).toBeDefined();
    expect(card192?.name).toBe("Gandora, The Destroyer");
    expect(card192?.attack).toBe(3000);

    const card41 = cards.find((c) => c.id === 41);
    expect(card41?.name).toBe("Dan, The Man");
  });

  it("populates fusion table with known binary fusions", () => {
    const buf = createBuffers();
    loadGameData(buf);

    // Binary: material1=1, material2=156, result=186 (symmetric)
    expect(buf.fusionTable[1 * MAX_CARD_ID + 156]).toBe(186);
    expect(buf.fusionTable[156 * MAX_CARD_ID + 1]).toBe(186);
  });
});

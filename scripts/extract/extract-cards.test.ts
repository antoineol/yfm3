import { describe, expect, it } from "vitest";
import { extractCards } from "./extract-cards.ts";
import type { ExeLayout, WaMrgLayout } from "./types.ts";
import { NUM_CARDS } from "./types.ts";

// We disable text parsing by setting offsets to -1 and providing no text blocks.
// This lets us focus on bit-field extraction and starchip decoding.
const exeLayout: ExeLayout = {
  cardStats: 0x000,
  levelAttr: NUM_CARDS * 4, // right after card stats
  nameOffsetTable: -1,
  textPoolBase: -1,
  descOffsetTable: -1,
  descTextPoolBase: -1,
  duelistNames: -1,
};

const STARCHIP_OFFSET = 0x0;
const waMrgLayout: WaMrgLayout = {
  fusionTable: 0,
  equipTable: 0,
  starchipTable: STARCHIP_OFFSET,
  duelistTable: 0,
  artworkBlockSize: 0x3800,
};

const defaultAttributes: Record<number, string> = {
  0: "Light",
  1: "Dark",
  2: "Earth",
  3: "Water",
  4: "Fire",
  5: "Wind",
};

/**
 * Encode a card stat uint32:
 *   bits 0-8: atk/10, bits 9-17: def/10,
 *   bits 18-21: gs2, bits 22-25: gs1, bits 26-30: type
 */
function encodeCardStat(
  atk10: number,
  def10: number,
  gs2: number,
  gs1: number,
  type: number,
): number {
  return (
    (atk10 & 0x1ff) |
    ((def10 & 0x1ff) << 9) |
    ((gs2 & 0xf) << 18) |
    ((gs1 & 0xf) << 22) |
    ((type & 0x1f) << 26)
  );
}

function makeSlus(cardStats: number[], levelAttrs: number[]): Buffer {
  const statsSize = NUM_CARDS * 4;
  const laSize = NUM_CARDS;
  const buf = Buffer.alloc(statsSize + laSize);
  for (let i = 0; i < NUM_CARDS; i++) {
    buf.writeUInt32LE(cardStats[i] ?? 0, i * 4);
    buf[statsSize + i] = levelAttrs[i] ?? 0;
  }
  return buf;
}

function makeWaMrg(starchips: { cost: number; passwordBytes: number }[]): Buffer {
  const buf = Buffer.alloc(NUM_CARDS * 8);
  for (let i = 0; i < NUM_CARDS; i++) {
    const sc = starchips[i];
    if (sc) {
      buf.writeUInt32LE(sc.cost, i * 8);
      buf.writeUInt32LE(sc.passwordBytes, i * 8 + 4);
    }
  }
  return buf;
}

describe("extractCards — bit-field extraction", () => {
  it("extracts atk, def, guardian stars, and type from packed uint32", () => {
    // Card 1: atk=3000 (300/10=300), def=2500 (250), gs1=Sun(8), gs2=Moon(9), type=Dragon(0)
    const stat = encodeCardStat(300, 250, 9, 8, 0);
    const levelAttr = 8 | (0 << 4); // level=8, attribute index=0 (Light)

    const slus = makeSlus([stat], [levelAttr]);
    const waMrg = makeWaMrg([{ cost: 0, passwordBytes: 0xfffffffe }]);

    const cards = extractCards(slus, waMrg, exeLayout, waMrgLayout, defaultAttributes, []);
    const card = cards[0];

    expect(card?.id).toBe(1);
    expect(card?.atk).toBe(3000);
    expect(card?.def).toBe(2500);
    expect(card?.gs1).toBe("Sun");
    expect(card?.gs2).toBe("Moon");
    expect(card?.type).toBe("Dragon");
    expect(card?.level).toBe(8);
    expect(card?.attribute).toBe("Light");
  });

  it("extracts non-monster card (type >= 20) with zero atk/def", () => {
    // Magic card: type=20, atk=0, def=0, gs1=None(0), gs2=None(0)
    const stat = encodeCardStat(0, 0, 0, 0, 20);
    const levelAttr = 0; // level=0, attribute index=0

    const slus = makeSlus([stat], [levelAttr]);
    const waMrg = makeWaMrg([{ cost: 100, passwordBytes: 0xfffffffe }]);

    const cards = extractCards(slus, waMrg, exeLayout, waMrgLayout, defaultAttributes, []);
    const card = cards[0];

    expect(card?.atk).toBe(0);
    expect(card?.def).toBe(0);
    expect(card?.type).toBe("Magic");
    expect(card?.level).toBe(0);
  });

  it("handles various card types", () => {
    const types: [number, string][] = [
      [1, "Spellcaster"],
      [3, "Warrior"],
      [14, "Machine"],
      [21, "Trap"],
      [23, "Equip"],
    ];
    for (const [typeId, typeName] of types) {
      const stat = encodeCardStat(0, 0, 0, 0, typeId);
      const slus = makeSlus([stat], [0]);
      const waMrg = makeWaMrg([]);
      const cards = extractCards(slus, waMrg, exeLayout, waMrgLayout, defaultAttributes, []);
      expect(cards[0]?.type).toBe(typeName);
    }
  });
});

describe("extractCards — starchip/password decoding", () => {
  it("decodes BCD password bytes to string", () => {
    // Password "89631139" in BCD, stored as uint32LE
    // BCD encoding: each nibble is a digit, stored big-endian in the 4 bytes
    // The code reads 4 bytes [b0, b1, b2, b3], reverses to [b3, b2, b1, b0],
    // converts each to 2 hex digits, then strips leading zeros.
    // For password "89631139": hex = 0x89631139
    // Stored as LE: bytes = [0x39, 0x11, 0x63, 0x89]
    // uint32LE = 0x89631139
    const passBytes = 0x89631139;

    const slus = makeSlus([encodeCardStat(0, 0, 0, 0, 0)], [0]);
    const waMrg = makeWaMrg([{ cost: 50000, passwordBytes: passBytes }]);

    const cards = extractCards(slus, waMrg, exeLayout, waMrgLayout, defaultAttributes, []);
    expect(cards[0]?.starchipCost).toBe(50000);
    expect(cards[0]?.password).toBe("89631139");
  });

  it("returns empty password for 0xFFFFFFFE sentinel", () => {
    const slus = makeSlus([encodeCardStat(0, 0, 0, 0, 0)], [0]);
    const waMrg = makeWaMrg([{ cost: 100, passwordBytes: 0xfffffffe }]);

    const cards = extractCards(slus, waMrg, exeLayout, waMrgLayout, defaultAttributes, []);
    expect(cards[0]?.password).toBe("");
  });

  it("strips leading zeros from password", () => {
    // Password "00123456" → "123456"
    const passBytes = 0x00123456;

    const slus = makeSlus([encodeCardStat(0, 0, 0, 0, 0)], [0]);
    const waMrg = makeWaMrg([{ cost: 0, passwordBytes: passBytes }]);

    const cards = extractCards(slus, waMrg, exeLayout, waMrgLayout, defaultAttributes, []);
    expect(cards[0]?.password).toBe("123456");
  });

  it("returns '0' for zero password", () => {
    const slus = makeSlus([encodeCardStat(0, 0, 0, 0, 0)], [0]);
    const waMrg = makeWaMrg([{ cost: 0, passwordBytes: 0 }]);

    const cards = extractCards(slus, waMrg, exeLayout, waMrgLayout, defaultAttributes, []);
    expect(cards[0]?.password).toBe("0");
  });
});

describe("extractCards — level and attribute", () => {
  it("extracts level from low nibble and attribute from high nibble", () => {
    const stat = encodeCardStat(100, 80, 0, 0, 0);
    // level=5, attribute=3 (Water)
    const levelAttr = 5 | (3 << 4);

    const slus = makeSlus([stat], [levelAttr]);
    const waMrg = makeWaMrg([]);

    const cards = extractCards(slus, waMrg, exeLayout, waMrgLayout, defaultAttributes, []);
    expect(cards[0]?.level).toBe(5);
    expect(cards[0]?.attribute).toBe("Water");
  });

  it("falls back to numeric string for unknown attribute", () => {
    const stat = encodeCardStat(0, 0, 0, 0, 0);
    // attribute index = 7, not in defaultAttributes
    const levelAttr = 1 | (7 << 4);

    const slus = makeSlus([stat], [levelAttr]);
    const waMrg = makeWaMrg([]);

    const cards = extractCards(slus, waMrg, exeLayout, waMrgLayout, defaultAttributes, []);
    expect(cards[0]?.attribute).toBe("7");
  });
});

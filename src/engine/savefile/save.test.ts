import { describe, expect, it } from "vitest";
import {
  CARD_QUANTITY_COUNT,
  CARD_QUANTITY_OFFSET,
  getAllCardQuantities,
  getCardQuantity,
  getStarchips,
  grantAllCards,
  loadSave,
  STARCHIPS_OFFSET,
  setCardQuantity,
  setStarchips,
  updateCrcs,
} from "./save.ts";

const CRC1_MSB = 0x253e;
const CRC1_LSB = 0x253f;
const CRC2_MSB = 0x27fe;
const CRC2_LSB = 0x27ff;

function blankBytes(): Uint8Array {
  return new Uint8Array(0x2830);
}

describe("loadSave", () => {
  it("rejects undersized buffers", () => {
    expect(() => loadSave(new Uint8Array(0x100))).toThrow(/too small/);
  });

  it("copies the input so edits do not mutate the caller's buffer", () => {
    const original = blankBytes();
    const save = loadSave(original);
    setCardQuantity(save, 0, 7);
    expect(original[CARD_QUANTITY_OFFSET]).toBe(0);
    expect(save.bytes[CARD_QUANTITY_OFFSET]).toBe(7);
  });
});

describe("card quantities", () => {
  it("reads and writes at the documented offset", () => {
    const save = loadSave(blankBytes());
    setCardQuantity(save, 0, 3);
    setCardQuantity(save, 719, 99);
    expect(getCardQuantity(save, 0)).toBe(3);
    expect(getCardQuantity(save, 719)).toBe(99);
    expect(save.bytes[CARD_QUANTITY_OFFSET]).toBe(3);
    expect(save.bytes[CARD_QUANTITY_OFFSET + 719]).toBe(99);
  });

  it("rejects out-of-range indices and quantities", () => {
    const save = loadSave(blankBytes());
    expect(() => setCardQuantity(save, -1, 1)).toThrow();
    expect(() => setCardQuantity(save, CARD_QUANTITY_COUNT, 1)).toThrow();
    expect(() => setCardQuantity(save, 0, -1)).toThrow();
    expect(() => setCardQuantity(save, 0, 256)).toThrow();
  });

  it("getAllCardQuantities returns 720 bytes", () => {
    const save = loadSave(blankBytes());
    setCardQuantity(save, 5, 12);
    const qs = getAllCardQuantities(save);
    expect(qs.length).toBe(CARD_QUANTITY_COUNT);
    expect(qs[5]).toBe(12);
  });

  it("grantAllCards fills every slot", () => {
    const save = loadSave(blankBytes());
    grantAllCards(save, 5);
    for (let i = 0; i < CARD_QUANTITY_COUNT; i++) {
      expect(save.bytes[CARD_QUANTITY_OFFSET + i]).toBe(5);
    }
    expect(save.bytes[CARD_QUANTITY_OFFSET + CARD_QUANTITY_COUNT]).toBe(0);
  });
});

describe("starchips", () => {
  it("round-trips a 24-bit little-endian value", () => {
    const save = loadSave(blankBytes());
    setStarchips(save, 0x123456);
    expect(getStarchips(save)).toBe(0x123456);
    expect(save.bytes[STARCHIPS_OFFSET]).toBe(0x56);
    expect(save.bytes[STARCHIPS_OFFSET + 1]).toBe(0x34);
    expect(save.bytes[STARCHIPS_OFFSET + 2]).toBe(0x12);
  });

  it("rejects negatives and values above 24 bits", () => {
    const save = loadSave(blankBytes());
    expect(() => setStarchips(save, -1)).toThrow();
    expect(() => setStarchips(save, 0x1000000)).toThrow();
    expect(() => setStarchips(save, 1.5)).toThrow();
  });
});

describe("updateCrcs", () => {
  it("writes zero CRCs for an all-zero buffer", () => {
    const save = loadSave(blankBytes());
    updateCrcs(save);
    expect(save.bytes[CRC1_MSB]).toBe(0);
    expect(save.bytes[CRC1_LSB]).toBe(0);
    expect(save.bytes[CRC2_MSB]).toBe(0);
    expect(save.bytes[CRC2_LSB]).toBe(0);
  });

  it("clears the two reserved zero regions", () => {
    const save = loadSave(blankBytes());
    save.bytes[0x2540] = 0xff;
    save.bytes[0x257f] = 0xff;
    save.bytes[0x2800] = 0xaa;
    save.bytes[0x282f] = 0xaa;
    updateCrcs(save);
    for (let i = 0x2540; i <= 0x257f; i++) expect(save.bytes[i]).toBe(0);
    for (let i = 0x2800; i <= 0x282f; i++) expect(save.bytes[i]).toBe(0);
  });

  it("is idempotent: a second pass produces the same bytes", () => {
    const save = loadSave(blankBytes());
    setCardQuantity(save, 0, 1);
    setStarchips(save, 12345);
    updateCrcs(save);
    const first = Uint8Array.from(save.bytes);
    updateCrcs(save);
    expect(save.bytes).toEqual(first);
  });

  it("produces different CRCs when the covered region changes", () => {
    const save = loadSave(blankBytes());
    updateCrcs(save);
    const before = Uint8Array.from(save.bytes);
    setCardQuantity(save, 0, 1);
    updateCrcs(save);
    expect(save.bytes).not.toEqual(before);
    expect(
      before[CRC1_MSB] === save.bytes[CRC1_MSB] && before[CRC1_LSB] === save.bytes[CRC1_LSB],
    ).toBe(false);
  });
});

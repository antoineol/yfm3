import { describe, expect, test } from "vitest";
import { CHAR_TABLE, decodeTblString, PAL_CHAR_TABLE } from "./extract-game-data.ts";

// ---------------------------------------------------------------------------
// NTSC-U character table (CHAR_TABLE)
// ---------------------------------------------------------------------------

describe("CHAR_TABLE (NTSC-U)", () => {
  test("maps all entries from fmlib-cpp Dict", () => {
    // Complete mapping from fmlib-cpp Data.cpp Dict — the community-canonical
    // NTSC-U character table. All 86 entries (including 3 duplicate glyph slots).
    const fmlibEntries: [number, string][] = [
      [0x00, " "],
      [0x01, "e"],
      [0x02, "t"],
      [0x03, "a"],
      [0x04, "o"],
      [0x05, "i"],
      [0x06, "n"],
      [0x07, "s"],
      [0x08, "r"],
      [0x09, "h"],
      [0x0a, "l"],
      [0x0b, "."],
      [0x0c, "d"],
      [0x0d, "u"],
      [0x0e, "m"],
      [0x0f, "c"],
      [0x10, "g"],
      [0x11, "y"],
      [0x12, "w"],
      [0x13, "f"],
      [0x14, "p"],
      [0x15, "b"],
      [0x16, "k"],
      [0x17, "!"],
      [0x18, "A"],
      [0x19, "v"],
      [0x1a, "I"],
      [0x1b, "'"],
      [0x1c, "T"],
      [0x1d, "S"],
      [0x1e, "M"],
      [0x1f, ","],
      [0x20, "D"],
      [0x21, "O"],
      [0x22, "W"],
      [0x23, "H"],
      [0x24, "Y"],
      [0x25, "E"],
      [0x26, "R"],
      [0x27, "<"],
      [0x28, ">"],
      [0x29, "G"],
      [0x2a, "L"],
      [0x2b, "C"],
      [0x2c, "N"],
      [0x2d, "B"],
      [0x2e, "?"],
      [0x2f, "P"],
      [0x30, "-"],
      [0x31, "F"],
      [0x32, "z"],
      [0x33, "K"],
      [0x34, "j"],
      [0x35, "U"],
      [0x36, "x"],
      [0x37, "q"],
      [0x38, "0"],
      [0x39, "V"],
      [0x3a, "2"],
      [0x3b, "J"],
      [0x3c, "#"],
      [0x3d, "1"],
      [0x3e, "Q"],
      [0x3f, "Z"],
      [0x40, '"'],
      [0x41, "3"],
      [0x42, "5"],
      [0x43, "&"],
      [0x44, "/"],
      [0x45, "7"],
      [0x46, "X"],
      [0x48, ":"],
      [0x4a, "4"],
      [0x4b, ")"],
      [0x4c, "("],
      [0x4e, "6"],
      [0x4f, "$"],
      [0x50, "*"],
      [0x51, ">"],
      [0x54, "<"],
      [0x55, "a"],
      [0x56, "+"],
      [0x57, "8"],
      [0x59, "9"],
      [0x5b, "%"],
    ];

    for (const [idx, ch] of fmlibEntries) {
      expect(CHAR_TABLE[idx]).toBe(ch);
    }
  });

  test("has duplicate glyph slots", () => {
    expect(CHAR_TABLE[0x03]).toBe("a");
    expect(CHAR_TABLE[0x55]).toBe("a");
    expect(CHAR_TABLE[0x27]).toBe("<");
    expect(CHAR_TABLE[0x54]).toBe("<");
    expect(CHAR_TABLE[0x28]).toBe(">");
    expect(CHAR_TABLE[0x51]).toBe(">");
  });
});

// ---------------------------------------------------------------------------
// PAL character table (PAL_CHAR_TABLE)
// ---------------------------------------------------------------------------

describe("PAL_CHAR_TABLE", () => {
  test("has distinct frequency-ordered encoding", () => {
    // PAL frequency ordering differs from NTSC-U (multi-language optimization)
    expect(PAL_CHAR_TABLE[0x00]).toBe(" ");
    expect(PAL_CHAR_TABLE[0x01]).toBe("e");
    expect(PAL_CHAR_TABLE[0x02]).toBe("a");
    expect(PAL_CHAR_TABLE[0x03]).toBe("i");
    expect(PAL_CHAR_TABLE[0x06]).toBe("o");
    expect(PAL_CHAR_TABLE[0x09]).toBe("l");
  });

  test("has accented characters for French", () => {
    expect(PAL_CHAR_TABLE[0x24]).toBe("é");
    expect(PAL_CHAR_TABLE[0x3e]).toBe("à");
    expect(PAL_CHAR_TABLE[0x3f]).toBe("œ");
    expect(PAL_CHAR_TABLE[0x40]).toBe("è");
    expect(PAL_CHAR_TABLE[0x4c]).toBe("ê");
    expect(PAL_CHAR_TABLE[0x51]).toBe("É");
    expect(PAL_CHAR_TABLE[0x69]).toBe("Œ");
  });

  test("has accented characters for German", () => {
    expect(PAL_CHAR_TABLE[0x3d]).toBe("ä");
    expect(PAL_CHAR_TABLE[0x41]).toBe("ü");
    expect(PAL_CHAR_TABLE[0x44]).toBe("ö");
    expect(PAL_CHAR_TABLE[0x4f]).toBe("ß");
  });

  test("has accented characters for Spanish/Italian", () => {
    expect(PAL_CHAR_TABLE[0x42]).toBe("í");
    expect(PAL_CHAR_TABLE[0x43]).toBe("ó");
    expect(PAL_CHAR_TABLE[0x4d]).toBe("ñ");
    expect(PAL_CHAR_TABLE[0x52]).toBe("ú");
  });

  test("has remaining accented characters", () => {
    expect(PAL_CHAR_TABLE[0x56]).toBe("î");
    expect(PAL_CHAR_TABLE[0x59]).toBe("ô");
    expect(PAL_CHAR_TABLE[0x5d]).toBe("â");
    expect(PAL_CHAR_TABLE[0x72]).toBe("ï");
    expect(PAL_CHAR_TABLE[0x77]).toBe("û");
  });
});

// ---------------------------------------------------------------------------
// decodeTblString — core mechanics
// ---------------------------------------------------------------------------

describe("decodeTblString", () => {
  test("decodes NTSC-U text with default table", () => {
    // "Hello" in NTSC-U: H=0x23, e=0x01, l=0x0A, l=0x0A, o=0x04
    const buf = Buffer.from([0x23, 0x01, 0x0a, 0x0a, 0x04, 0xff]);
    expect(decodeTblString(buf, 0, buf.length)).toBe("Hello");
  });

  test("decodes PAL text with explicit table", () => {
    // "Hello" in PAL: H=0x29, e=0x01, l=0x09, l=0x09, o=0x06
    const buf = Buffer.from([0x29, 0x01, 0x09, 0x09, 0x06, 0xff]);
    expect(decodeTblString(buf, 0, buf.length, PAL_CHAR_TABLE)).toBe("Hello");
  });

  test("stops at 0xFF terminator", () => {
    const buf = Buffer.from([0x23, 0x01, 0xff, 0x04, 0x04]);
    expect(decodeTblString(buf, 0, buf.length)).toBe("He");
  });

  test("converts 0xFE to newline", () => {
    const buf = Buffer.from([0x23, 0x05, 0xfe, 0x23, 0x05, 0xff]);
    expect(decodeTblString(buf, 0, buf.length)).toBe("Hi\nHi");
  });

  test("skips 0xF8 control sequences (3 bytes)", () => {
    const buf = Buffer.from([0x23, 0xf8, 0x03, 0x8c, 0x01, 0xff]);
    expect(decodeTblString(buf, 0, buf.length)).toBe("He");
  });

  test("renders unmapped bytes as {hex}", () => {
    const buf = Buffer.from([0x23, 0xaa, 0x01, 0xff]);
    expect(decodeTblString(buf, 0, buf.length)).toBe("H{aa}e");
  });

  test("respects start offset", () => {
    const buf = Buffer.from([0x99, 0x99, 0x23, 0x01, 0xff]);
    expect(decodeTblString(buf, 2, 3)).toBe("He");
  });

  test("respects maxLen limit", () => {
    const buf = Buffer.from([0x23, 0x01, 0x0a, 0x0a, 0x04, 0xff]);
    expect(decodeTblString(buf, 0, 3)).toBe("Hel");
  });
});

// ---------------------------------------------------------------------------
// PAL multi-language decoding — real game data fixtures
// ---------------------------------------------------------------------------
// Raw bytes extracted from the PAL vanilla disc (SLES_039.48, France).
// Each fixture is a card name from the WA_MRG name block, verified against
// the English block and official French/German/Spanish translations.

describe("PAL multi-language card names from disc", () => {
  // -- English (block 0) — baseline, no accents ----------------------------

  test("EN: Blue-eyes White Dragon", () => {
    const raw = [
      0x34, 0x09, 0x0a, 0x01, 0x4b, 0x01, 0x1b, 0x01, 0x08, 0x00, 0x35, 0x0f, 0x03, 0x07, 0x01,
      0x00, 0x1e, 0x05, 0x02, 0x10, 0x06, 0x04,
    ];
    const buf = Buffer.from([...raw, 0xff]);
    expect(decodeTblString(buf, 0, buf.length, PAL_CHAR_TABLE)).toBe("Blue-eyes White Dragon");
  });

  // -- French (block 1) — accented characters ------------------------------

  test("FR: Hitotsu Géant (card 3 — 0x24=é)", () => {
    const raw = [0x29, 0x03, 0x07, 0x06, 0x07, 0x08, 0x0a, 0x00, 0x2b, 0x24, 0x02, 0x04, 0x07];
    const buf = Buffer.from([...raw, 0xff]);
    expect(decodeTblString(buf, 0, buf.length, PAL_CHAR_TABLE)).toBe("Hitotsu Géant");
  });

  test("FR: Bébé D. (card 4 — Baby Dragon, 0x24=é x2)", () => {
    const raw = [0x34, 0x24, 0x13, 0x24, 0x00, 0x1e, 0x0d];
    const buf = Buffer.from([...raw, 0xff]);
    expect(decodeTblString(buf, 0, buf.length, PAL_CHAR_TABLE)).toBe("Bébé D.");
  });

  test("FR: Deuxième Guerrier Bouvillon (card 14 — Battle Steer, 0x40=è)", () => {
    const raw = [
      0x1e, 0x01, 0x0a, 0x3b, 0x03, 0x40, 0x0e, 0x01, 0x00, 0x2b, 0x0a, 0x01, 0x05, 0x05, 0x03,
      0x01, 0x05, 0x00, 0x34, 0x06, 0x0a, 0x14, 0x03, 0x09, 0x09, 0x06, 0x04,
    ];
    const buf = Buffer.from([...raw, 0xff]);
    expect(decodeTblString(buf, 0, buf.length, PAL_CHAR_TABLE)).toBe("Deuxième Guerrier Bouvillon");
  });

  test("FR: Chevalier d'Évodia (FR apostrophe 0x2a + É 0x51)", () => {
    // Constructed from the two known PAL mappings: 0x2a=' and 0x51=É
    const raw = [
      0x25, 0x0f, 0x01, 0x14, 0x02, 0x09, 0x03, 0x01, 0x05, 0x00, 0x0b, 0x2a, 0x51, 0x14, 0x06,
      0x0b, 0x03, 0x02,
    ];
    const buf = Buffer.from([...raw, 0xff]);
    expect(decodeTblString(buf, 0, buf.length, PAL_CHAR_TABLE)).toBe("Chevalier d'Évodia");
  });

  // -- German (block 2) — umlauts and ß ------------------------------------

  test("DE: Weißer Drache (card 1 — Blue-Eyes, 0x4f=ß)", () => {
    const raw = [0x35, 0x01, 0x03, 0x4f, 0x01, 0x05, 0x00, 0x1e, 0x05, 0x02, 0x0c, 0x0f, 0x01];
    const buf = Buffer.from([...raw, 0xff]);
    expect(decodeTblString(buf, 0, buf.length, PAL_CHAR_TABLE)).toBe("Weißer Drache");
  });

  test("DE: Verrückter Kobold (card 6 — Feral Imp, 0x41=ü)", () => {
    const raw = [
      0x39, 0x01, 0x05, 0x05, 0x41, 0x0c, 0x1f, 0x07, 0x01, 0x05, 0x00, 0x30, 0x06, 0x13, 0x06,
      0x09, 0x0b,
    ];
    const buf = Buffer.from([...raw, 0xff]);
    expect(decodeTblString(buf, 0, buf.length, PAL_CHAR_TABLE)).toBe("Verrückter Kobold");
  });

  test("DE: Flammen-Schwertkämpfer (card 15 — Flame Swordsman, 0x37=hyphen, 0x3d=ä)", () => {
    const raw = [
      0x33, 0x09, 0x02, 0x0e, 0x0e, 0x01, 0x04, 0x37, 0x18, 0x0c, 0x0f, 0x1a, 0x01, 0x05, 0x07,
      0x1f, 0x3d, 0x0e, 0x11, 0x12, 0x01, 0x05,
    ];
    const buf = Buffer.from([...raw, 0xff]);
    expect(decodeTblString(buf, 0, buf.length, PAL_CHAR_TABLE)).toBe("Flammen-Schwertkämpfer");
  });

  test("DE: Geflügelter Drache (card 7 — Winged Dragon #1, 0x41=ü)", () => {
    const raw = [
      0x2b, 0x01, 0x12, 0x09, 0x41, 0x10, 0x01, 0x09, 0x07, 0x01, 0x05, 0x00, 0x1e, 0x05, 0x02,
      0x0c, 0x0f, 0x01,
    ];
    const buf = Buffer.from([...raw, 0xff]);
    expect(decodeTblString(buf, 0, buf.length, PAL_CHAR_TABLE)).toBe("Geflügelter Drache");
  });

  // -- Spanish (block 4) — acute accents -----------------------------------

  test("ES: Dragón Bl. Ojo Azul (card 1 — Blue-Eyes, 0x43=ó)", () => {
    const raw = [
      0x1e, 0x05, 0x02, 0x10, 0x43, 0x04, 0x00, 0x34, 0x09, 0x0d, 0x00, 0x23, 0x2d, 0x06, 0x00,
      0x16, 0x20, 0x0a, 0x09,
    ];
    const buf = Buffer.from([...raw, 0xff]);
    expect(decodeTblString(buf, 0, buf.length, PAL_CHAR_TABLE)).toBe("Dragón Bl. Ojo Azul");
  });

  test("ES: Dragón Bebé (card 4 — Baby Dragon, 0x43=ó, 0x24=é)", () => {
    const raw = [0x1e, 0x05, 0x02, 0x10, 0x43, 0x04, 0x00, 0x34, 0x01, 0x13, 0x24];
    const buf = Buffer.from([...raw, 0xff]);
    expect(decodeTblString(buf, 0, buf.length, PAL_CHAR_TABLE)).toBe("Dragón Bebé");
  });

  test("ES: Duende Míst. (card 2 — Mystical Elf, 0x42=í)", () => {
    const raw = [0x1e, 0x0a, 0x01, 0x04, 0x0b, 0x01, 0x00, 0x17, 0x42, 0x08, 0x07, 0x0d];
    const buf = Buffer.from([...raw, 0xff]);
    expect(decodeTblString(buf, 0, buf.length, PAL_CHAR_TABLE)).toBe("Duende Míst.");
  });
});

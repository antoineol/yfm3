import { describe, expect, it } from "vitest";
import { CHAR_TABLE, PAL_CHAR_TABLE } from "./char-tables.ts";
import {
  decodeTblString,
  extractWaMrgStrings,
  ICON_TOKEN_BASE,
  iconTokenType,
  isIconToken,
  isTblString,
} from "./text-decoding.ts";

describe("decodeTblString", () => {
  it("decodes known TBL bytes to ASCII using CHAR_TABLE", () => {
    // CHAR_TABLE: 0=" ", 1="e", 2="t", 3="a"
    // Spell "eat" + terminator
    const buf = Buffer.from([0x01, 0x03, 0x02, 0xff]);
    expect(decodeTblString(buf, 0, 10)).toBe("eat");
  });

  it("stops at 0xFF terminator", () => {
    const buf = Buffer.from([0x01, 0xff, 0x02, 0x03]);
    expect(decodeTblString(buf, 0, 10)).toBe("e");
  });

  it("converts 0xFE to newline", () => {
    // "e" + newline + "a"
    const buf = Buffer.from([0x01, 0xfe, 0x03, 0xff]);
    expect(decodeTblString(buf, 0, 10)).toBe("e\na");
  });

  it("skips 0xF8 0A control prefix (name-color, 3 bytes total)", () => {
    // F8 0A 01 is a color-prefix control sequence, then "a" + terminator
    const buf = Buffer.from([0xf8, 0x0a, 0x01, 0x03, 0xff]);
    expect(decodeTblString(buf, 0, 10)).toBe("a");
  });

  it("emits a PUA icon token for 0xF8 0B XX (inline type icon)", () => {
    // "e" + F8 0B 00 (Dragon icon) + "a" + terminator
    const buf = Buffer.from([0x01, 0xf8, 0x0b, 0x00, 0x03, 0xff]);
    const decoded = decodeTblString(buf, 0, 10);
    expect(decoded).toHaveLength(3);
    expect(decoded[0]).toBe("e");
    expect(decoded[2]).toBe("a");
    const token = decoded.charAt(1);
    expect(isIconToken(token)).toBe(true);
    expect(iconTokenType(token)).toBe(0);
    expect(token.charCodeAt(0)).toBe(ICON_TOKEN_BASE);
  });

  it("encodes the icon-type byte in the token (F8 0B 16 → Ritual index)", () => {
    const buf = Buffer.from([0xf8, 0x0b, 0x16, 0xff]);
    const decoded = decodeTblString(buf, 0, 10);
    expect(iconTokenType(decoded)).toBe(0x16);
  });

  it("renders unknown bytes as hex placeholders", () => {
    // 0xF0 is not in CHAR_TABLE
    const buf = Buffer.from([0xf0, 0xff]);
    expect(decodeTblString(buf, 0, 10)).toBe("{f0}");
  });

  it("respects maxLen limit", () => {
    const buf = Buffer.from([0x01, 0x02, 0x03, 0x01, 0x02]); // no terminator
    expect(decodeTblString(buf, 0, 3)).toBe("eta");
  });

  it("respects start offset", () => {
    const buf = Buffer.from([0x00, 0x00, 0x01, 0x03, 0xff]);
    expect(decodeTblString(buf, 2, 10)).toBe("ea");
  });

  it("uses PAL_CHAR_TABLE when provided", () => {
    // PAL: 0x01="e", 0x02="a", 0x07="t"
    const buf = Buffer.from([0x01, 0x02, 0x07, 0xff]);
    expect(decodeTblString(buf, 0, 10, PAL_CHAR_TABLE)).toBe("eat");
  });
});

describe("isTblString", () => {
  it("returns true for a valid TBL string ending with 0xFF", () => {
    const buf = Buffer.from([0x01, 0x03, 0xff]);
    expect(isTblString(buf, 0)).toBe(true);
  });

  it("returns false for immediate terminator (empty string)", () => {
    const buf = Buffer.from([0xff]);
    expect(isTblString(buf, 0)).toBe(false);
  });

  it("returns false if no terminator within limit", () => {
    const buf = Buffer.alloc(200, 0x01); // all 'e', no 0xFF
    expect(isTblString(buf, 0, 100)).toBe(false);
  });

  it("handles 0xFE (newline) within string", () => {
    const buf = Buffer.from([0x01, 0xfe, 0x03, 0xff]);
    expect(isTblString(buf, 0)).toBe(true);
  });

  it("handles 0xF8 control prefix", () => {
    const buf = Buffer.from([0xf8, 0x0a, 0x01, 0x03, 0xff]);
    expect(isTblString(buf, 0)).toBe(true);
  });

  it("returns false for invalid TBL byte", () => {
    // Find a byte value not in CHAR_TABLE and not a control code
    const invalidByte = CHAR_TABLE.findIndex((v, i) => v === undefined && i < 0xf8) as number;
    if (invalidByte >= 0) {
      const buf = Buffer.from([invalidByte, 0xff]);
      expect(isTblString(buf, 0)).toBe(false);
    }
  });
});

describe("extractWaMrgStrings", () => {
  it("extracts multiple 0xFF-separated strings", () => {
    // PAL: 0x01="e", 0x02="a", 0x07="t"
    // Two strings: "eat" and "tea"
    const buf = Buffer.from([0x01, 0x02, 0x07, 0xff, 0x07, 0x01, 0x02, 0xff]);
    const result = extractWaMrgStrings(buf, 0, 2);
    expect(result).toEqual(["eat", "tea"]);
  });

  it("respects count limit", () => {
    const buf = Buffer.from([0x01, 0xff, 0x02, 0xff, 0x07, 0xff]);
    const result = extractWaMrgStrings(buf, 0, 2);
    expect(result).toHaveLength(2);
    expect(result).toEqual(["e", "a"]);
  });

  it("starts at the given offset", () => {
    const buf = Buffer.from([0x00, 0x00, 0x01, 0x02, 0xff]);
    const result = extractWaMrgStrings(buf, 2, 1);
    expect(result).toEqual(["ea"]);
  });

  it("returns empty string and stops if a string is too long (>500 bytes)", () => {
    const long = Buffer.alloc(600, 0x01); // no terminator within 500
    long[550] = 0xff; // terminator at 550 > 500
    const result = extractWaMrgStrings(long, 0, 1);
    expect(result).toEqual([""]);
  });
});

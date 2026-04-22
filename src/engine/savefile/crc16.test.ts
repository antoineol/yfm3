import { describe, expect, it } from "vitest";
import { crc16Ccitt } from "./crc16.ts";

describe("crc16Ccitt", () => {
  it("matches the XMODEM reference vector for '123456789'", () => {
    const input = new TextEncoder().encode("123456789");
    expect(crc16Ccitt(input, 0, input.length)).toBe(0x31c3);
  });

  it("returns 0 for empty input", () => {
    expect(crc16Ccitt(new Uint8Array(0), 0, 0)).toBe(0);
  });

  it("returns 0 for an all-zero buffer", () => {
    const buf = new Uint8Array(64);
    expect(crc16Ccitt(buf, 0, buf.length)).toBe(0);
  });

  it("respects offset and length", () => {
    const full = new TextEncoder().encode("XX123456789YY");
    expect(crc16Ccitt(full, 2, 9)).toBe(0x31c3);
  });

  it("throws on out-of-range index", () => {
    expect(() => crc16Ccitt(new Uint8Array(4), 0, 8)).toThrow(RangeError);
  });
});

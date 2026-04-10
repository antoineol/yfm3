import { describe, expect, it } from "vitest";
import { encodePng } from "./encode-png.ts";

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

describe("encodePng", () => {
  it("produces valid PNG signature", () => {
    const rgba = new Uint8Array(2 * 2 * 4); // 2x2 transparent black
    const png = encodePng(rgba, 2, 2);
    expect([...png.subarray(0, 8)]).toEqual(PNG_SIGNATURE);
  });

  it("contains IHDR, IDAT, and IEND chunks", () => {
    const rgba = new Uint8Array(4 * 3 * 4); // 4x3 pixels
    rgba.fill(128);
    const png = encodePng(rgba, 4, 3);
    const str = png.toString("binary");
    expect(str).toContain("IHDR");
    expect(str).toContain("IDAT");
    expect(str).toContain("IEND");
  });

  it("encodes IHDR with correct dimensions", () => {
    const rgba = new Uint8Array(10 * 5 * 4);
    const png = encodePng(rgba, 10, 5);
    // IHDR data starts at byte 16 (8 sig + 4 length + 4 type)
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    expect(width).toBe(10);
    expect(height).toBe(5);
    expect(png[24]).toBe(8); // bit depth
    expect(png[25]).toBe(6); // color type RGBA
  });

  it("produces different output for different pixel data", () => {
    const red = new Uint8Array(1 * 1 * 4);
    red.set([255, 0, 0, 255]);
    const blue = new Uint8Array(1 * 1 * 4);
    blue.set([0, 0, 255, 255]);
    const pngRed = encodePng(red, 1, 1);
    const pngBlue = encodePng(blue, 1, 1);
    expect(pngRed.equals(pngBlue)).toBe(false);
  });
});

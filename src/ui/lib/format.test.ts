import { describe, expect, it } from "vitest";
import { artworkSrc, bridgeArtworkSrc, formatCardId, formatRate } from "./format.ts";

describe("formatCardId", () => {
  it("pads single digit", () => {
    expect(formatCardId(7)).toBe("007");
  });
  it("pads double digit", () => {
    expect(formatCardId(42)).toBe("042");
  });
  it("keeps triple digit", () => {
    expect(formatCardId(123)).toBe("123");
  });
  it("handles zero", () => {
    expect(formatCardId(0)).toBe("000");
  });
});

describe("artworkSrc", () => {
  it("includes mod in path", () => {
    expect(artworkSrc("rp", 42)).toBe("/images/artwork/rp/042.webp");
  });
  it("uses vanilla mod path", () => {
    expect(artworkSrc("vanilla", 1)).toBe("/images/artwork/vanilla/001.webp");
  });
});

describe("bridgeArtworkSrc", () => {
  it("scopes the URL by artworkKey so each mod has its own browser-cache bucket", () => {
    expect(bridgeArtworkSrc("abc123def456-78c4801f", 380)).toBe(
      "http://localhost:3333/artwork/abc123def456-78c4801f/380.png",
    );
  });
  it("returns a different URL for the same card under a different mod", () => {
    const a = bridgeArtworkSrc("aaaaaaaaaaaa-11111111", 380);
    const b = bridgeArtworkSrc("bbbbbbbbbbbb-22222222", 380);
    expect(a).not.toBe(b);
  });
});

describe("formatRate", () => {
  it("returns dash for zero", () => {
    expect(formatRate(0)).toBe("—");
  });

  it("formats rate as percentage", () => {
    expect(formatRate(45)).toBe("2.2%");
  });

  it("formats large rate", () => {
    expect(formatRate(2048)).toBe("100.0%");
  });
});

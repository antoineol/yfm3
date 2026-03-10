import { describe, expect, it } from "vitest";
import { formatCardId } from "./format.ts";

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

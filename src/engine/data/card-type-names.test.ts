import { describe, expect, it } from "vitest";
import { displayCardType, normalizeCardType } from "./card-type-names.ts";

describe("card type names", () => {
  it("normalizes display names to packed enum names", () => {
    expect(normalizeCardType("Beast-Warrior")).toBe("BeastWarrior");
    expect(normalizeCardType("Winged Beast")).toBe("WingedBeast");
    expect(normalizeCardType("Sea Serpent")).toBe("SeaSerpent");
  });

  it("formats packed enum names for display", () => {
    expect(displayCardType("BeastWarrior")).toBe("Beast-Warrior");
    expect(displayCardType("WingedBeast")).toBe("Winged Beast");
    expect(displayCardType("SeaSerpent")).toBe("Sea Serpent");
  });
});

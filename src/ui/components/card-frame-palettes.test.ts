import { describe, expect, it } from "vitest";
import { frameBorderColor, framePaletteForCard } from "./card-frame-palettes.ts";

describe("card frame palettes", () => {
  it("uses extracted monster color before the default monster frame", () => {
    const palette = framePaletteForCard({
      color: "blue",
      cardType: "Warrior",
      isMonster: true,
    });

    expect(palette.mid).toBe("#1458d8");
  });

  it("uses extracted color before non-monster type fallback", () => {
    const palette = framePaletteForCard({
      color: "purple",
      cardType: "Ritual",
      isMonster: false,
    });

    expect(palette.mid).toBe("#9c6ed8");
  });

  it("keeps hardcoded type colors when no extracted color exists", () => {
    expect(frameBorderColor(undefined, "Trap", false)).toBe("#c04888");
  });

  it("uses pink for extracted trap-effect frame colors", () => {
    const palette = framePaletteForCard({
      color: "pink",
      cardType: "Magic",
      isMonster: false,
    });

    expect(palette.mid).toBe("#c04888");
  });
});

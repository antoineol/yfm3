import { describe, expect, it } from "vitest";
import { frameBorderColor, framePaletteForCard, labelTextColor } from "./card-frame-palettes.ts";

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

  it("keeps label colors separate from frame palettes", () => {
    expect(labelTextColor("blue")).toBe("#86b5f6");
    expect(labelTextColor("purple")).toBe("#d78be8");
    expect(frameBorderColor("green", "Magic", false)).toBe("#308838");
  });

  it("keeps label colors readable on dark UI surfaces", () => {
    const darkSurfaces = ["#080c14", "#0f1520", "#161d2d", "#1c2540"];
    const colors = ["yellow", "blue", "green", "purple", "orange", "red", "pink"];

    for (const color of colors) {
      for (const surface of darkSurfaces) {
        expect(contrastRatio(labelTextColor(color) ?? "#000000", surface)).toBeGreaterThanOrEqual(
          6,
        );
      }
    }
  });
});

function contrastRatio(foreground: string, background: string): number {
  const fg = relativeLuminance(foreground);
  const bg = relativeLuminance(background);
  return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
}

function relativeLuminance(hex: string): number {
  const weights = [0.2126, 0.7152, 0.0722];
  const channels = [
    Number.parseInt(hex.slice(1, 3), 16) / 255,
    Number.parseInt(hex.slice(3, 5), 16) / 255,
    Number.parseInt(hex.slice(5, 7), 16) / 255,
  ];
  return channels
    .map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((sum, channel, i) => sum + channel * (weights[i] ?? 0), 0);
}

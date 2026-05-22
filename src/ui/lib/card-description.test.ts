import { describe, expect, it } from "vitest";
import { iconUrlForType, parseDescription } from "./card-description.ts";

describe("card description type icons", () => {
  it("uses the shared raw card type names", () => {
    expect(parseDescription("Boosts [Spellcaster] cards")).toEqual([
      { kind: "text", text: "Boosts " },
      { kind: "icon", name: "Spellcaster" },
      { kind: "text", text: " cards" },
    ]);
  });

  it("slugs compact multi-word type names for existing icon assets", () => {
    expect(iconUrlForType("WingedBeast")).toBe("/images/type-icons/winged-beast.png");
    expect(iconUrlForType("SeaSerpent")).toBe("/images/type-icons/sea-serpent.png");
  });

  it("also accepts display names emitted by extracted type tables", () => {
    expect(parseDescription("Boosts [Winged Beast] cards")).toEqual([
      { kind: "text", text: "Boosts " },
      { kind: "icon", name: "Winged Beast" },
      { kind: "text", text: " cards" },
    ]);
    expect(iconUrlForType("Beast-Warrior")).toBe("/images/type-icons/beast-warrior.png");
  });
});

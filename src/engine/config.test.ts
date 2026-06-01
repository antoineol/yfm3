import { afterEach, describe, expect, it } from "vitest";
import { getConfig, resetConfig, setConfig } from "./config.ts";
import { DECK_SIZE } from "./types/constants.ts";

afterEach(() => resetConfig());

describe("EngineConfig", () => {
  it("returns default values", () => {
    expect(getConfig().scoringSlots).toBe(DECK_SIZE);
  });

  it("applies partial updates", () => {
    setConfig({ scoringSlots: 20 });
    expect(getConfig().scoringSlots).toBe(20);
  });

  it("accepts deckSize as a compatibility alias", () => {
    setConfig({ scoringSlots: 20 });
    expect(getConfig().scoringSlots).toBe(20);
  });

  it("resets to defaults", () => {
    setConfig({ scoringSlots: 10 });
    resetConfig();
    expect(getConfig().scoringSlots).toBe(DECK_SIZE);
  });
});

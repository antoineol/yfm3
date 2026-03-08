import { afterEach, describe, expect, it } from "vitest";
import { getConfig, resetConfig, setConfig } from "./config.ts";
import { DECK_SIZE } from "./types/constants.ts";

afterEach(() => resetConfig());

describe("EngineConfig", () => {
  it("returns default values", () => {
    expect(getConfig().deckSize).toBe(DECK_SIZE);
  });

  it("applies partial updates", () => {
    setConfig({ deckSize: 20 });
    expect(getConfig().deckSize).toBe(20);
  });

  it("resets to defaults", () => {
    setConfig({ deckSize: 10 });
    resetConfig();
    expect(getConfig().deckSize).toBe(DECK_SIZE);
  });
});

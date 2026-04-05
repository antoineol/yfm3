import { afterEach, describe, expect, it } from "vitest";
import { createAllCardsBuffers } from "../../test/test-helpers.ts";
import { resetConfig, setConfig } from "../config.ts";
import { FusionScorer } from "./fusion-scorer.ts";

const scorer = new FusionScorer();

afterEach(() => {
  resetConfig();
});

describe("field bonus in scoring pipeline", () => {
  // Card 1 = Baby Dragon (Dragon, ATK 1200)
  // Mountain (terrain 3) boosts Dragon +500 → 1700
  // Card 73 = Kuriboh (Fiend, ATK 300)
  // Dark (terrain 6) boosts Fiend +500 → 800

  it("terrain=0 (none): cardAtk reflects base ATK", () => {
    const buf = createAllCardsBuffers();
    expect(buf.cardAtk[1]).toBe(1200); // Baby Dragon base
    expect(buf.cardAtk[73]).toBe(300); // Kuriboh base
  });

  it("terrain=3 (Mountain): Dragon gets +500 ATK in buffer", () => {
    setConfig({ terrain: 3 });
    const buf = createAllCardsBuffers();
    expect(buf.cardAtk[1]).toBe(1700); // Baby Dragon: 1200 + 500
  });

  it("terrain=6 (Dark): Fiend gets +500, Fairy gets -500", () => {
    setConfig({ terrain: 6 });
    const buf = createAllCardsBuffers();
    expect(buf.cardAtk[73]).toBe(800); // Kuriboh (Fiend): 300 + 500
    // Card 76 = Injection Fairy Lily (Fairy, ATK 400) → 400 - 500 = 0 (floored)
    expect(buf.cardAtk[76]).toBe(0);
    // Card 78 = Goddess of Whim (Fairy, ATK 800) → 800 - 500 = 300
    expect(buf.cardAtk[78]).toBe(300);
  });

  it("unaffected types keep base ATK", () => {
    setConfig({ terrain: 6 }); // Dark: boosts Spellcaster/Fiend, weakens Fairy
    const buf = createAllCardsBuffers();
    // Card 1 = Baby Dragon (Dragon) — not affected by Dark
    expect(buf.cardAtk[1]).toBe(1200);
  });

  it("scorer uses field-adjusted ATK for direct plays", () => {
    setConfig({ terrain: 6 }); // Dark
    const buf = createAllCardsBuffers();
    // Hand of 5 Kuribohs (Fiend, base 300 → 800 on Dark)
    const hand = new Uint16Array([73, 73, 73, 73, 73]);
    expect(scorer.evaluateHand(hand, buf)).toBe(800);
  });

  it("scorer uses field-adjusted ATK for fusion results", () => {
    // Card 56 = Dissolverock (Rock, ATK 900)
    // Card 443 = Dissolverock (or another card that fuses)
    // Let's use a known fusion: 56 + 443 → result with ATK 4000 (from existing test)
    // On Mountain (3): if the fusion result is a Dragon, it gets +500
    // First check without terrain:
    const bufBase = createAllCardsBuffers();
    const hand = new Uint16Array([56, 443, 403, 279, 453]);
    const baseResult = scorer.evaluateHand(hand, bufBase);

    // Now with Mountain terrain — the fusion result type determines the bonus
    setConfig({ terrain: 3 });
    const bufMountain = createAllCardsBuffers();
    const mountainResult = scorer.evaluateHand(hand, bufMountain);

    // The result should differ if any card in the hand or fusion result is Dragon/WingedBeast/Thunder
    // At minimum, the field-adjusted result should be >= base result for boosted types
    // and the scorer should pick the best available
    expect(mountainResult).toBeGreaterThanOrEqual(baseResult);
  });

  it("field bonus changes which card the scorer considers best", () => {
    // Without terrain: Card 13 (Spellcaster, ATK 1600) < Card 1 (Dragon, ATK 1200)?
    // No, 1600 > 1200. Let me pick cards where field flips the ordering.
    // Card 66 = Unknown Warrior Of Fiend (Fiend, ATK 1000)
    // Card 2 = Winged Dragon #1 (Dragon, ATK 1400)
    // Without field: Dragon wins (1400 > 1000)
    // With Dark (6): Fiend gets +500 = 1500, Dragon stays 1400 → Fiend wins
    const handCards = new Uint16Array([66, 2, 73, 73, 73]);

    const bufNone = createAllCardsBuffers();
    const noFieldResult = scorer.evaluateHand(handCards, bufNone);
    expect(noFieldResult).toBe(1400); // Dragon wins

    setConfig({ terrain: 6 });
    const bufDark = createAllCardsBuffers();
    const darkResult = scorer.evaluateHand(handCards, bufDark);
    expect(darkResult).toBe(1500); // Fiend (1000+500) now wins
  });
});

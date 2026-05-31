import { describe, expect, it } from "vitest";
import type { BridgeCard } from "../../../engine/worker/messages.ts";
import { type BridgeState, INITIAL_BRIDGE_STATE } from "../../lib/bridge-message-processor.ts";
import type { FieldCard } from "../../lib/bridge-state-interpreter.ts";
import { predictBattleOutcome, predictFocusedBattle } from "./battle-prediction.ts";

function card(overrides: Partial<BridgeCard>): BridgeCard {
  return {
    id: 1,
    name: "Monster",
    atk: 1000,
    def: 1000,
    gs1: "None",
    gs2: "None",
    type: "Warrior",
    color: "yellow",
    labelColor: "black",
    level: 4,
    attribute: "Earth",
    description: "",
    starchipCost: 0,
    password: "",
    ...overrides,
  };
}

function field(overrides: Partial<FieldCard>): FieldCard {
  return { cardId: 1, atk: 1000, def: 1000, status: 0x84, slotIndex: 0, ...overrides };
}

describe("predictBattleOutcome", () => {
  it("returns win when attacker beats an attack-position target", () => {
    const result = predictBattleOutcome(
      { card: card({ id: 1, atk: 2000 }), field: field({ cardId: 1, atk: 2000 }) },
      { card: card({ id: 2, atk: 1500 }), field: field({ cardId: 2, atk: 1500, status: 0x86 }) },
    );

    expect(result?.outcome).toBe("win");
    expect(result?.attackerAtk).toBe(2000);
    expect(result?.defenderValue).toBe(1500);
  });

  it("returns bothDestroyed for equal attack-position monsters", () => {
    const result = predictBattleOutcome(
      { card: card({ id: 1, atk: 2000 }), field: field({ cardId: 1, atk: 2000 }) },
      { card: card({ id: 2, atk: 2000 }), field: field({ cardId: 2, atk: 2000, status: 0x86 }) },
    );

    expect(result?.outcome).toBe("bothDestroyed");
  });

  it("returns lose when attacker fails to beat a defense-position target", () => {
    const result = predictBattleOutcome(
      { card: card({ id: 1, atk: 1800 }), field: field({ cardId: 1, atk: 1800 }) },
      { card: card({ id: 2, atk: 500 }), field: field({ cardId: 2, def: 2000, status: 0xbc }) },
    );

    expect(result?.outcome).toBe("lose");
    expect(result?.defenderPosition).toBe("defense");
    expect(result?.defenderValue).toBe(2000);
  });

  it("applies guardian-star battle bonuses on top of live field stats", () => {
    const result = predictBattleOutcome(
      {
        card: card({ id: 1, atk: 1400, gs1: "Mars", type: "Warrior" }),
        field: field({ cardId: 1, atk: 1900 }),
      },
      {
        card: card({ id: 2, atk: 2300, gs1: "Jupiter", type: "Fiend" }),
        field: field({ cardId: 2, atk: 2300, status: 0x86 }),
      },
    );

    expect(result?.outcome).toBe("win");
    expect(result?.attackerAtk).toBe(2400);
    expect(result?.defenderValue).toBe(2300);
  });

  it("uses live field stats without terrain when terrain is Normal", () => {
    const result = predictBattleOutcome(
      {
        card: card({
          id: 571,
          name: "B. Dragon Jungle King",
          atk: 2100,
          def: 1800,
          type: "Dragon",
        }),
        field: field({ cardId: 571, atk: 2100, def: 1800, status: 0x84 }),
      },
      {
        card: card({ id: 545, name: "Skelgon", atk: 1700, def: 1900, type: "Zombie" }),
        field: field({ cardId: 545, atk: 1700, def: 1900, status: 0xbc }),
      },
    );

    expect(result?.outcome).toBe("win");
    expect(result?.attackerAtk).toBe(2100);
    expect(result?.defenderValue).toBe(1900);
  });

  it("applies terrain to base live field stats before predicting battle", () => {
    const result = predictBattleOutcome(
      {
        card: card({ id: 401, name: "Ushi Oni", atk: 2150, def: 1950, type: "Fiend" }),
        field: field({ cardId: 401, atk: 2150, def: 1950, status: 0x84 }),
      },
      {
        card: card({ id: 111, name: "Doma", atk: 1600, def: 1400, type: "Fairy" }),
        field: field({ cardId: 111, atk: 1600, def: 1400, status: 0x86 }),
      },
      6,
    );

    expect(result?.outcome).toBe("win");
    expect(result?.attackerAtk).toBe(2650);
    expect(result?.defenderValue).toBe(1100);
  });
});

describe("predictFocusedBattle", () => {
  it("uses the tracked player attacker and focused opponent target", () => {
    const bridge: BridgeState = {
      ...INITIAL_BRIDGE_STATE,
      inDuel: true,
      stats: { fusions: 0, terrain: 6, duelistId: 1, rankCounters: null },
      field: [field({ cardId: 1, atk: 2000, slotIndex: 2 })],
      opponentField: [field({ cardId: 2, atk: 1500, status: 0x86, slotIndex: 4 })],
      battleTarget: {
        attacker: { zone: "playerField", index: 2, cardId: 1, hidden: false },
        defender: { zone: "opponentField", index: 4, cardId: 2, hidden: true },
      },
      gameData: {
        cards: [card({ id: 1, atk: 2000 }), card({ id: 2, atk: 1500 })],
        duelists: [],
        fusionTable: [],
        equipTable: [],
        equipBonuses: null,
        perEquipBonuses: null,
        deckLimits: null,
        rankScoring: null,
        fieldBonusTable: null,
        artworkKey: "",
      },
    };

    const result = predictFocusedBattle(bridge);
    expect(result?.outcome).toBe("win");
    expect(result?.attackerAtk).toBe(2000);
  });
});

import { describe, expect, it } from "vitest";
import { buildPerEquipBonuses, parseEquipBonusFromDescription } from "./parse-equip-bonus.ts";
import type { CardStats, EquipEntry } from "./types.ts";

describe("parseEquipBonusFromDescription", () => {
  it.each([
    ["increase the\npower of LIGHT\nmonsters by 500!", 500],
    ["increases by\n500 points the\npower of DARK\nmonsters!", 500],
    ["boosts the\npower of  and \nwith 2000 or\nmore ATK by 600!", 600],
    ["increases the\npower of  by 500\npoints!", 500],
    ["evolve  and boost\ntheir powers by\n700 points!", 700],
    ["increase the\npower of the\nstrongests  by 1500!", 1500],
    ["increase the power\nof  monsters by \n700!", 700],
    ["increases the\npower of \nmonsters by 1000!", 1000],
    ["increases the power\nof malevolent\ncreatures by 800!", 800],
    ["increases the\npower of  by\n1500 points.", 1500],
    ["increases\nthe power of\nany WIND monster\nby 400 points!", 400],
    ["Increase the ATK\nof an Ancient Gear\nmonster by 700!", 700],
  ])("parses %j → %d", (desc, expected) => {
    expect(parseEquipBonusFromDescription(desc)).toBe(expected);
  });

  it.each([
    ["Increases the power\nof any selected\nmonster by the half\nof your opponents\nLife Points."],
    ["A card that boosts the power of any\nMachine monster.\nMay turn the\nmonster into a ."],
    ["A card that\nincreases the power\nof any selected\nmonster by 2 levels."],
    ["increases\nthe power of\nLevel 5 or higher\n monsters when\nopened!"],
  ])("returns null for special equip: %j", (desc) => {
    expect(parseEquipBonusFromDescription(desc)).toBeNull();
  });
});

describe("buildPerEquipBonuses", () => {
  const cards: CardStats[] = [
    card(301, "Equip", "increases by 500!"),
    card(302, "Equip", "boosts by 700 points!"),
    card(303, "Equip", "by the half of LP."),
    card(1, "Dragon", "A powerful dragon."),
  ];

  const equips: EquipEntry[] = [
    { equipId: 301, monsterIds: [1] },
    { equipId: 302, monsterIds: [1] },
    { equipId: 303, monsterIds: [1] },
  ];

  it("builds a map from equip cards with parseable bonuses", () => {
    expect(buildPerEquipBonuses(cards, equips)).toEqual({ 301: 500, 302: 700 });
  });

  it("returns null when no equips have parseable bonuses", () => {
    const specialOnly: EquipEntry[] = [{ equipId: 303, monsterIds: [1] }];
    expect(buildPerEquipBonuses(cards, specialOnly)).toBeNull();
  });

  it("ignores non-equip cards even if their description matches", () => {
    const cardsWithMonster: CardStats[] = [
      card(1, "Dragon", "increases power by 500!"),
      card(301, "Equip", "increases by 700!"),
    ];
    const result = buildPerEquipBonuses(cardsWithMonster, equips);
    expect(result).toEqual({ 301: 700 });
  });
});

function card(id: number, type: string, description: string): CardStats {
  return {
    id,
    name: `Card ${id}`,
    atk: 0,
    def: 0,
    gs1: "None",
    gs2: "None",
    type,
    color: "",
    level: 0,
    attribute: "",
    description,
    starchipCost: 0,
    password: "",
  };
}

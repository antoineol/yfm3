import { describe, expect, it } from "vitest";
import { cardsToCsv, duelistsToCsv, equipsToCsv, fusionsToCsv } from "./csv.ts";
import type { CardStats, DuelistData, EquipEntry, Fusion } from "./types.ts";

describe("cardsToCsv", () => {
  const baseCard: CardStats = {
    id: 1,
    name: "Blue-Eyes",
    atk: 3000,
    def: 2500,
    gs1: "Sun",
    gs2: "Moon",
    type: "Dragon",
    color: "blue",
    level: 8,
    attribute: "Light",
    starchipCost: 999999,
    password: "89631139",
    description: "Powerful dragon.",
  };

  it("produces correct header", () => {
    const csv = cardsToCsv([baseCard]);
    const header = csv.split("\n")[0];
    expect(header).toBe(
      "id,name,atk,def,guardian_star_1,guardian_star_2,type,color,level,attribute,starchip_cost,password,description",
    );
  });

  it("serializes card fields in correct order", () => {
    const csv = cardsToCsv([baseCard]);
    const row = csv.split("\n")[1];
    expect(row).toContain("1,");
    expect(row).toContain('"Blue-Eyes"');
    expect(row).toContain(",3000,2500,");
    expect(row).toContain(",Sun,Moon,Dragon,blue,8,Light,999999,89631139,");
  });

  it("escapes double quotes in names", () => {
    const card = { ...baseCard, name: 'Card "X"' };
    const csv = cardsToCsv([card]);
    expect(csv).toContain('"Card ""X"""');
  });

  it("escapes newlines in descriptions", () => {
    const card = { ...baseCard, description: "Line1\nLine2" };
    const csv = cardsToCsv([card]);
    expect(csv).toContain('"Line1\\nLine2"');
  });

  it("ends with a trailing newline", () => {
    const csv = cardsToCsv([baseCard]);
    expect(csv.endsWith("\n")).toBe(true);
  });
});

describe("fusionsToCsv", () => {
  it("produces header and rows with correct columns", () => {
    const fusions: Fusion[] = [
      { material1: 1, material2: 2, result: 3 },
      { material1: 10, material2: 20, result: 30 },
    ];
    const cardAtk = new Map([
      [3, 2500],
      [30, 1800],
    ]);
    const csv = fusionsToCsv(fusions, cardAtk);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("material1_id,material2_id,result_id,result_atk");
    expect(lines[1]).toBe("1,2,3,2500");
    expect(lines[2]).toBe("10,20,30,1800");
  });

  it("defaults to 0 when result atk is unknown", () => {
    const fusions: Fusion[] = [{ material1: 1, material2: 2, result: 999 }];
    const csv = fusionsToCsv(fusions, new Map());
    expect(csv).toContain("1,2,999,0");
  });
});

describe("equipsToCsv", () => {
  it("expands monsterIds array into individual rows", () => {
    const equips: EquipEntry[] = [
      { equipId: 100, monsterIds: [1, 2, 3] },
      { equipId: 200, monsterIds: [10] },
    ];
    const csv = equipsToCsv(equips);
    const lines = csv.split("\n").filter(Boolean);
    expect(lines[0]).toBe("equip_id,monster_id");
    expect(lines[1]).toBe("100,1");
    expect(lines[2]).toBe("100,2");
    expect(lines[3]).toBe("100,3");
    expect(lines[4]).toBe("200,10");
  });
});

describe("duelistsToCsv", () => {
  it("emits only non-zero card entries", () => {
    const deck = new Array(722).fill(0);
    deck[0] = 3; // card 1, deck=3
    deck[4] = 1; // card 5, deck=1
    const duelist: DuelistData = {
      id: 1,
      name: "Simon",
      deck,
      saPow: new Array(722).fill(0),
      bcd: new Array(722).fill(0),
      saTec: new Array(722).fill(0),
    };
    const csv = duelistsToCsv([duelist]);
    const lines = csv.split("\n").filter(Boolean);
    expect(lines[0]).toBe("duelist_id,duelist_name,card_id,deck,sa_pow,bcd,sa_tec");
    expect(lines[1]).toBe('1,"Simon",1,3,0,0,0');
    expect(lines[2]).toBe('1,"Simon",5,1,0,0,0');
    expect(lines).toHaveLength(3); // header + 2 data rows
  });

  it("includes entries where any pool is non-zero", () => {
    const deck = new Array(722).fill(0);
    const saPow = new Array(722).fill(0);
    saPow[9] = 5; // card 10, sa_pow=5
    const duelist: DuelistData = {
      id: 2,
      name: "Rex",
      deck,
      saPow,
      bcd: new Array(722).fill(0),
      saTec: new Array(722).fill(0),
    };
    const csv = duelistsToCsv([duelist]);
    const lines = csv.split("\n").filter(Boolean);
    expect(lines).toHaveLength(2); // header + 1 row
    expect(lines[1]).toBe('2,"Rex",10,0,5,0,0');
  });
});

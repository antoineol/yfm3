import { describe, expect, it } from "vitest";
import { bridgeGameDataToReference, parseCardsCsv } from "./load-reference-csvs.ts";

const HEADER =
  "id,name,atk,def,guardian_star_1,guardian_star_2,type,color,level,attribute,starchip_cost,password,description";

function csvRow(id: number, description: string): string {
  return `${id},"Card",1000,800,Sun,Moon,Dragon,orange,4,Light,100,${id},"${description}"`;
}

function parseDescription(description: string): string | undefined {
  const csv = `${HEADER}\n${csvRow(1, description)}`;
  return parseCardsCsv(csv)[0]?.description;
}

describe("parseCardsCsv description handling", () => {
  it("replaces \\n with a space", () => {
    expect(parseDescription("A mighty\\ndragon")).toBe("A mighty dragon");
  });

  it("joins hyphenated words split across lines", () => {
    expect(parseDescription("the blue-\\neyes white dragon")).toBe("the blue-eyes white dragon");
  });

  it("collapses space before \\n to a single space", () => {
    expect(parseDescription("power \\nof")).toBe("power of");
  });

  it("trims trailing \\n", () => {
    expect(parseDescription("a dragon\\n")).toBe("a dragon");
  });

  it("handles multiple hyphenated words in one description", () => {
    expect(parseDescription("half-\\nhuman half-\\nfiend")).toBe("half-human half-fiend");
  });

  it("returns undefined for empty description", () => {
    expect(parseDescription("")).toBeUndefined();
  });
});

describe("parseCardsCsv colors", () => {
  it("parses frame and label colors separately", () => {
    const csv = `${HEADER},label_color\n${csvRow(1, "")},blue`;

    expect(parseCardsCsv(csv)[0]).toMatchObject({
      color: "orange",
      labelColor: "blue",
    });
  });
});

describe("parseCardsCsv type labels", () => {
  it("parses extracted type labels when present", () => {
    const csv = `${HEADER},label_color,type_label\n${csvRow(1, "")},blue,Magie`;

    expect(parseCardsCsv(csv)[0]).toMatchObject({
      type: "Dragon",
      typeLabel: "Magie",
    });
  });
});

describe("bridgeGameDataToReference", () => {
  it("keeps bridge label colors separate from frame colors", () => {
    const result = bridgeGameDataToReference({
      cards: [
        {
          id: 337,
          name: "Raigeki",
          atk: 0,
          def: 0,
          gs1: "None",
          gs2: "None",
          type: "Magic",
          typeLabel: "Magie",
          color: "green",
          labelColor: "blue",
          level: 0,
          attribute: "",
          description: "",
          starchipCost: 0,
          password: "",
        },
      ],
      duelists: [],
      fusionTable: [],
      equipTable: [],
      equipBonuses: null,
      perEquipBonuses: null,
      deckLimits: null,
      rankScoring: null,
      fieldBonusTable: null,
      artworkKey: "test",
    });

    expect(result.cards[0]).toMatchObject({
      color: "green",
      labelColor: "blue",
      typeLabel: "Magie",
    });
  });
});

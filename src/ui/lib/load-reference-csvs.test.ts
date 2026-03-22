import { describe, expect, it } from "vitest";
import { parseCardsCsv } from "./load-reference-csvs.ts";

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

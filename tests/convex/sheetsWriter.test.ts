import { describe, expect, it } from "vitest";
import { findRowIndex } from "../../convex/sheetsWriter.ts";

describe("findRowIndex", () => {
  const values = [
    ["name"], // header (row 1)
    ["Dragon"], // row 2
    ["Eagle"], // row 3
    ["Blue Eyes"], // row 4
  ];

  it("finds a matching row (1-based)", () => {
    expect(findRowIndex(values, (cell) => cell === "Eagle")).toBe(3);
  });

  it("finds the first data row", () => {
    expect(findRowIndex(values, (cell) => cell === "Dragon")).toBe(2);
  });

  it("returns null when not found", () => {
    expect(findRowIndex(values, (cell) => cell === "Missing")).toBeNull();
  });

  it("skips the header row", () => {
    expect(findRowIndex(values, (cell) => cell === "name")).toBeNull();
  });

  it("returns null for empty values", () => {
    expect(findRowIndex([], () => true)).toBeNull();
  });

  it("returns null for header-only values", () => {
    expect(findRowIndex([["header"]], () => true)).toBeNull();
  });

  it("supports multi-column predicate via row parameter", () => {
    const multiCol = [
      ["colA", "colB"],
      ["A", "B"],
      ["C", "D"],
    ];
    expect(findRowIndex(multiCol, (_, row) => row[0] === "C" && row[1] === "D")).toBe(3);
  });

  it("handles case-insensitive matching in predicate", () => {
    expect(findRowIndex(values, (cell) => cell.toLowerCase() === "blue eyes")).toBe(4);
  });
});

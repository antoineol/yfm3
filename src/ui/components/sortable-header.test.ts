import { describe, expect, it } from "vitest";
import { sortEntries, toggleSort } from "./sortable-header.tsx";

describe("toggleSort", () => {
  it("defaults to asc for id", () => {
    expect(toggleSort(null, "id")).toEqual({ key: "id", dir: "asc" });
  });

  it("defaults to desc for atk", () => {
    expect(toggleSort(null, "atk")).toEqual({ key: "atk", dir: "desc" });
  });

  it("toggles id asc → desc → null", () => {
    expect(toggleSort({ key: "id", dir: "asc" }, "id")).toEqual({ key: "id", dir: "desc" });
    expect(toggleSort({ key: "id", dir: "desc" }, "id")).toBeNull();
  });

  it("toggles atk desc → asc → null", () => {
    expect(toggleSort({ key: "atk", dir: "desc" }, "atk")).toEqual({ key: "atk", dir: "asc" });
    expect(toggleSort({ key: "atk", dir: "asc" }, "atk")).toBeNull();
  });

  it("resets to firstDir when switching columns", () => {
    expect(toggleSort({ key: "id", dir: "asc" }, "atk")).toEqual({ key: "atk", dir: "desc" });
    expect(toggleSort({ key: "atk", dir: "desc" }, "id")).toEqual({ key: "id", dir: "asc" });
  });
});

describe("sortEntries", () => {
  const entries = [
    { id: 3, atk: 1000 },
    { id: 1, atk: 3000 },
    { id: 2, atk: 2000 },
  ];
  const getters = { id: (e: (typeof entries)[0]) => e.id, atk: (e: (typeof entries)[0]) => e.atk };

  it("returns entries as-is when sort is null", () => {
    expect(sortEntries(entries, null, getters)).toBe(entries);
  });

  it("sorts by id asc", () => {
    const result = sortEntries(entries, { key: "id", dir: "asc" }, getters);
    expect(result.map((e) => e.id)).toEqual([1, 2, 3]);
  });

  it("sorts by id desc", () => {
    const result = sortEntries(entries, { key: "id", dir: "desc" }, getters);
    expect(result.map((e) => e.id)).toEqual([3, 2, 1]);
  });

  it("sorts by atk desc", () => {
    const result = sortEntries(entries, { key: "atk", dir: "desc" }, getters);
    expect(result.map((e) => e.atk)).toEqual([3000, 2000, 1000]);
  });

  it("sorts by atk asc", () => {
    const result = sortEntries(entries, { key: "atk", dir: "asc" }, getters);
    expect(result.map((e) => e.atk)).toEqual([1000, 2000, 3000]);
  });

  it("does not mutate the original array", () => {
    const original = [...entries];
    sortEntries(entries, { key: "id", dir: "asc" }, getters);
    expect(entries).toEqual(original);
  });
});

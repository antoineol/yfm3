import { describe, expect, it } from "vitest";
import { parseLockedIndices, probeLockedIsos } from "./iso-lock-probe.ts";

describe("parseLockedIndices", () => {
  it("parses an empty-array JSON", () => {
    expect(parseLockedIndices("[]")).toEqual([]);
  });

  it("parses a multi-element array", () => {
    expect(parseLockedIndices("[0,2]")).toEqual([0, 2]);
    expect(parseLockedIndices("[0, 1, 2]")).toEqual([0, 1, 2]);
  });

  it("normalizes ConvertTo-Json's bare-number single-element output", () => {
    // ConvertTo-Json emits `1` for a list of one int, not `[1]`. We must
    // accept both so the PowerShell side can stay simple.
    expect(parseLockedIndices("1")).toEqual([1]);
    expect(parseLockedIndices("0")).toEqual([0]);
  });

  it("returns empty for empty/whitespace stdout", () => {
    expect(parseLockedIndices("")).toEqual([]);
    expect(parseLockedIndices("   \n  ")).toEqual([]);
  });

  it("ignores non-integer entries rather than throwing", () => {
    expect(parseLockedIndices('[0, "skip", 2]')).toEqual([0, 2]);
  });
});

describe("probeLockedIsos", () => {
  it("returns an empty set for an empty input", async () => {
    const result = await probeLockedIsos([]);
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(0);
  });
});

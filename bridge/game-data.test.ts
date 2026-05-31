import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  type DiscCandidate,
  decideDiscMatch,
  scanForDiscImages,
  shouldSkipDiscScanDir,
} from "./game-data.ts";

const DISC_A = "/games/Mod_A.iso";
const DISC_B = "/games/Mod_B.iso";
const DISC_C = "/games/Mod_C.iso";

function candidate(binPath: string, exeSerial: string | null = null): DiscCandidate {
  return { binPath, discSerial: "SLUS_027.11", exeSerial };
}

describe("scanForDiscImages", () => {
  it("skips bridge backup directories", () => {
    expect(shouldSkipDiscScanDir(".yfm3-iso-backups")).toBe(true);
    expect(shouldSkipDiscScanDir(".YFM3-ISO-BACKUPS")).toBe(true);
    expect(shouldSkipDiscScanDir("Vanilla")).toBe(false);
  });

  it("does not treat ISO backups as active disc candidates", () => {
    const root = mkdtempSync(join(tmpdir(), "yfm3-discs-"));
    try {
      mkdirSync(join(root, ".yfm3-iso-backups", "Game.bin"), { recursive: true });
      mkdirSync(join(root, "Vanilla"), { recursive: true });
      writeFileSync(join(root, ".yfm3-iso-backups", "Game.bin", "20260531.iso"), "");
      writeFileSync(join(root, "Vanilla", "Game.iso"), "");

      const cues: string[] = [];
      const isos: string[] = [];
      scanForDiscImages(root, cues, isos, 0);

      expect(isos).toEqual([join(root, "Vanilla", "Game.iso")]);

      scanForDiscImages(join(root, ".yfm3-iso-backups"), cues, isos, 0);
      expect(isos).toEqual([join(root, "Vanilla", "Game.iso")]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("decideDiscMatch", () => {
  it("returns winner when exactly one candidate is locked", () => {
    const result = decideDiscMatch(
      [DISC_A, DISC_B],
      new Set([DISC_A]),
      [candidate(DISC_A), candidate(DISC_B)],
      "SLUS_027.11",
    );
    expect(result).toEqual({
      kind: "winner",
      binPath: DISC_A,
      discSerial: "SLUS_027.11",
      candidateCount: 2,
    });
  });

  it("trusts a single lock even when no hash candidates were probed", () => {
    // Cache-hit fast path: pickWinningDisc short-circuits before disambiguation.
    const result = decideDiscMatch([DISC_A, DISC_B], new Set([DISC_A]), [], "SLUS_027.11");
    expect(result).toEqual({
      kind: "winner",
      binPath: DISC_A,
      discSerial: null,
      candidateCount: 1,
    });
  });

  it("returns winner when the lock probe found nothing but only one disc matches the hash", () => {
    const result = decideDiscMatch([DISC_A, DISC_B], new Set(), [candidate(DISC_A)], "SLUS_027.11");
    expect(result).toMatchObject({ kind: "winner", binPath: DISC_A, candidateCount: 1 });
  });

  it("returns winner from a unique hash match even when RAM serial is missing", () => {
    const result = decideDiscMatch([DISC_A, DISC_B], new Set(), [candidate(DISC_A)], null);
    expect(result).toMatchObject({ kind: "winner", binPath: DISC_A, candidateCount: 1 });
  });

  it("returns none when no candidates match", () => {
    const result = decideDiscMatch([DISC_A], new Set(), [], "SLUS_027.11");
    expect(result).toEqual({ kind: "none" });
  });

  it("returns ambiguous when two discs share the EXE hash and no lock disambiguates", () => {
    // The bug repro: two byte-identical-EXE mods (Alpha base + BEWD test
    // sibling) both pass the hash check, neither is locked, both share the
    // RAM serial. Previously this silently picked candidates[0]; now the
    // bridge surfaces both paths so the user can resolve.
    const result = decideDiscMatch(
      [DISC_A, DISC_B],
      new Set(),
      [candidate(DISC_A, "SLUS_027.11"), candidate(DISC_B, "SLUS_027.11")],
      "SLUS_027.11",
    );
    expect(result).toEqual({ kind: "ambiguous", candidates: [DISC_A, DISC_B] });
  });

  it("uses RAM serial to disambiguate among multiple hash candidates with distinct EXE serials", () => {
    const result = decideDiscMatch(
      [DISC_A, DISC_B],
      new Set(),
      [candidate(DISC_A, "SLUS_027.11"), candidate(DISC_B, "SLES_039.48")],
      "SLES_039.48",
    );
    expect(result).toMatchObject({ kind: "winner", binPath: DISC_B });
  });

  it("returns ambiguous when multiple candidates share the matching EXE serial", () => {
    const result = decideDiscMatch(
      [DISC_A, DISC_B, DISC_C],
      new Set(),
      [
        candidate(DISC_A, "SLUS_027.11"),
        candidate(DISC_B, "SLUS_027.11"),
        candidate(DISC_C, "SLES_039.48"),
      ],
      "SLUS_027.11",
    );
    expect(result).toEqual({
      kind: "ambiguous",
      candidates: [DISC_A, DISC_B, DISC_C],
    });
  });

  it("returns ambiguous for multiple hash candidates when RAM serial is missing", () => {
    const result = decideDiscMatch(
      [DISC_A, DISC_B],
      new Set(),
      [candidate(DISC_A, "SLUS_027.11"), candidate(DISC_B, "SLES_039.48")],
      null,
    );
    expect(result).toEqual({ kind: "ambiguous", candidates: [DISC_A, DISC_B] });
  });

  it("ignores locks that point outside the candidate set", () => {
    // probeLockedIsos may return paths for a probe that doesn't intersect
    // discPaths (e.g. stale entries, race condition). Those must not be
    // promoted to winner.
    const result = decideDiscMatch(
      [DISC_A, DISC_B],
      new Set(["/games/Unrelated.iso"]),
      [candidate(DISC_A, "SLUS_027.11"), candidate(DISC_B, "SLUS_027.11")],
      "SLUS_027.11",
    );
    expect(result).toEqual({ kind: "ambiguous", candidates: [DISC_A, DISC_B] });
  });
});

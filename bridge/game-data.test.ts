import { describe, expect, it } from "vitest";
import { type DiscCandidate, decideDiscMatch } from "./game-data.ts";

const DISC_A = "/games/Mod_A.iso";
const DISC_B = "/games/Mod_B.iso";
const DISC_C = "/games/Mod_C.iso";

function candidate(binPath: string, exeSerial: string | null = null): DiscCandidate {
  return { binPath, discSerial: "SLUS_027.11", exeSerial };
}

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

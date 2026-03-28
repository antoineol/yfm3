import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  acquireGameData,
  computeGameDataHash,
  normalizeSerial,
  parseGameDirs,
  resolveBinPath,
} from "../../bridge/game-data.ts";

// ── normalizeSerial ─────────────────────────────────────────────

describe("normalizeSerial", () => {
  it("normalizes RAM format (underscore + dot)", () => {
    expect(normalizeSerial("SLES_039.48")).toBe("SLES03948");
  });

  it("normalizes gamelist format (dash)", () => {
    expect(normalizeSerial("SLES-03948")).toBe("SLES03948");
  });

  it("normalizes NTSC-U serial", () => {
    expect(normalizeSerial("SLUS_014.11")).toBe("SLUS01411");
  });

  it("uppercases", () => {
    expect(normalizeSerial("sles-03948")).toBe("SLES03948");
  });

  it("handles no separators", () => {
    expect(normalizeSerial("SLES03948")).toBe("SLES03948");
  });
});

// ── computeGameDataHash ─────────────────────────────────────────

describe("computeGameDataHash", () => {
  it("returns a 64-char hex SHA-256", () => {
    const data = new Uint8Array(2888).fill(0x42);
    const hash = computeGameDataHash(data);
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic", () => {
    const data = new Uint8Array(2888);
    data[0] = 0xab;
    data[100] = 0xcd;
    expect(computeGameDataHash(data)).toBe(computeGameDataHash(data));
  });

  it("differs for different inputs", () => {
    const a = new Uint8Array(2888).fill(0);
    const b = new Uint8Array(2888).fill(1);
    expect(computeGameDataHash(a)).not.toBe(computeGameDataHash(b));
  });
});

// ── parseGameDirs ──────────────────────────────────────────────

describe("parseGameDirs", () => {
  it("extracts RecursivePaths from [GameList] section", () => {
    const ini = "[GameList]\nRecursivePaths = C:\\jeux\\ps1\n[Other]\nFoo = bar\n";
    expect(parseGameDirs(ini)).toEqual(["C:\\jeux\\ps1"]);
  });

  it("handles CRLF line endings", () => {
    const ini = "[GameList]\r\nRecursivePaths = D:\\games\r\n[Hacks]\r\n";
    expect(parseGameDirs(ini)).toEqual(["D:\\games"]);
  });

  it("returns empty when no [GameList] section", () => {
    const ini = "[Hacks]\nExportSharedMemory = true\n";
    expect(parseGameDirs(ini)).toEqual([]);
  });

  it("returns empty when no RecursivePaths key", () => {
    const ini = "[GameList]\nSomeOtherKey = value\n";
    expect(parseGameDirs(ini)).toEqual([]);
  });

  it("trims whitespace from path", () => {
    const ini = "[GameList]\nRecursivePaths =   C:\\games  \n";
    expect(parseGameDirs(ini)).toEqual(["C:\\games"]);
  });
});

// ── resolveBinPath ──────────────────────────────────────────────

describe("resolveBinPath", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "yfm-test-"));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("extracts .bin path from a .cue file", () => {
    const binPath = join(tmpDir, "game.bin");
    const cuePath = join(tmpDir, "game.cue");
    writeFileSync(binPath, "dummy");
    writeFileSync(cuePath, 'FILE "game.bin" BINARY\n  TRACK 01 MODE2/2352\n');

    expect(resolveBinPath(cuePath)).toBe(binPath);
  });

  it("returns null when .bin file does not exist", () => {
    const cuePath = join(tmpDir, "missing.cue");
    writeFileSync(cuePath, 'FILE "nonexistent.bin" BINARY\n');

    expect(resolveBinPath(cuePath)).toBeNull();
  });

  it("returns null when .cue has no FILE directive", () => {
    const cuePath = join(tmpDir, "bad.cue");
    writeFileSync(cuePath, "TRACK 01 MODE2/2352\n");

    expect(resolveBinPath(cuePath)).toBeNull();
  });

  it("returns null when .cue file does not exist", () => {
    expect(resolveBinPath(join(tmpDir, "nope.cue"))).toBeNull();
  });

  it("falls back to directory scan when .cue references wrong filename", () => {
    const binPath = join(tmpDir, "game.bin");
    const cuePath = join(tmpDir, "game.cue");
    writeFileSync(binPath, "dummy");
    // .cue references a filename with extra spaces (doesn't match actual file)
    writeFileSync(cuePath, 'FILE "game  .bin" BINARY\n  TRACK 01 MODE2/2352\n');

    expect(resolveBinPath(cuePath)).toBe(binPath);
  });

  it("returns null when .cue references wrong filename and multiple .bin exist", () => {
    const cuePath = join(tmpDir, "game.cue");
    writeFileSync(join(tmpDir, "a.bin"), "dummy");
    writeFileSync(join(tmpDir, "b.bin"), "dummy");
    writeFileSync(cuePath, 'FILE "wrong.bin" BINARY\n');

    expect(resolveBinPath(cuePath)).toBeNull();
  });
});

// ── acquireGameData (cache round-trip) ──────────────────────────

describe("acquireGameData cache round-trip", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "yfm-cache-"));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns null when no serial and no cache", () => {
    const stats = new Uint8Array(2888).fill(1);
    const result = acquireGameData(stats, null, tmpDir);
    expect(result).toBeNull();
  });

  it("restores from cache when hash matches", () => {
    const stats = new Uint8Array(2888).fill(0x42);
    const hash = computeGameDataHash(stats);

    // Write a cache file manually (must include cards and duelists)
    const cache = {
      gameDataHash: hash,
      gameSerial: "SLES_039.48",
      capturedAt: new Date().toISOString(),
      cardStats: Buffer.from(stats).toString("base64"),
      cards: [
        {
          id: 1,
          name: "Test",
          atk: 100,
          def: 200,
          gs1: "Sun",
          gs2: "Moon",
          type: "Dragon",
          color: "",
          level: 1,
          attribute: "Light",
          description: "",
          starchipCost: 0,
          password: "",
        },
      ],
      duelists: [{ id: 1, name: "Simon", deck: [], saPow: [], bcd: [], saTec: [] }],
      fusions: [{ m1: 1, m2: 2, r: 3 }],
      equips: [{ e: 600, m: [1, 2, 3] }],
    };
    writeFileSync(join(tmpDir, "game-data-cache.json"), JSON.stringify(cache));

    const result = acquireGameData(stats, "SLES_039.48", tmpDir);
    expect(result).not.toBeNull();
    expect(result?.gameDataHash).toBe(hash);
    expect(result?.cards).toHaveLength(1);
    expect(result?.duelists).toHaveLength(1);
    expect(result?.fusionTable).toEqual([{ material1: 1, material2: 2, result: 3 }]);
    expect(result?.equipTable).toEqual([{ equipId: 600, monsterIds: [1, 2, 3] }]);
    expect(result?.cardStats).toEqual(stats);
  });

  it("ignores cache when hash differs", () => {
    const stats = new Uint8Array(2888).fill(0x42);
    const differentStats = new Uint8Array(2888).fill(0x99);

    // Cache was for different stats
    const cache = {
      gameDataHash: computeGameDataHash(differentStats),
      gameSerial: "SLES_039.48",
      capturedAt: new Date().toISOString(),
      cardStats: Buffer.from(differentStats).toString("base64"),
      fusions: [],
      equips: [],
    };
    writeFileSync(join(tmpDir, "game-data-cache.json"), JSON.stringify(cache));

    // No DuckStation available, so returns null after cache miss
    const result = acquireGameData(stats, "SLES_039.48", tmpDir);
    expect(result).toBeNull();
  });
});

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

// ── acquireGameData ─────────────────────────────────────────────

describe("acquireGameData", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "yfm-cache-"));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  // Every call re-resolves the running disc and extracts content from it —
  // there is no JSON content cache. With no DuckStation and no disc images
  // reachable, the only possible outcome is `none`.

  it("returns kind 'none' when no disc images are available", async () => {
    const stats = new Uint8Array(2888).fill(1);
    const result = await acquireGameData(stats, null, tmpDir);
    expect(result).toEqual({ kind: "none" });
  });
});

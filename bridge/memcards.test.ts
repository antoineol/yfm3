import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  extractGameCodeFromMemcard,
  formatBackupName,
  listBackups,
  parseBackupTimestamp,
  parseMemcardConfig,
  prunedBackups,
  resolveMemcardsDir,
  sanitizeTitleForFilename,
  writeSaveWithBackup,
} from "./memcards.ts";
import { cleanWindowTitleToGameTitle } from "./process-info.ts";

describe("parseMemcardConfig", () => {
  it("uses documented defaults when [MemoryCards] is absent", () => {
    const cfg = parseMemcardConfig("[Hacks]\nExportSharedMemory = true\n");
    expect(cfg.directory).toBe("memcards");
    expect(cfg.card1Type).toBe("PerGameTitle");
    expect(cfg.card1Path).toBeNull();
  });

  it("reads Card1Type, Directory, Card1Path", () => {
    const ini = [
      "[Other]",
      "Key = x",
      "[MemoryCards]",
      "Directory = ../saves",
      "Card1Type = Shared",
      "Card1Path = shared_card_1.mcd",
      "",
    ].join("\n");
    const cfg = parseMemcardConfig(ini);
    expect(cfg.directory).toBe("../saves");
    expect(cfg.card1Type).toBe("Shared");
    expect(cfg.card1Path).toBe("shared_card_1.mcd");
  });

  it("stops at the next section boundary", () => {
    const ini = ["[MemoryCards]", "Directory = A", "[Other]", "Directory = B"].join("\n");
    expect(parseMemcardConfig(ini).directory).toBe("A");
  });

  it("tolerates CRLF line endings", () => {
    const ini = "[MemoryCards]\r\nDirectory = D:/PS1/cards\r\n";
    expect(parseMemcardConfig(ini).directory).toBe("D:/PS1/cards");
  });

  it("marks unknown Card1Type values so callers can fall back", () => {
    const ini = "[MemoryCards]\nCard1Type = SomeNewThing\n";
    expect(parseMemcardConfig(ini).card1Type).toBe("Unknown");
  });
});

describe("resolveMemcardsDir", () => {
  it("defaults to <dataDir>/memcards when directory is 'memcards'", () => {
    expect(resolveMemcardsDir("memcards", "/data")).toBe("/data/memcards");
  });

  it("keeps absolute paths unchanged", () => {
    expect(resolveMemcardsDir("/custom/path", "/data")).toBe("/custom/path");
  });

  it("recognizes Windows-style absolute paths", () => {
    expect(resolveMemcardsDir("D:/PS1/cards", "/data")).toBe("D:/PS1/cards");
  });

  it("joins relative paths to dataDir", () => {
    expect(resolveMemcardsDir("../shared", "/data/yu-gi-oh")).toContain("shared");
  });
});

describe("cleanWindowTitleToGameTitle", () => {
  it("returns a bare game title unchanged", () => {
    expect(cleanWindowTitleToGameTitle("Yu-Gi-Oh! Alpha Mod (Drop x15)")).toBe(
      "Yu-Gi-Oh! Alpha Mod (Drop x15)",
    );
  });

  it("strips the '- DuckStation' suffix", () => {
    expect(cleanWindowTitleToGameTitle("Yu-Gi-Oh! Alpha Mod (Drop x15) - DuckStation")).toBe(
      "Yu-Gi-Oh! Alpha Mod (Drop x15)",
    );
  });

  it("strips the '| DuckStation' separator variant", () => {
    expect(cleanWindowTitleToGameTitle("Game Title | DuckStation 0.1.9")).toBe("Game Title");
  });

  it("strips a trailing (Paused) marker", () => {
    expect(cleanWindowTitleToGameTitle("Game Title (Paused)")).toBe("Game Title");
  });

  it("strips both the status marker and the suffix together", () => {
    expect(cleanWindowTitleToGameTitle("Game Title (Paused) - DuckStation")).toBe("Game Title");
  });

  it("returns just 'DuckStation' when no game is loaded", () => {
    expect(cleanWindowTitleToGameTitle("DuckStation")).toBe("DuckStation");
  });
});

describe("sanitizeTitleForFilename", () => {
  it("preserves FM-style titles unchanged", () => {
    expect(sanitizeTitleForFilename("Yu-Gi-Oh! Alpha Mod (Drop x15)")).toBe(
      "Yu-Gi-Oh! Alpha Mod (Drop x15)",
    );
  });

  it("strips characters invalid on Windows filesystems", () => {
    expect(sanitizeTitleForFilename('A: "b" <c>?|/\\*')).toBe("A b c");
  });
});

describe("extractGameCodeFromMemcard", () => {
  function headerWith(code: string, offset: number): Uint8Array {
    const bytes = new Uint8Array(0x2000);
    const payload = `BA${code}0001saver001`;
    for (let i = 0; i < payload.length; i++) bytes[offset + i] = payload.charCodeAt(i);
    return bytes;
  }

  it("finds SLUS codes in the first directory entry", () => {
    expect(extractGameCodeFromMemcard(headerWith("SLUS-01411", 0x8a))).toBe("SLUS-01411");
  });

  it("finds PAL SLES codes", () => {
    expect(extractGameCodeFromMemcard(headerWith("SLES-03948", 0x100))).toBe("SLES-03948");
  });

  it("returns null when no BA-prefixed game code is present", () => {
    expect(extractGameCodeFromMemcard(new Uint8Array(0x2000))).toBeNull();
  });

  it("rejects malformed codes", () => {
    const bytes = new Uint8Array(0x2000);
    const junk = "BAXXXX-12345";
    for (let i = 0; i < junk.length; i++) bytes[0x8a + i] = junk.charCodeAt(i);
    expect(extractGameCodeFromMemcard(bytes)).toBeNull();
  });
});

describe("formatBackupName + parseBackupTimestamp", () => {
  it("uses zero-padded UTC components including milliseconds", () => {
    expect(formatBackupName(new Date(Date.UTC(2026, 3, 19, 14, 5, 7, 42)))).toBe(
      "backup_20260419-140507-042.mcd",
    );
  });

  it("round-trips filename → ISO timestamp", () => {
    const date = new Date(Date.UTC(2026, 0, 2, 3, 4, 5, 678));
    const name = formatBackupName(date);
    expect(parseBackupTimestamp(name)).toBe("2026-01-02T03:04:05.678Z");
  });

  it("accepts the `_NN` collision-suffix form", () => {
    expect(parseBackupTimestamp("backup_20260101-000000-000_07.mcd")).toBe(
      "2026-01-01T00:00:00.000Z",
    );
  });

  it("rejects non-backup filenames", () => {
    expect(parseBackupTimestamp("random.mcd")).toBeNull();
  });
});

describe("prunedBackups", () => {
  it("returns everything when under the limit", () => {
    const names = ["backup_20260101-000000-000.mcd", "backup_20260102-000000-000.mcd"];
    const { keep, drop } = prunedBackups(names, 50);
    expect(keep).toEqual(names);
    expect(drop).toEqual([]);
  });

  it("keeps the newest when over the limit (55 → 50)", () => {
    const names: string[] = [];
    for (let i = 1; i <= 55; i++) {
      const h = String(i).padStart(2, "0");
      names.push(`backup_20260101-${h}0000-000.mcd`);
    }
    // shuffle to verify sort-before-trim
    names.reverse();
    const { keep, drop } = prunedBackups(names, 50);
    expect(keep.length).toBe(50);
    expect(drop.length).toBe(5);
    expect(keep[0]).toBe("backup_20260101-060000-000.mcd");
    expect(keep[49]).toBe("backup_20260101-550000-000.mcd");
  });

  it("ignores filenames that do not match the backup pattern", () => {
    const { keep, drop } = prunedBackups(
      ["backup_20260101-000000-000.mcd", "garbage.mcd", "notes.txt"],
      50,
    );
    expect(keep).toEqual(["backup_20260101-000000-000.mcd"]);
    expect(drop).toEqual([]);
  });
});

describe("writeSaveWithBackup + listBackups (I/O)", () => {
  let root: string;
  let memcardPath: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "yfm3-saveeditor-test-"));
    memcardPath = join(root, "game.mcd");
    writeFileSync(memcardPath, new Uint8Array([1, 2, 3]));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it("backs up the old bytes before overwriting", () => {
    const backup = writeSaveWithBackup(memcardPath, new Uint8Array([9, 9, 9]));
    expect(backup).not.toBeNull();
    const backups = listBackups(memcardPath);
    expect(backups).toHaveLength(1);
    expect(backups[0]?.sizeBytes).toBe(3);
  });

  it("skips backup when no prior file exists", () => {
    const fresh = join(root, "fresh.mcd");
    const backup = writeSaveWithBackup(fresh, new Uint8Array([1]));
    expect(backup).toBeNull();
    expect(listBackups(fresh)).toHaveLength(0);
  });

  it("avoids collisions on rapid writes in the same second", () => {
    writeSaveWithBackup(memcardPath, new Uint8Array([1]));
    writeSaveWithBackup(memcardPath, new Uint8Array([2]));
    writeSaveWithBackup(memcardPath, new Uint8Array([3]));
    const backups = listBackups(memcardPath);
    expect(backups.length).toBeGreaterThanOrEqual(3);
    const uniqueNames = new Set(backups.map((b) => b.filename));
    expect(uniqueNames.size).toBe(backups.length);
  });

  it("prunes to MAX_BACKUPS=50 when over the limit", () => {
    const backupDir = join(root, ".yfm3-backups", "game.mcd");
    writeSaveWithBackup(memcardPath, new Uint8Array([2])); // creates the backup dir (1 real backup)
    for (let i = 1; i <= 54; i++) {
      const h = String(i).padStart(2, "0");
      writeFileSync(join(backupDir, `backup_20250101-${h}0000-000.mcd`), new Uint8Array([i]));
    }
    // Trigger another write → pruning runs.
    writeSaveWithBackup(memcardPath, new Uint8Array([3]));
    const remaining = readdirSync(backupDir).filter((f) => f.startsWith("backup_"));
    expect(remaining.length).toBe(50);
  });
});

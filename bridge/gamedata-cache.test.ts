import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type CachedGameData, readGameDataCache, writeGameDataCache } from "./gamedata-cache.ts";

const data: CachedGameData = {
  gameSerial: "SLUS_000.04",
  cards: [],
  duelists: [],
  fusionTable: [],
  equipTable: [],
  equipBonuses: null,
  perEquipBonuses: null,
  deckLimits: null,
  rankScoring: null,
};

describe("gamedata cache", () => {
  let tmpDir: string;
  let discPath: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "yfm-gamedata-cache-"));
    discPath = join(tmpDir, "game.bin");
    writeFileSync(discPath, "first");
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("reads cache entries for the same source disc signature", () => {
    writeGameDataCache(tmpDir, discPath, data);
    expect(readGameDataCache(tmpDir, discPath)).toEqual(data);
  });

  it("rejects cache entries when the source disc changes at the same path", () => {
    writeGameDataCache(tmpDir, discPath, data);
    writeFileSync(discPath, "changed size");
    expect(readGameDataCache(tmpDir, discPath)).toBeNull();
  });
});

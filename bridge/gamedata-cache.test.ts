import { mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { CardStats } from "./extract/types.ts";
import { NUM_CARDS } from "./extract/types.ts";
import { type CachedGameData, readGameDataCache, writeGameDataCache } from "./gamedata-cache.ts";

const data: CachedGameData = {
  gameSerial: "SLUS_000.04",
  cards: makeCards(),
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

  it("accepts cache entries when Windows rounds sub-millisecond mtimes", () => {
    const stat = statSync(discPath);
    writeFileSync(
      join(tmpDir, "gamedata.json"),
      JSON.stringify({
        version: 18,
        disc: { size: stat.size, mtimeMs: Math.trunc(stat.mtimeMs) },
        ...data,
      }),
    );

    expect(readGameDataCache(tmpDir, discPath)).toEqual(data);
  });

  it("rejects cache entries from older extractor versions", () => {
    const stat = statSync(discPath);
    writeFileSync(
      join(tmpDir, "gamedata.json"),
      JSON.stringify({
        version: 15,
        disc: { size: stat.size, mtimeMs: stat.mtimeMs },
        ...data,
      }),
    );

    expect(readGameDataCache(tmpDir, discPath)).toBeNull();
  });

  it("rejects cache entries with non-monster labels on cards that have stats", () => {
    const bad = structuredClone(data);
    const card = bad.cards[1];
    if (!card) throw new Error("missing test card");
    card.type = "Trap";
    card.atk = 800;

    writeGameDataCache(tmpDir, discPath, bad);

    expect(readGameDataCache(tmpDir, discPath)).toBeNull();
  });

  it("rejects cache entries with localized structural card types", () => {
    const bad = structuredClone(data);
    const card = bad.cards[620];
    if (!card) throw new Error("missing test card");
    card.type = "Magie";

    writeGameDataCache(tmpDir, discPath, bad);

    expect(readGameDataCache(tmpDir, discPath)).toBeNull();
  });

  it("rejects cache entries with card type names in guardian-star fields", () => {
    const bad = structuredClone(data);
    const card = bad.cards[0];
    if (!card) throw new Error("missing test card");
    card.gs1 = "Reptile";

    writeGameDataCache(tmpDir, discPath, bad);

    expect(readGameDataCache(tmpDir, discPath)).toBeNull();
  });

  it("rejects cache entries with truncated guardian-star names", () => {
    const bad = structuredClone(data);
    const card = bad.cards[2];
    if (!card) throw new Error("missing test card");
    card.gs1 = "iend";

    writeGameDataCache(tmpDir, discPath, bad);

    expect(readGameDataCache(tmpDir, discPath)).toBeNull();
  });
});

function makeCards(): CardStats[] {
  return Array.from({ length: NUM_CARDS }, (_, i) => ({
    id: i + 1,
    name: `Card ${i + 1}`,
    atk: i < 600 ? 100 : 0,
    def: i < 600 ? 100 : 0,
    gs1: i < 600 ? "Mars" : "None",
    gs2: i < 600 ? "Jupiter" : "None",
    type: i < 600 ? "Dragon" : "Magic",
    color: "",
    labelColor: "",
    level: i < 600 ? 1 : 0,
    attribute: "Light",
    description: "",
    starchipCost: 0,
    password: "",
  }));
}

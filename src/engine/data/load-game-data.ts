import fs from "node:fs";
import path from "node:path";
import { DEFAULT_MOD, type ModId } from "../mods.ts";
import type { OptBuffers } from "../types/buffers.ts";
import type { CardSpec } from "./card-model.ts";
import { loadGameDataFromStrings } from "./load-game-data-core.ts";

export { loadGameDataFromStrings } from "./load-game-data-core.ts";

const DATA_DIR = path.resolve(import.meta.dirname, "../../../public/data");

function readModCsv(modId: ModId, file: string): string {
  return fs.readFileSync(path.join(DATA_DIR, modId, file), "utf-8");
}

function readOptionalModCsv(modId: ModId, file: string): string | undefined {
  const fullPath = path.join(DATA_DIR, modId, file);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf-8") : undefined;
}

/**
 * Load game data from CSV files on disk and populate buffers.
 * Node/Bun only -- uses fs.readFileSync.
 */
export function loadGameData(buf: OptBuffers, modId: ModId = DEFAULT_MOD): CardSpec[] {
  return loadGameDataFromStrings(
    buf,
    readModCsv(modId, "cards.csv"),
    readModCsv(modId, "fusions.csv"),
    readModCsv(modId, "equips.csv"),
    readOptionalModCsv(modId, "deck-limits.csv"),
  );
}

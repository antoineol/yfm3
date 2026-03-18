import fs from "node:fs";
import path from "node:path";
import type { OptBuffers } from "../types/buffers.ts";
import type { CardSpec } from "./card-model.ts";
import { loadGameDataFromStrings } from "./load-game-data-core.ts";

export { loadGameDataFromStrings } from "./load-game-data-core.ts";

const DATA_DIR = path.resolve(import.meta.dirname, "../../../public/data");
const cardsCsv = fs.readFileSync(path.join(DATA_DIR, "cards.csv"), "utf-8");
const fusionsCsv = fs.readFileSync(path.join(DATA_DIR, "fusions.csv"), "utf-8");

/**
 * Load game data from binary CSV files on disk and populate buffers.
 * Node/Bun only -- uses fs.readFileSync.
 */
export function loadGameData(buf: OptBuffers): CardSpec[] {
  return loadGameDataFromStrings(buf, cardsCsv, fusionsCsv);
}

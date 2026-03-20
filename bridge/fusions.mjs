/**
 * Load the fusion table and build a lookup: given material A and a fusion result,
 * find material B such that fusion(A, B) = result.
 *
 * This is used to identify consumed materials after a 2-card fusion, since the
 * game's RAM doesn't always mark the second material.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Build a fusion lookup from fusions.csv.
 * Returns a Map: `${material1}_${result}` → material2 (and vice versa).
 * Given one known material and the result, you can find the other material.
 */
export function loadFusionLookup() {
  const dir = dirname(fileURLToPath(import.meta.url));
  const csvPath = join(dir, "fusions.csv");
  const csv = readFileSync(csvPath, "utf-8");
  const lines = csv.trim().split("\n");

  // Map: "materialA_result" → Set of possible materialB values
  const lookup = new Map();

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    const m1 = Number(parts[0]);
    const m2 = Number(parts[1]);
    const result = Number(parts[2]);

    // Given m1 and result, the partner is m2
    const key1 = `${m1}_${result}`;
    if (!lookup.has(key1)) lookup.set(key1, new Set());
    lookup.get(key1).add(m2);

    // Given m2 and result, the partner is m1
    const key2 = `${m2}_${result}`;
    if (!lookup.has(key2)) lookup.set(key2, new Set());
    lookup.get(key2).add(m1);
  }

  console.log(`Loaded fusion lookup: ${lines.length - 1} fusions`);
  return lookup;
}

/**
 * Given a known material and fusion result, find the possible partner materials.
 */
export function findFusionPartner(lookup, knownMaterial, result) {
  const key = `${knownMaterial}_${result}`;
  return lookup.get(key) || new Set();
}

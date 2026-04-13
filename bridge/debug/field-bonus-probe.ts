/**
 * Probe: find the field bonus table in PS1 RAM and print candidate matrices.
 *
 * Usage:
 *   cd bridge && bun debug/field-bonus-probe.ts
 *
 * The vanilla/RP scanner accepts only {0, +50, -50} as bonus bytes. Mods
 * (e.g. Alpha) may use other multiples of 10 — this probe relaxes the
 * signature to any multiple of 10 in ±100 and dumps every hit as a
 * (20 types × 6 terrains) matrix for visual inspection.
 *
 * Also reads the current terrain id from the NTSC-U offset profile so
 * you can identify which column corresponds to the active field card.
 */

import {
  DEFAULT_PROFILE,
  findDuckStationPids,
  isGameLoaded,
  isLooseFieldBonusByte,
  isStrictFieldBonusByte,
  openSharedMemory,
  readFieldBonusTable,
  scanFieldBonusTableCandidates,
} from "../memory.ts";

const TYPE_NAMES = [
  "Dragon",
  "Spellcaster",
  "Zombie",
  "Warrior",
  "Beast-Warrior",
  "Beast",
  "Winged Beast",
  "Fiend",
  "Fairy",
  "Insect",
  "Dinosaur",
  "Reptile",
  "Fish",
  "Sea Serpent",
  "Machine",
  "Thunder",
  "Aqua",
  "Pyro",
  "Rock",
  "Plant",
];

function formatMatrix(table: number[], highlightTerrain?: number): string {
  const header = `${"Type".padEnd(14)} | T1    T2    T3    T4    T5    T6`;
  const lines = [header, "-".repeat(header.length)];
  for (let t = 0; t < TYPE_NAMES.length; t++) {
    const row = table.slice(t * 6, t * 6 + 6);
    const cells = row
      .map((v, ti) => {
        const cell =
          v === 0 ? "    0" : v > 0 ? `+${v.toString().padStart(4)}` : v.toString().padStart(5);
        return ti + 1 === highlightTerrain ? `[${cell}]` : ` ${cell} `;
      })
      .join("");
    lines.push(`${(TYPE_NAMES[t] ?? "?").padEnd(14)} |${cells}`);
  }
  return lines.join("\n");
}

async function main(): Promise<void> {
  const pids = await findDuckStationPids();
  const pid = pids[0];
  if (pid === undefined) {
    console.error("No DuckStation process found");
    process.exit(1);
  }
  const mapping = openSharedMemory(pid);
  if (!mapping) {
    console.error("Failed to open shared memory");
    process.exit(1);
  }
  if (!isGameLoaded(mapping.view)) {
    console.error("Game not loaded in DuckStation");
    process.exit(1);
  }
  const view = mapping.view;

  const terrainId = view.getUint8(DEFAULT_PROFILE.terrain);
  console.log(
    `Current terrain id (NTSC-U profile 0x${DEFAULT_PROFILE.terrain.toString(16)}): ${terrainId}`,
  );

  const strictHits = scanFieldBonusTableCandidates(view, isStrictFieldBonusByte, 16);
  const looseHits = scanFieldBonusTableCandidates(view, isLooseFieldBonusByte, 16);
  console.log(`Strict signature {0,±50} hits: ${strictHits.length}`);
  console.log(`Loose signature  multiples of 10 in ±100 hits: ${looseHits.length}`);

  for (const off of looseHits) {
    const table = readFieldBonusTable(view, off);
    const tag = strictHits.includes(off) ? "strict" : "loose";
    console.log(
      `\n── Candidate @ 0x${off.toString(16)} (${tag}) — file offset ~0x${(off - 0x10000).toString(16)} ──`,
    );
    console.log(formatMatrix(table, terrainId || undefined));
  }

  if (looseHits.length === 0) {
    console.log(
      "No candidates — either the table uses a different encoding, or scan range is wrong.",
    );
  }
}

if (import.meta.main) await main();

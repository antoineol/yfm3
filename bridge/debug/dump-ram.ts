/**
 * Debug utility: dump full PS1 RAM (2 MB) to a binary file.
 *
 * Usage from the bridge's serve.ts:
 *
 *   import { dumpRam } from "./debug/dump-ram.ts";
 *
 *   // Inside poll() after mapping is available:
 *   await dumpRam(mapping.view, join(import.meta.dir, "ram-dump.bin"));
 *
 * Or standalone (requires DuckStation with shared memory enabled):
 *
 *   bun debug/dump-ram.ts [output-path]
 */

import { writeFileSync } from "node:fs";

const PS1_RAM_SIZE = 0x200000; // 2 MB

/**
 * Read the full PS1 RAM from a mapped shared memory DataView and write it
 * to a binary file.
 *
 * @param view  DataView over the mapped shared memory
 * @param outputPath  Destination file path
 * @returns Bytes written
 */
export function dumpRam(view: DataView, outputPath: string): number {
  const buf = new Uint8Array(view.buffer, view.byteOffset, PS1_RAM_SIZE);
  writeFileSync(outputPath, buf);
  return PS1_RAM_SIZE;
}

// ── CLI entry point ─────────────────────────────────────────────────
if (import.meta.main) {
  const { findDuckStationPids, openSharedMemory, isGameLoaded } = await import("../memory.ts");

  const pids = await findDuckStationPids();
  if (pids.length === 0) {
    console.error("No DuckStation process found");
    process.exit(1);
  }

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

  const outputPath = process.argv[2] || "ram-dump.bin";
  console.log(`Dumping ${PS1_RAM_SIZE} bytes to ${outputPath}...`);
  const size = dumpRam(mapping.view, outputPath);
  console.log(`Done: ${size} bytes written`);
}

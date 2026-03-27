/**
 * Debug utility: dump full PS1 RAM (2 MB) to a binary file.
 *
 * Usage from the bridge's serve.mjs:
 *
 *   import { dumpRam } from "./debug/dump-ram.mjs";
 *
 *   // Inside poll() after mapping is available:
 *   await dumpRam(mapping.view, join(__dirname, "ram-dump.bin"));
 *
 * Or standalone (requires DuckStation with shared memory enabled):
 *
 *   node debug/dump-ram.mjs [output-path]
 */

import { writeFileSync } from "node:fs";
import koffi from "koffi";

const PS1_RAM_SIZE = 0x200000; // 2 MB

/**
 * Read the full PS1 RAM from a mapped shared memory view and write it
 * to a binary file. Reads in uint32 chunks for speed (~80 ms on a
 * typical machine).
 *
 * @param {*} view  Koffi mapped view from openSharedMemory()
 * @param {string} outputPath  Destination file path
 * @returns {number} Bytes written
 */
export async function dumpRam(view, outputPath) {
  const buf = Buffer.alloc(PS1_RAM_SIZE);
  for (let i = 0; i < PS1_RAM_SIZE; i += 4) {
    buf.writeUInt32LE(koffi.decode(view, i, "uint32"), i);
  }
  writeFileSync(outputPath, buf);
  return buf.length;
}

// ── CLI entry point ─────────────────────────────────────────────────
if (process.argv[1]?.replace(/\\/g, "/").endsWith("debug/dump-ram.mjs")) {
  const { findDuckStationPids, openSharedMemory, isGameLoaded } = await import("../memory.mjs");

  const pids = await findDuckStationPids();
  if (pids.length === 0) {
    console.error("No DuckStation process found");
    process.exit(1);
  }

  const mapping = openSharedMemory(pids[0]);
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
  const size = await dumpRam(mapping.view, outputPath);
  console.log(`Done: ${size} bytes written`);
}

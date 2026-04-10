/**
 * Extract card stats, fusion table, and artwork from a Yu-Gi-Oh! Forbidden
 * Memories PS1 disc image (.bin file, MODE2/2352 format).
 *
 * Usage:
 *   bun run scripts/extract-game-data.ts <path-to.bin> [output-dir]
 *
 * Example:
 *   bun run scripts/extract-game-data.ts "gamedata/Yu-Gi-Oh! FM REMASTERED PERFECTED.bin" gamedata
 */

import fs from "node:fs";
import path from "node:path";
import {
  detectArtworkBlockSize,
  extractAllArtwork,
  extractAllCsvs,
  langIdxForSerial,
  loadDiscData,
} from "../bridge/extract/index.ts";

// Re-export public API for verify-game-data.ts and tests
export { extractAllCsvs, langIdxForSerial, loadDiscData } from "../bridge/extract/index.ts";
export { CHAR_TABLE, decodeTblString, PAL_CHAR_TABLE } from "../bridge/extract/text-decoding.ts";

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(
      "Usage: bun run scripts/extract-game-data.ts <path-to.bin> [output-dir]\n" +
        "\n" +
        "Extracts card stats and fusion table from a YFM PS1 disc image.\n" +
        "Output dir defaults to ./public/data",
    );
    process.exit(1);
  }

  const binPath = args[0] ?? "";
  const outDir = args[1] ?? "./public/data";

  console.log(`Reading disc image: ${binPath}`);
  const { slus, waMrg, serial } = loadDiscData(binPath);
  console.log(`  Serial: ${serial}`);
  console.log(`  WA_MRG.MRG: ${(waMrg.length / 1024 / 1024).toFixed(1)} MB`);

  // Detect disc language for PAL discs
  const langIdx = langIdxForSerial(serial);
  const langLabels = ["EN", "FR", "DE", "IT", "ES"];
  if (langIdx !== undefined) {
    console.log(`  PAL language: ${langLabels[langIdx]} (block ${langIdx})`);
  }

  // Extract all CSVs (using the detected language for PAL discs)
  const csvs = extractAllCsvs(slus, waMrg, langIdx);

  // Write CSV output
  fs.mkdirSync(outDir, { recursive: true });
  for (const [fileName, content] of Object.entries(csvs)) {
    const filePath = path.join(outDir, fileName);
    fs.writeFileSync(filePath, content);
    const rows = content.trimEnd().split("\n").length - 1;
    console.log(`Wrote ${rows} rows to ${filePath}`);
  }

  // sharp lives in scripts/package.json to avoid bloating the Vercel deployment.
  // Run `cd scripts && bun install` before using this script.
  const sharp = await import("sharp")
    .then((m) => m.default)
    .catch(() => {
      console.error("sharp is required for image extraction: run `cd scripts && bun install`");
      process.exit(1);
    });

  // Extract full card artwork (102×96) — versioned by mod/disc
  const modName = path.basename(outDir); // e.g. "rp" or "vanilla"
  const artDir = path.join("./public/images/artwork", modName);
  const artBlockSize = detectArtworkBlockSize(waMrg);
  await extractAllArtwork(waMrg, artBlockSize, artDir, sharp);
  console.log(`Wrote 722 card artwork images to ${artDir}/`);
}

if (process.argv[1]?.endsWith("extract-game-data.ts")) {
  void main();
}

/**
 * Verify extracted game data against reference CSVs.
 *
 * Extracts CSV data from a PS1 disc image (.bin) and compares each file
 * with a reference directory using set-based row comparison. Reports all
 * differences: rows only in extracted, rows only in reference, and header
 * mismatches.
 *
 * Usage:
 *   bun run scripts/verify-game-data.ts <path-to.bin> <reference-dir>
 *
 * Example:
 *   bun run scripts/verify-game-data.ts "gamedata/rp-bin/Yu-Gi-Oh! FM REMASTERED PERFECTED  .bin" tests/data/rp
 */

import fs from "node:fs";
import path from "node:path";
import { extractAllCsvs, langIdxForSerial, loadDiscData } from "./extract-game-data.ts";

// ---------------------------------------------------------------------------
// CSV comparison
// ---------------------------------------------------------------------------

interface CompareResult {
  fileName: string;
  ok: boolean;
  extractedRows: number;
  referenceRows: number;
  diffs: string[];
}

const MAX_SHOWN = 30;

function compareCsv(extracted: string, referencePath: string, fileName: string): CompareResult {
  const reference = fs.readFileSync(referencePath, "utf-8");
  const extLines = extracted.trimEnd().split("\n");
  const refLines = reference.trimEnd().split("\n");
  const diffs: string[] = [];

  // Compare headers
  const extHeader = extLines[0] ?? "";
  const refHeader = refLines[0] ?? "";
  if (extHeader !== refHeader) {
    diffs.push(`  Header mismatch:\n    extracted: ${extHeader}\n    reference: ${refHeader}`);
  }

  // Compare data rows as sets (order-independent)
  const extData = new Set(extLines.slice(1));
  const refData = new Set(refLines.slice(1));

  const onlyInExtracted: string[] = [];
  for (const line of extData) {
    if (!refData.has(line)) onlyInExtracted.push(line);
  }

  const onlyInReference: string[] = [];
  for (const line of refData) {
    if (!extData.has(line)) onlyInReference.push(line);
  }

  if (onlyInExtracted.length > 0) {
    diffs.push(`  ${onlyInExtracted.length} row(s) only in extracted (not in reference):`);
    for (const line of onlyInExtracted.slice(0, MAX_SHOWN)) {
      diffs.push(`    + ${line}`);
    }
    if (onlyInExtracted.length > MAX_SHOWN) {
      diffs.push(`    ... and ${onlyInExtracted.length - MAX_SHOWN} more`);
    }
  }

  if (onlyInReference.length > 0) {
    diffs.push(`  ${onlyInReference.length} row(s) only in reference (not in extracted):`);
    for (const line of onlyInReference.slice(0, MAX_SHOWN)) {
      diffs.push(`    - ${line}`);
    }
    if (onlyInReference.length > MAX_SHOWN) {
      diffs.push(`    ... and ${onlyInReference.length - MAX_SHOWN} more`);
    }
  }

  const ok = diffs.length === 0;
  return {
    fileName,
    ok,
    extractedRows: extLines.length - 1,
    referenceRows: refLines.length - 1,
    diffs,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: bun run scripts/verify-game-data.ts <path-to.bin> <reference-dir>");
    process.exit(1);
  }

  const binPath = args[0] ?? "";
  const refDir = args[1] ?? "";

  console.log(`Extracting data from: ${binPath}`);
  const { slus, waMrg, serial } = loadDiscData(binPath);
  console.log(`  Serial: ${serial}`);

  const langIdx = langIdxForSerial(serial);
  console.log("Generating CSVs...");
  const csvs = extractAllCsvs(slus, waMrg, langIdx);

  console.log(`Comparing with reference: ${refDir}\n`);

  const results: CompareResult[] = [];
  for (const [fileName, content] of Object.entries(csvs)) {
    const refPath = path.join(refDir, fileName);
    if (!fs.existsSync(refPath)) {
      results.push({
        fileName,
        ok: false,
        extractedRows: 0,
        referenceRows: 0,
        diffs: [`reference file not found: ${refPath}`],
      });
      continue;
    }
    results.push(compareCsv(content, refPath, fileName));
  }

  // Print results
  let hasDiffs = false;
  for (const r of results) {
    if (r.ok) {
      console.log(`\u2713 ${r.fileName}: OK (${r.extractedRows} rows match)`);
    } else {
      hasDiffs = true;
      const countNote =
        r.extractedRows !== r.referenceRows
          ? ` (extracted: ${r.extractedRows} rows, reference: ${r.referenceRows} rows)`
          : "";
      console.log(`\u2717 ${r.fileName}${countNote}`);
      for (const d of r.diffs) {
        console.log(d);
      }
      console.log();
    }
  }

  if (hasDiffs) {
    process.exit(1);
  } else {
    console.log("\nAll files match reference data.");
  }
}

main();

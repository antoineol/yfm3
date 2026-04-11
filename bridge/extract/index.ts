// ---------------------------------------------------------------------------
// Public API: loadDiscData(), extractAllCsvs(), extractAllArtwork()
// ---------------------------------------------------------------------------

import fs from "node:fs";
import { cardsToCsv, duelistsToCsv, equipsToCsv, fusionsToCsv } from "./csv.ts";
import { detectAttributeMapping, detectExeLayout } from "./detect-exe.ts";
import { detectWaMrgLayout } from "./detect-wamrg.ts";
import { findAllWaMrgTextBlocks } from "./detect-wamrg-text.ts";
import { extractCards } from "./extract-cards.ts";
import { extractDuelists } from "./extract-duelists.ts";
import { extractEquips } from "./extract-equips.ts";
import { extractFusions } from "./extract-fusions.ts";
import {
  detectDiscFormat,
  findFile,
  PVD_SECTOR,
  parseDirectory,
  readIsoFile,
  readSector,
  readSectors,
  SECTOR_DATA_SIZE,
} from "./iso9660.ts";

// Re-export for consumers
export { extractAllArtwork, FULL_IMG_HEIGHT, FULL_IMG_WIDTH } from "./extract-images.ts";
export type { CardStats, DuelistData, EquipEntry, Fusion, WaMrgLayout } from "./types.ts";

// ---------------------------------------------------------------------------
// Disc loading
// ---------------------------------------------------------------------------

export function loadDiscData(discPath: string): {
  slus: Buffer;
  waMrg: Buffer;
  /** Disc serial extracted from the PS1 executable filename (e.g. "SLES_039.48"). */
  serial: string;
} {
  const bin = fs.readFileSync(discPath);
  const fmt = detectDiscFormat(bin);

  const pvd = readSector(bin, PVD_SECTOR, fmt);
  if (pvd.subarray(1, 6).toString("ascii") !== "CD001") {
    throw new Error("Not a valid ISO 9660 disc image");
  }

  const rootRecord = pvd.subarray(156, 190);
  const rootExtent = rootRecord.readUInt32LE(2);
  const rootSize = rootRecord.readUInt32LE(10);
  const rootData = readSectors(bin, rootExtent, Math.ceil(rootSize / SECTOR_DATA_SIZE), fmt);
  const rootFiles = parseDirectory(rootData, rootSize);

  const { exeEntry, serial } = findExe(bin, rootFiles, fmt);

  return {
    slus: readIsoFile(bin, exeEntry, fmt),
    waMrg: findWaMrg(bin, rootFiles, fmt),
    serial,
  };
}

// ---------------------------------------------------------------------------
// EXE & WA_MRG resolution (supports non-standard disc layouts)
// ---------------------------------------------------------------------------

/** Standard PS1 serial filename regex (e.g. "SLUS_014.11"). */
const SERIAL_RE = /^S[CL][A-Z]{2}_\d/;

/**
 * Find the PS1 executable on a disc image.
 * Tries standard serial-named files first, then falls back to parsing
 * SYSTEM.CNF's BOOT entry (handles mods with renamed executables).
 */
function findExe(
  bin: Buffer,
  rootFiles: ReturnType<typeof parseDirectory>,
  fmt: ReturnType<typeof detectDiscFormat>,
): { exeEntry: (typeof rootFiles)[number]; serial: string } {
  const standard = rootFiles.find((f) => SERIAL_RE.test(f.name));
  if (standard) return { exeEntry: standard, serial: standard.name.replace(/;.*$/, "") };

  const cnfEntry = rootFiles.find((f) => f.name === "SYSTEM.CNF");
  if (!cnfEntry) {
    throw new Error(
      `No PS1 executable found in disc image (files: ${rootFiles.map((f) => f.name).join(", ")})`,
    );
  }
  const cnfData = readIsoFile(bin, cnfEntry, fmt);
  const bootName = parseBootExeName(cnfData.toString("ascii"));
  if (!bootName) {
    throw new Error("Could not parse BOOT entry from SYSTEM.CNF");
  }
  const exeEntry = rootFiles.find((f) => f.name === bootName);
  if (!exeEntry) {
    throw new Error(`Boot executable '${bootName}' not found on disc`);
  }
  return { exeEntry, serial: bootName };
}

/** Extract the executable filename from a SYSTEM.CNF BOOT line. */
export function parseBootExeName(cnf: string): string | null {
  const match = cnf.match(/BOOT\s*=\s*cdrom:\\?(.+)/i);
  if (!match?.[1]) return null;
  return match[1].trim().replace(/;.*$/, "");
}

/**
 * Find WA_MRG.MRG data on a disc image.
 * Tries the standard path (DATA/WA_MRG.MRG) first, then scans root-level
 * subdirectories for a file with valid WA_MRG layout (handles mods that
 * reorganize the disc structure).
 */
function findWaMrg(
  bin: Buffer,
  rootFiles: ReturnType<typeof parseDirectory>,
  fmt: ReturnType<typeof detectDiscFormat>,
): Buffer {
  try {
    return findFile(bin, rootFiles, "DATA/WA_MRG.MRG", fmt);
  } catch {
    // Fallback: scan subdirectories for a WA_MRG-compatible file
  }

  for (const dir of rootFiles) {
    if (!dir.isDir) continue;
    const dirData = readSectors(bin, dir.sector, Math.ceil(dir.size / SECTOR_DATA_SIZE), fmt);
    const files = parseDirectory(dirData, dir.size);
    for (const f of files) {
      if (f.isDir || f.size < 10_000_000) continue;
      try {
        const data = readIsoFile(bin, f, fmt);
        detectWaMrgLayout(data);
        return data;
      } catch {
        // not WA_MRG-compatible, try next file
      }
    }
  }

  throw new Error("WA_MRG.MRG not found in disc image");
}

// ---------------------------------------------------------------------------
// Disc serial → PAL language block index
// ---------------------------------------------------------------------------

/**
 * Maps known PAL disc serials to the WA_MRG text block index (0=EN, 1=FR, 2=DE, 3=IT, 4=ES).
 * NTSC-U serials are absent — they use EXE-embedded text, not WA_MRG blocks.
 */
const SERIAL_LANG_IDX: Record<string, number> = {
  SLES_039_47: 0, // PAL English
  SLES_039_48: 1, // PAL French
  SLES_039_49: 2, // PAL German
  SLES_039_50: 3, // PAL Italian
  SLES_039_51: 4, // PAL Spanish
};

/** Resolve a disc serial to a PAL language block index, or undefined for NTSC-U / unknown. */
export function langIdxForSerial(serial: string): number | undefined {
  // Normalize: "SLES_039.48" → "SLES_039_48"
  const key = serial.replace(".", "_");
  return SERIAL_LANG_IDX[key];
}

// ---------------------------------------------------------------------------
// Full CSV extraction
// ---------------------------------------------------------------------------

/**
 * Extract all CSVs from disc data.
 * @param langIdx - PAL language block index (0–4). When undefined, uses block 0
 *   for PAL discs. Ignored for NTSC-U (text comes from the EXE, not WA_MRG).
 */
export function extractAllCsvs(
  slus: Buffer,
  waMrg: Buffer,
  langIdx?: number,
): Record<string, string> {
  const exeLayout = detectExeLayout(slus);
  const waMrgLayout = detectWaMrgLayout(waMrg);
  const cardAttributes = detectAttributeMapping(slus, exeLayout, langIdx);
  const waMrgTextBlocks = exeLayout.nameOffsetTable === -1 ? findAllWaMrgTextBlocks(waMrg) : [];

  const cards = extractCards(
    slus,
    waMrg,
    exeLayout,
    waMrgLayout,
    cardAttributes,
    waMrgTextBlocks,
    langIdx,
  );
  const fusions = extractFusions(waMrg, waMrgLayout);
  const equips = extractEquips(waMrg, waMrgLayout);
  const duelists = extractDuelists(slus, waMrg, exeLayout, waMrgLayout, waMrgTextBlocks, langIdx);
  const cardAtk = new Map(cards.map((c) => [c.id, c.atk]));

  return {
    "cards.csv": cardsToCsv(cards),
    "fusions.csv": fusionsToCsv(fusions, cardAtk),
    "equips.csv": equipsToCsv(equips),
    "duelists.csv": duelistsToCsv(duelists),
  };
}

/** Detect layout and return the artwork block size (needed by CLI for artwork extraction). */
export function detectArtworkBlockSize(waMrg: Buffer): number {
  return detectWaMrgLayout(waMrg).artworkBlockSize;
}

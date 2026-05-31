// ---------------------------------------------------------------------------
// Public API: loadDiscData(), extractAllCsvs(), extractAllArtwork()
// ---------------------------------------------------------------------------

import fs from "node:fs";
import { cardsToCsv, deckLimitsToCsv, duelistsToCsv, equipsToCsv, fusionsToCsv } from "./csv.ts";
import { detectAttributeMapping, detectDiscExeLayout } from "./detect-exe.ts";
import { detectWaMrgLayout } from "./detect-wamrg.ts";
import { findAllWaMrgTextBlocks } from "./detect-wamrg-text.ts";
import { extractCards } from "./extract-cards.ts";
import { extractDeckLimits } from "./extract-deck-limits.ts";
import { extractDuelists } from "./extract-duelists.ts";
import { extractEquips } from "./extract-equips.ts";
import { extractFusions } from "./extract-fusions.ts";
import {
  type DiscFormat,
  detectDiscFormat,
  PVD_SECTOR,
  parseDirectory,
  readIsoFileFromFd,
  readSectorFromFd,
  readSectorsFromFd,
  SECTOR_DATA_SIZE,
} from "./iso9660.ts";
import type { IsoFile } from "./types.ts";

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
  const fd = fs.openSync(discPath, "r");
  try {
    // 64 KB covers PVD at sector 16 in both supported sector layouts.
    const head = Buffer.alloc(64 * 1024);
    fs.readSync(fd, head, 0, head.length, 0);
    const fmt = detectDiscFormat(head);

    const pvd = readSectorFromFd(fd, PVD_SECTOR, fmt);
    if (pvd.subarray(1, 6).toString("ascii") !== "CD001") {
      throw new Error("Not a valid ISO 9660 disc image");
    }

    const rootRecord = pvd.subarray(156, 190);
    const rootExtent = rootRecord.readUInt32LE(2);
    const rootSize = rootRecord.readUInt32LE(10);
    const rootData = readSectorsFromFd(fd, rootExtent, Math.ceil(rootSize / SECTOR_DATA_SIZE), fmt);
    const rootFiles = parseDirectory(rootData, rootSize);

    const { exeEntry, serial } = findExeViaFd(fd, rootFiles, fmt);

    return {
      slus: readIsoFileFromFd(fd, exeEntry, fmt),
      waMrg: findWaMrgViaFd(fd, rootFiles, fmt),
      serial,
    };
  } finally {
    fs.closeSync(fd);
  }
}

/**
 * Lightweight alternative to loadDiscData: reads only the PS1 executable,
 * not WA_MRG. Used for hash-based disambiguation across multiple candidate
 * .bin/.iso files — avoids paging in 500+ MB of disc image just to hash a
 * 2888-byte window of the EXE.
 *
 * Reads: PVD sector + root directory sectors + EXE sectors (via SYSTEM.CNF
 * fallback if the EXE isn't named after the disc serial). Typically totals
 * a few hundred KB of I/O vs. the full disc.
 */
export function readDiscExe(discPath: string): { slus: Buffer; serial: string } {
  const fd = fs.openSync(discPath, "r");
  try {
    // 64 KB covers PVD at sector 16 in both MODE2/2352 (offset 37,632) and
    // MODE1/2048 (offset 32,768) — enough to detect format from either layout.
    const head = Buffer.alloc(64 * 1024);
    fs.readSync(fd, head, 0, head.length, 0);
    const fmt = detectDiscFormat(head);

    const pvd = readSectorFromFd(fd, PVD_SECTOR, fmt);
    if (pvd.subarray(1, 6).toString("ascii") !== "CD001") {
      throw new Error("Not a valid ISO 9660 disc image");
    }

    const rootRecord = pvd.subarray(156, 190);
    const rootExtent = rootRecord.readUInt32LE(2);
    const rootSize = rootRecord.readUInt32LE(10);
    const rootData = readSectorsFromFd(fd, rootExtent, Math.ceil(rootSize / SECTOR_DATA_SIZE), fmt);
    const rootFiles = parseDirectory(rootData, rootSize);

    const { exeEntry, serial } = findExeViaFd(fd, rootFiles, fmt);
    const exeRaw = readSectorsFromFd(
      fd,
      exeEntry.sector,
      Math.ceil(exeEntry.size / SECTOR_DATA_SIZE),
      fmt,
    );
    return { slus: exeRaw.subarray(0, exeEntry.size), serial };
  } finally {
    fs.closeSync(fd);
  }
}

/**
 * Fd-aware variant of findExe: same resolution logic (standard-named serial
 * file, then SYSTEM.CNF BOOT fallback) but reads SYSTEM.CNF via positioned
 * reads instead of indexing into a full-disc buffer.
 */
function findExeViaFd(
  fd: number,
  rootFiles: IsoFile[],
  fmt: DiscFormat,
): { exeEntry: IsoFile; serial: string } {
  const standard = rootFiles.find((f) => SERIAL_RE.test(f.name));
  if (standard) return { exeEntry: standard, serial: standard.name.replace(/;.*$/, "") };

  const cnfEntry = rootFiles.find((f) => f.name === "SYSTEM.CNF");
  if (!cnfEntry) {
    throw new Error(
      `No PS1 executable found in disc image (files: ${rootFiles.map((f) => f.name).join(", ")})`,
    );
  }
  const cnfRaw = readSectorsFromFd(
    fd,
    cnfEntry.sector,
    Math.ceil(cnfEntry.size / SECTOR_DATA_SIZE),
    fmt,
  );
  const cnfData = cnfRaw.subarray(0, cnfEntry.size);
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

// ---------------------------------------------------------------------------
// EXE & WA_MRG resolution (supports non-standard disc layouts)
// ---------------------------------------------------------------------------

/** Standard PS1 serial filename regex (e.g. "SLUS_014.11"). */
const SERIAL_RE = /^S[CL][A-Z]{2}_\d/;

/** Extract the executable filename from a SYSTEM.CNF BOOT line. */
export function parseBootExeName(cnf: string): string | null {
  const match = cnf.match(/BOOT\s*=\s*cdrom:\\?(.+)/i);
  if (!match?.[1]) return null;
  return match[1].trim().replace(/;.*$/, "");
}

function findWaMrgViaFd(fd: number, rootFiles: IsoFile[], fmt: DiscFormat): Buffer {
  try {
    return findFileViaFd(fd, rootFiles, "DATA/WA_MRG.MRG", fmt);
  } catch {
    // Fallback: scan subdirectories for a WA_MRG-compatible file
  }

  for (const dir of rootFiles) {
    if (!dir.isDir) continue;
    const dirData = readSectorsFromFd(fd, dir.sector, Math.ceil(dir.size / SECTOR_DATA_SIZE), fmt);
    const files = parseDirectory(dirData, dir.size);
    for (const f of files) {
      if (f.isDir || f.size < 10_000_000) continue;
      try {
        const data = readIsoFileFromFd(fd, f, fmt);
        detectWaMrgLayout(data);
        return data;
      } catch {
        // not WA_MRG-compatible, try next file
      }
    }
  }

  throw new Error("WA_MRG.MRG not found in disc image");
}

function findFileViaFd(
  fd: number,
  rootFiles: IsoFile[],
  filePath: string,
  fmt: DiscFormat,
): Buffer {
  const parts = filePath.split("/");
  let files = rootFiles;

  for (let i = 0; i < parts.length; i++) {
    const target = parts[i] ?? "";
    const entry = files.find((f) => f.name === target);
    if (!entry) {
      throw new Error(`File not found in disc image: ${filePath} (missing "${target}")`);
    }

    if (i < parts.length - 1) {
      const dirData = readSectorsFromFd(
        fd,
        entry.sector,
        Math.ceil(entry.size / SECTOR_DATA_SIZE),
        fmt,
      );
      files = parseDirectory(dirData, entry.size);
    } else {
      return readIsoFileFromFd(fd, entry, fmt);
    }
  }

  throw new Error(`File not found: ${filePath}`);
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
  const exeLayout = detectDiscExeLayout(slus);
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
  const deckLimits = extractDeckLimits(slus);
  const cardAtk = new Map(cards.map((c) => [c.id, c.atk]));

  return {
    "cards.csv": cardsToCsv(cards),
    "fusions.csv": fusionsToCsv(fusions, cardAtk),
    "equips.csv": equipsToCsv(equips),
    "duelists.csv": duelistsToCsv(duelists),
    "deck-limits.csv": deckLimitsToCsv(deckLimits),
  };
}

/** Detect layout and return the artwork block size (needed by CLI for artwork extraction). */
export function detectArtworkBlockSize(waMrg: Buffer): number {
  return detectWaMrgLayout(waMrg).artworkBlockSize;
}

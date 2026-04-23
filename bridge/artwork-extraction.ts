/**
 * Background artwork (PNG) extraction, off the gameData critical path.
 *
 * `extractAllArtworkAsPng` does ~722 CPU-bound PNG encodes plus disk writes,
 * which previously ran inline inside `acquireGameData` — blocking the
 * gameData broadcast by 1-2 seconds the first time a mod was seen.
 *
 * This module kicks off the extraction as a background task and tracks it
 * in `inFlight`. The HTTP artwork route awaits the in-flight promise when a
 * request arrives for a file that hasn't been written yet, turning what
 * would be a 404 flash into a transparent wait.
 */

import { existsSync, promises as fsp } from "node:fs";
import { join } from "node:path";
import { encodePng } from "./extract/encode-png.ts";
import { extractFullCardImage, FULL_IMG_HEIGHT, FULL_IMG_WIDTH } from "./extract/extract-images.ts";
import { NUM_CARDS } from "./extract/types.ts";

const inFlight = new Map<string, Promise<void>>();

/**
 * Kick off artwork extraction in the background. No-op if already running or
 * if the PNGs are already on disk. Safe to call repeatedly.
 */
export function startArtworkExtraction(
  hashPrefix: string,
  artworkDir: string,
  waMrg: Buffer,
  blockSize: number,
): void {
  if (inFlight.has(hashPrefix)) return;
  if (existsSync(join(artworkDir, "001.png"))) return;
  const task = runExtraction(hashPrefix, artworkDir, waMrg, blockSize).finally(() => {
    inFlight.delete(hashPrefix);
  });
  // Swallow rejections here — the promise is already captured in `inFlight`
  // for awaiters; the task logs its own errors.
  task.catch(() => {});
  inFlight.set(hashPrefix, task);
}

/**
 * Return the in-flight extraction for this hash prefix, or null if none is
 * running. Route handlers use this to wait for a PNG that's still being
 * written instead of returning a 404 on first load.
 */
export function awaitArtworkExtraction(hashPrefix: string): Promise<void> | null {
  return inFlight.get(hashPrefix) ?? null;
}

// Write 50 PNGs per batch. Batching keeps disk write queue hot; awaiting the
// batch yields back to the event loop so the bridge poll loop and artwork
// HTTP requests aren't starved during extraction.
const BATCH_SIZE = 50;

async function runExtraction(
  hashPrefix: string,
  artworkDir: string,
  waMrg: Buffer,
  blockSize: number,
): Promise<void> {
  try {
    await fsp.mkdir(artworkDir, { recursive: true });
    for (let start = 0; start < NUM_CARDS; start += BATCH_SIZE) {
      const end = Math.min(start + BATCH_SIZE, NUM_CARDS);
      const writes: Promise<void>[] = [];
      for (let i = start; i < end; i++) {
        const rgba = extractFullCardImage(waMrg, blockSize, i);
        const png = encodePng(rgba, FULL_IMG_WIDTH, FULL_IMG_HEIGHT);
        const path = join(artworkDir, `${String(i + 1).padStart(3, "0")}.png`);
        writes.push(fsp.writeFile(path, png));
      }
      await Promise.all(writes);
    }
    console.log(`Extracted ${NUM_CARDS} artwork PNGs to ${artworkDir}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Artwork extraction failed for ${hashPrefix}: ${msg}`);
    throw err;
  }
}

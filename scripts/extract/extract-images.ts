// ---------------------------------------------------------------------------
// Card artwork extraction
// ---------------------------------------------------------------------------

import { mkdirSync, writeFileSync } from "node:fs";
import { encodePng } from "./encode-png.ts";
import { byte } from "./iso9660.ts";
import { NUM_CARDS } from "./types.ts";

/** Full card artwork in WA_MRG.MRG: 722 cards starting at offset 0x169000.
 *  Each card block is 0x3800 (US/RP) or 0x4000 (PAL) bytes:
 *    +0x0000: 102×96 8bpp pixel data (9792 bytes)
 *    +0x2640: 256-color RGB555 CLUT (512 bytes)
 *    +0x2840: card name image (4bpp, not extracted)
 *    +0x2AE0: 256-color thumbnail (not used, we have the 64-color ones)
 *  PAL blocks are 0x800 bytes larger (extra card name image data for
 *  multi-language support).
 *  Source: TCRF documentation. */
const FULL_IMG_START = 0x16_9000;
export const FULL_IMG_WIDTH = 102;
export const FULL_IMG_HEIGHT = 96;
const FULL_IMG_PIXELS = FULL_IMG_WIDTH * FULL_IMG_HEIGHT;
const FULL_IMG_CLUT_OFFSET = 0x2640;

function rgb555toRGBA(val: number, transparent: boolean): [number, number, number, number] {
  if (transparent) return [0, 0, 0, 0];
  const r = Math.round(((val & 0x1f) * 255) / 31);
  const g = Math.round((((val >> 5) & 0x1f) * 255) / 31);
  const b = Math.round((((val >> 10) & 0x1f) * 255) / 31);
  return [r, g, b, 255];
}

export function extractFullCardImage(waMrg: Buffer, blockSize: number, cardIndex: number): Buffer {
  const blockStart = FULL_IMG_START + cardIndex * blockSize;
  const rgba = Buffer.alloc(FULL_IMG_PIXELS * 4);

  for (let p = 0; p < FULL_IMG_PIXELS; p++) {
    const idx = byte(waMrg, blockStart + p);
    const colorVal = waMrg.readUInt16LE(blockStart + FULL_IMG_CLUT_OFFSET + idx * 2);
    const [r, g, b, a] = rgb555toRGBA(colorVal, false);
    rgba[p * 4] = r;
    rgba[p * 4 + 1] = g;
    rgba[p * 4 + 2] = b;
    rgba[p * 4 + 3] = a;
  }

  return rgba;
}

/** Extract all card artwork as PNG files (no native deps). */
export function extractAllArtworkAsPng(waMrg: Buffer, artBlockSize: number, artDir: string): void {
  mkdirSync(artDir, { recursive: true });
  for (let i = 0; i < NUM_CARDS; i++) {
    const rgba = extractFullCardImage(waMrg, artBlockSize, i);
    const png = encodePng(rgba, FULL_IMG_WIDTH, FULL_IMG_HEIGHT);
    writeFileSync(`${artDir}/${String(i + 1).padStart(3, "0")}.png`, png);
  }
}

/** Extract all card artwork as webp files to the given directory.
 *  Requires `sharp` — pass as parameter to keep the dependency isolated. */
export async function extractAllArtwork(
  waMrg: Buffer,
  artBlockSize: number,
  artDir: string,
  // biome-ignore lint/suspicious/noExplicitAny: sharp loaded lazily by caller
  sharp: any,
): Promise<void> {
  mkdirSync(artDir, { recursive: true });

  const promises: Promise<void>[] = [];
  for (let i = 0; i < NUM_CARDS; i++) {
    const rgba = extractFullCardImage(waMrg, artBlockSize, i);
    const filePath = `${artDir}/${String(i + 1).padStart(3, "0")}.webp`;
    promises.push(
      sharp(rgba, { raw: { width: FULL_IMG_WIDTH, height: FULL_IMG_HEIGHT, channels: 4 } })
        .webp({ quality: 50 })
        .toFile(filePath),
    );
  }
  await Promise.all(promises);
}

// Minimal PNG encoder — no native deps, just node:zlib.
// Produces valid 8-bit RGBA PNGs for card artwork.

import { deflateSync } from "node:zlib";

// ── CRC32 (PNG uses it for every chunk) ─────────────────────────────

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of buf) c = ((crcTable[(c ^ b) & 0xff] ?? 0) ^ (c >>> 8)) >>> 0;
  return (c ^ 0xffffffff) >>> 0;
}

// ── PNG chunk helpers ───────────────────────────────────────────────

function writeU32BE(buf: Buffer, offset: number, val: number): void {
  buf[offset] = (val >>> 24) & 0xff;
  buf[offset + 1] = (val >>> 16) & 0xff;
  buf[offset + 2] = (val >>> 8) & 0xff;
  buf[offset + 3] = val & 0xff;
}

function makeChunk(type: string, data: Uint8Array): Buffer {
  const chunk = Buffer.alloc(12 + data.length);
  writeU32BE(chunk, 0, data.length);
  chunk.write(type, 4, 4, "ascii");
  chunk.set(data, 8);
  const crcInput = chunk.subarray(4, 8 + data.length);
  writeU32BE(chunk, 8 + data.length, crc32(crcInput));
  return chunk;
}

// ── Public API ──────────────────────────────────────────────────────

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

/** Encode raw RGBA pixels as a PNG file buffer (8-bit RGBA, no filtering). */
export function encodePng(rgba: Uint8Array, width: number, height: number): Buffer {
  // IHDR: width(4) + height(4) + bitDepth(1) + colorType(1) + compression(1) + filter(1) + interlace(1)
  const ihdr = Buffer.alloc(13);
  writeU32BE(ihdr, 0, width);
  writeU32BE(ihdr, 4, height);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  // compression, filter, interlace all 0

  // Raw scanlines: each row gets a 0x00 filter byte prefix
  const rowBytes = width * 4;
  const raw = Buffer.alloc(height * (1 + rowBytes));
  for (let y = 0; y < height; y++) {
    const outOff = y * (1 + rowBytes);
    raw[outOff] = 0; // filter: none
    raw.set(rgba.subarray(y * rowBytes, (y + 1) * rowBytes), outOff + 1);
  }

  const compressed = deflateSync(raw);
  return Buffer.concat([
    PNG_SIGNATURE,
    makeChunk("IHDR", ihdr),
    makeChunk("IDAT", compressed),
    makeChunk("IEND", Buffer.alloc(0)),
  ]);
}

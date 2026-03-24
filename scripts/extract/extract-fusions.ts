// ---------------------------------------------------------------------------
// Fusion table parsing
// ---------------------------------------------------------------------------

import { byte } from "./iso9660.ts";
import type { Fusion, WaMrgLayout } from "./types.ts";
import { NUM_CARDS } from "./types.ts";

const FUSION_TABLE_SIZE = 0x1_0000;

export function extractFusions(waMrg: Buffer, waMrgLayout: WaMrgLayout): Fusion[] {
  const data = waMrg.subarray(waMrgLayout.fusionTable, waMrgLayout.fusionTable + FUSION_TABLE_SIZE);
  const fusions: Fusion[] = [];
  // The game normalizes every fusion pair so the lower card ID is material1
  // (ROM 0x19a60).  Entries where material1 > material2 are unreachable and
  // are skipped.  The binary may also contain duplicate (material1, material2)
  // pairs from overlapping range-based fusion rules; the game uses
  // first-match-wins, so we keep only the first occurrence for each pair.
  const seen = new Set<string>();

  for (let cardI = 0; cardI < NUM_CARDS; cardI++) {
    let offset = data.readUInt16LE(2 + cardI * 2);
    if (offset === 0) continue;

    const countByte = byte(data, offset);
    let count: number;
    if (countByte !== 0) {
      count = countByte;
    } else {
      count = 511 - byte(data, offset + 1);
      offset += 1;
    }

    let pos = offset + 1;
    let read = 0;

    while (read < count) {
      if (pos + 4 >= data.length) break; // bounds safety
      const ctrl = byte(data, pos);
      const b1 = byte(data, pos + 1);
      const b2 = byte(data, pos + 2);
      const b3 = byte(data, pos + 3);
      const b4 = byte(data, pos + 4);

      const mat1 = cardI + 1;

      const mat2a = ((ctrl & 0x03) << 8) | b1;
      const resa = (((ctrl >> 2) & 0x03) << 8) | b2;
      if (mat1 <= mat2a) {
        const keyA = `${mat1},${mat2a}`;
        if (!seen.has(keyA)) {
          seen.add(keyA);
          fusions.push({ material1: mat1, material2: mat2a, result: resa });
        }
      }
      read++;

      if (read < count) {
        const mat2b = (((ctrl >> 4) & 0x03) << 8) | b3;
        const resb = (((ctrl >> 6) & 0x03) << 8) | b4;
        if (mat1 <= mat2b) {
          const keyB = `${mat1},${mat2b}`;
          if (!seen.has(keyB)) {
            seen.add(keyB);
            fusions.push({ material1: mat1, material2: mat2b, result: resb });
          }
        }
        read++;
      }

      pos += 5;
    }
  }

  return fusions;
}

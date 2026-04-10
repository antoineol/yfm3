// ---------------------------------------------------------------------------
// Equip table parsing
// ---------------------------------------------------------------------------

import type { EquipEntry, WaMrgLayout } from "./types.ts";

const EQUIP_TABLE_SIZE = 0x2800;

export function extractEquips(waMrg: Buffer, waMrgLayout: WaMrgLayout): EquipEntry[] {
  const data = waMrg.subarray(waMrgLayout.equipTable, waMrgLayout.equipTable + EQUIP_TABLE_SIZE);
  const equips: EquipEntry[] = [];
  let pos = 0;

  while (pos < data.length - 1) {
    const equipId = data.readUInt16LE(pos);
    pos += 2;
    if (equipId === 0) break;

    const monsterCount = data.readUInt16LE(pos);
    pos += 2;

    const monsterIds: number[] = [];
    for (let j = 0; j < monsterCount; j++) {
      monsterIds.push(data.readUInt16LE(pos));
      pos += 2;
    }
    equips.push({ equipId, monsterIds });
  }

  return equips;
}

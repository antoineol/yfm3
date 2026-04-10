import { describe, expect, it } from "vitest";
import { extractEquips } from "./extract-equips.ts";
import type { WaMrgLayout } from "./types.ts";

const EQUIP_TABLE_OFFSET = 0x100;

const layout: WaMrgLayout = {
  fusionTable: 0,
  equipTable: EQUIP_TABLE_OFFSET,
  starchipTable: 0,
  duelistTable: 0,
  artworkBlockSize: 0x3800,
};

function makeWaMrgWithEquips(entries: { equipId: number; monsterIds: number[] }[]): Buffer {
  const parts: number[] = [];
  for (const e of entries) {
    parts.push(e.equipId & 0xff, (e.equipId >> 8) & 0xff);
    parts.push(e.monsterIds.length & 0xff, (e.monsterIds.length >> 8) & 0xff);
    for (const m of e.monsterIds) {
      parts.push(m & 0xff, (m >> 8) & 0xff);
    }
  }
  // Terminator: equipId=0
  parts.push(0, 0);

  const buf = Buffer.alloc(EQUIP_TABLE_OFFSET + 0x2800);
  Buffer.from(parts).copy(buf, EQUIP_TABLE_OFFSET);
  return buf;
}

describe("extractEquips", () => {
  it("parses equip entries with multiple monsters", () => {
    const waMrg = makeWaMrgWithEquips([
      { equipId: 100, monsterIds: [1, 2, 3] },
      { equipId: 200, monsterIds: [10, 20] },
    ]);
    const equips = extractEquips(waMrg, layout);
    expect(equips).toHaveLength(2);
    expect(equips[0]).toEqual({ equipId: 100, monsterIds: [1, 2, 3] });
    expect(equips[1]).toEqual({ equipId: 200, monsterIds: [10, 20] });
  });

  it("handles single-monster equip entry", () => {
    const waMrg = makeWaMrgWithEquips([{ equipId: 50, monsterIds: [7] }]);
    const equips = extractEquips(waMrg, layout);
    expect(equips).toHaveLength(1);
    expect(equips[0]).toEqual({ equipId: 50, monsterIds: [7] });
  });

  it("returns empty array when first entry is terminator", () => {
    const waMrg = makeWaMrgWithEquips([]);
    const equips = extractEquips(waMrg, layout);
    expect(equips).toHaveLength(0);
  });

  it("handles equip IDs > 255 (uint16)", () => {
    const waMrg = makeWaMrgWithEquips([{ equipId: 500, monsterIds: [300, 400] }]);
    const equips = extractEquips(waMrg, layout);
    expect(equips[0]?.equipId).toBe(500);
    expect(equips[0]?.monsterIds).toEqual([300, 400]);
  });
});

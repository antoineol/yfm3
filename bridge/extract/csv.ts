// ---------------------------------------------------------------------------
// CSV serialization for all table types
// ---------------------------------------------------------------------------

import type { DeckLimits } from "./extract-deck-limits.ts";
import type { CardStats, DuelistData, EquipEntry, Fusion } from "./types.ts";
import { NUM_CARDS } from "./types.ts";

export function cardsToCsv(cards: CardStats[]): string {
  const header =
    "id,name,atk,def,guardian_star_1,guardian_star_2,type,color,level,attribute,starchip_cost,password,description";
  const rows = cards.map(
    (c) =>
      `${c.id},"${c.name.replace(/"/g, '""')}",${c.atk},${c.def},${c.gs1},${c.gs2},${c.type},${c.color},${c.level},${c.attribute},${c.starchipCost},${c.password},"${c.description.replace(/"/g, '""').replace(/\n/g, "\\n")}"`,
  );
  return `${header}\n${rows.join("\n")}\n`;
}

export function fusionsToCsv(fusions: Fusion[], cardAtk: Map<number, number>): string {
  const header = "material1_id,material2_id,result_id,result_atk";
  const rows = fusions.map(
    (f) => `${f.material1},${f.material2},${f.result},${cardAtk.get(f.result) ?? 0}`,
  );
  return `${header}\n${rows.join("\n")}\n`;
}

export function equipsToCsv(equips: EquipEntry[]): string {
  const header = "equip_id,monster_id";
  const rows: string[] = [];
  for (const eq of equips) {
    for (const mid of eq.monsterIds) {
      rows.push(`${eq.equipId},${mid}`);
    }
  }
  return `${header}\n${rows.join("\n")}\n`;
}

export function deckLimitsToCsv(limits: DeckLimits | null): string {
  const header = "card_id,max_copies";
  if (!limits) return `${header}\n`;
  const rows = Object.entries(limits.byCard)
    .map(([k, v]) => ({ id: Number(k), max: v }))
    .sort((a, b) => a.id - b.id)
    .map(({ id, max }) => `${id},${max}`);
  return `${header}\n${rows.join("\n")}\n`;
}

export function duelistsToCsv(duelists: DuelistData[]): string {
  const header = "duelist_id,duelist_name,card_id,deck,sa_pow,bcd,sa_tec";
  const rows: string[] = [];
  for (const d of duelists) {
    for (let c = 0; c < NUM_CARDS; c++) {
      const deck = d.deck[c] ?? 0;
      const saPow = d.saPow[c] ?? 0;
      const bcd = d.bcd[c] ?? 0;
      const saTec = d.saTec[c] ?? 0;
      if (deck > 0 || saPow > 0 || bcd > 0 || saTec > 0) {
        rows.push(`${d.id},"${d.name}",${c + 1},${deck},${saPow},${bcd},${saTec}`);
      }
    }
  }
  return `${header}\n${rows.join("\n")}\n`;
}

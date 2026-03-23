/**
 * Build vanilla Yu-Gi-Oh! Forbidden Memories reference CSVs from community
 * JSON databases (YGOFM-gamedata by sg4e, YGO-FM-FusionCalc by Solumin).
 *
 * Downloads data from GitHub, converts to the same CSV format produced by
 * extract-game-data.ts, and writes to tests/data/vanilla/.
 *
 * Usage:
 *   bun run scripts/build-vanilla-reference.ts
 */

import fs from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

const YGOFM_BASE = "https://raw.githubusercontent.com/sg4e/YGOFM-gamedata/master/sqlite/json";
const SOLUMIN_CARDS =
  "https://raw.githubusercontent.com/Solumin/YGO-FM-FusionCalc/master/data/Cards.json";

const OUT_DIR = path.resolve(import.meta.dirname ?? ".", "../tests/data/vanilla");

// ---------------------------------------------------------------------------
// Types matching JSON schemas
// ---------------------------------------------------------------------------

interface YgofmCard {
  cardId: number;
  cardName: string;
  description: string;
  guardianStar1: string | null;
  guardianStar2: string | null;
  level: number;
  type: string;
  attack: number;
  defense: number;
  attribute: string | null;
  password: string;
  starchipCost: number;
}

interface YgofmFusion {
  material1: number;
  material2: number;
  result: number;
}

interface YgofmEquip {
  equipId: number;
  cardId: number;
}

interface YgofmDropPool {
  duelist: number;
  poolType: "Deck" | "SAPow" | "BCD" | "SATec";
  cardId: number;
  cardProbability: number;
}

interface YgofmDuelist {
  duelistId: number;
  duelist: string;
}

interface SoluminCard {
  Id: number;
  Name: string;
  Description: string;
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

async function fetchJson<T>(url: string): Promise<T> {
  console.log(`  Fetching ${url.split("/").pop()}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// CSV builders (mirror extract-game-data.ts format exactly)
// ---------------------------------------------------------------------------

function buildCardsCsv(ygofmCards: YgofmCard[], soluminCards: SoluminCard[]): string {
  const header =
    "id,name,atk,def,guardian_star_1,guardian_star_2,type,color,level,attribute,starchip_cost,password,description";

  // Index Solumin cards by ID for descriptions
  const soluminById = new Map(soluminCards.map((c) => [c.Id, c]));

  const rows = ygofmCards.map((c) => {
    const gs1 = c.guardianStar1 ?? "None";
    const gs2 = c.guardianStar2 ?? "None";
    const attr = c.attribute ?? "";
    const color = ""; // Vanilla has no colored card names
    const level = c.level ?? 0;
    const starchipCost = c.starchipCost ?? 0;

    // Password: strip leading zeros; null/"0" means no password → ""
    let password: string;
    if (!c.password || c.password === "0" || c.password === "00000000") {
      password = "";
    } else {
      password = c.password.replace(/^0+/, "") || "0";
    }

    // Use Solumin description (has \r\n) → convert to \n to match TBL decoder
    const sol = soluminById.get(c.cardId);
    const rawDesc = sol ? sol.Description : c.description;
    const desc = rawDesc.replace(/\r\n/g, "\n").replace(/\n\n/g, "\n");

    const escapedName = c.cardName.replace(/"/g, '""');
    const escapedDesc = desc.replace(/"/g, '""').replace(/\n/g, "\\n");

    return `${c.cardId},"${escapedName}",${c.attack},${c.defense},${gs1},${gs2},${c.type},${color},${level},${attr},${starchipCost},${password},"${escapedDesc}"`;
  });

  return `${header}\n${rows.join("\n")}\n`;
}

function buildFusionsCsv(fusions: YgofmFusion[], cardAtk: Map<number, number>): string {
  const header = "material1_id,material2_id,result_id,result_atk";

  // Normalize: ensure material1 <= material2, deduplicate first-match-wins
  const seen = new Set<string>();
  const rows: string[] = [];

  for (const f of fusions) {
    const mat1 = Math.min(f.material1, f.material2);
    const mat2 = Math.max(f.material1, f.material2);
    const key = `${mat1},${mat2}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const atk = cardAtk.get(f.result) ?? 0;
    rows.push(`${mat1},${mat2},${f.result},${atk}`);
  }

  return `${header}\n${rows.join("\n")}\n`;
}

function buildEquipsCsv(equips: YgofmEquip[]): string {
  const header = "equip_id,monster_id";
  const rows = equips.map((e) => `${e.equipId},${e.cardId}`);
  return `${header}\n${rows.join("\n")}\n`;
}

function buildDuelistsCsv(duelists: YgofmDuelist[], dropPool: YgofmDropPool[]): string {
  const header = "duelist_id,duelist_name,card_id,deck,sa_pow,bcd,sa_tec";
  const nameById = new Map(duelists.map((d) => [d.duelistId, d.duelist]));

  // Pivot: (duelist, cardId) → { deck, saPow, bcd, saTec }
  const pivot = new Map<string, { deck: number; saPow: number; bcd: number; saTec: number }>();

  for (const dp of dropPool) {
    const key = `${dp.duelist},${dp.cardId}`;
    let entry = pivot.get(key);
    if (!entry) {
      entry = { deck: 0, saPow: 0, bcd: 0, saTec: 0 };
      pivot.set(key, entry);
    }
    switch (dp.poolType) {
      case "Deck":
        entry.deck = dp.cardProbability;
        break;
      case "SAPow":
        entry.saPow = dp.cardProbability;
        break;
      case "BCD":
        entry.bcd = dp.cardProbability;
        break;
      case "SATec":
        entry.saTec = dp.cardProbability;
        break;
    }
  }

  // Sort by duelist ID then card ID, matching extraction order
  const rows: string[] = [];
  const duelistIds = [...new Set(dropPool.map((d) => d.duelist))].sort((a, b) => a - b);

  for (const dId of duelistIds) {
    const name = nameById.get(dId) ?? `Duelist ${dId}`;
    // Collect all card IDs for this duelist, sorted
    const cardIds = new Set<number>();
    for (const dp of dropPool) {
      if (dp.duelist === dId) cardIds.add(dp.cardId);
    }
    for (const cId of [...cardIds].sort((a, b) => a - b)) {
      const e = pivot.get(`${dId},${cId}`);
      if (!e) continue;
      rows.push(`${dId},"${name}",${cId},${e.deck},${e.saPow},${e.bcd},${e.saTec}`);
    }
  }

  return `${header}\n${rows.join("\n")}\n`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Downloading community data...");

  const [ygofmCards, ygofmFusions, ygofmEquips, ygofmDropPool, ygofmDuelists, soluminCards] =
    await Promise.all([
      fetchJson<YgofmCard[]>(`${YGOFM_BASE}/cardinfo.json`),
      fetchJson<YgofmFusion[]>(`${YGOFM_BASE}/fusions.json`),
      fetchJson<YgofmEquip[]>(`${YGOFM_BASE}/equipinfo.json`),
      fetchJson<YgofmDropPool[]>(`${YGOFM_BASE}/droppool.json`),
      fetchJson<YgofmDuelist[]>(`${YGOFM_BASE}/duelistinfo.json`),
      fetchJson<SoluminCard[]>(SOLUMIN_CARDS),
    ]);

  console.log(
    `\nLoaded: ${ygofmCards.length} cards, ${ygofmFusions.length} fusions, ` +
      `${ygofmEquips.length} equips, ${ygofmDropPool.length} drops, ` +
      `${ygofmDuelists.length} duelists`,
  );

  // Sort cards by ID
  ygofmCards.sort((a, b) => a.cardId - b.cardId);

  // Build ATK lookup for fusions
  const cardAtk = new Map(ygofmCards.map((c) => [c.cardId, c.attack]));

  // Generate CSVs
  const csvs: Record<string, string> = {
    "cards.csv": buildCardsCsv(ygofmCards, soluminCards),
    "fusions.csv": buildFusionsCsv(ygofmFusions, cardAtk),
    "equips.csv": buildEquipsCsv(ygofmEquips),
    "duelists.csv": buildDuelistsCsv(ygofmDuelists, ygofmDropPool),
  };

  // Write output
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [name, content] of Object.entries(csvs)) {
    const outPath = path.join(OUT_DIR, name);
    fs.writeFileSync(outPath, content);
    const lineCount = content.trimEnd().split("\n").length - 1;
    console.log(`  Wrote ${outPath} (${lineCount} rows)`);
  }

  console.log("\nDone. Reference data written to tests/data/vanilla/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

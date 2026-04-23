import { DEFAULT_MOD, type ModId } from "../../engine/mods.ts";
import type {
  RefCard,
  RefDuelistCard,
  RefEquip,
  RefFusion,
} from "../../engine/reference/build-reference-table.ts";
import type { BridgeGameData } from "../../engine/worker/messages.ts";

/**
 * Fetch and parse the reference CSVs from /data/{modId}/ (static assets in /public).
 * Cards CSV now includes names and colors directly.
 */
export async function loadReferenceCsvs(modId: ModId = DEFAULT_MOD): Promise<{
  cards: RefCard[];
  fusions: RefFusion[];
  duelists: RefDuelistCard[];
  equips: RefEquip[];
  deckLimits?: Record<number, number>;
}> {
  const [cardsCsv, fusionsCsv, duelistsCsv, equipsCsv, deckLimitsCsv] = await Promise.all([
    fetch(`/data/${modId}/cards.csv`).then((r) => r.text()),
    fetch(`/data/${modId}/fusions.csv`).then((r) => r.text()),
    fetch(`/data/${modId}/duelists.csv`).then((r) => r.text()),
    fetch(`/data/${modId}/equips.csv`).then((r) => r.text()),
    fetch(`/data/${modId}/deck-limits.csv`).then((r) => (r.ok ? r.text() : "")),
  ]);

  const cards = parseCardsCsv(cardsCsv);
  const fusions = parseFusionsCsv(fusionsCsv);
  const duelists = parseDuelistsCsv(duelistsCsv);
  const equips = parseEquipsCsv(equipsCsv);
  const deckLimits = parseDeckLimitsCsv(deckLimitsCsv);
  return { cards, fusions, duelists, equips, deckLimits };
}

/** @internal exported for testing */
export function parseDeckLimitsCsv(csv: string): Record<number, number> | undefined {
  if (!csv) return undefined;
  const out: Record<number, number> = {};
  for (const [idStr = "", maxStr = ""] of parseCsvRows(csv)) {
    const id = parseInt(idStr, 10);
    const max = parseInt(maxStr, 10);
    if (Number.isFinite(id) && Number.isFinite(max)) out[id] = max;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function parseCsvRows(csv: string): string[][] {
  return csv
    .split("\n")
    .slice(1)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map(splitCsvLine);
}

/** Split a CSV line respecting quoted fields (handles commas inside quotes). */
function splitCsvLine(line: string): string[] {
  const cols: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      const end = line.indexOf('"', i + 1);
      cols.push(line.slice(i + 1, end === -1 ? line.length : end));
      i = end === -1 ? line.length : end + 2; // skip closing quote + comma
    } else {
      const next = line.indexOf(",", i);
      cols.push(next === -1 ? line.slice(i) : line.slice(i, next));
      i = next === -1 ? line.length : next + 1;
    }
  }
  return cols;
}

/** @internal exported for testing */
export function parseCardsCsv(csv: string): RefCard[] {
  const cards: RefCard[] = [];
  for (const cols of parseCsvRows(csv)) {
    const id = parseInt(cols[0] ?? "", 10);
    const name = cols[1] ?? "";
    const atk = parseInt(cols[2] ?? "", 10);
    const def = parseInt(cols[3] ?? "", 10);
    const gs1 = cols[4] ?? "";
    const gs2 = cols[5] ?? "";
    const type = cols[6] ?? "";
    const color = cols[7] ?? "";
    const level = parseInt(cols[8] ?? "", 10);
    const attribute = cols[9] ?? "";
    const starchipCost = parseInt(cols[10] ?? "", 10);
    const password = parseInt(cols[11] ?? "", 10);
    const description = cols[12] ?? "";
    if (!Number.isFinite(id) || !Number.isFinite(atk) || !Number.isFinite(def)) continue;
    cards.push({
      id,
      atk,
      def,
      type,
      guardianStar1: gs1,
      guardianStar2: gs2,
      name: name || `Card #${id}`,
      color: color || undefined,
      level: Number.isFinite(level) ? level : undefined,
      attribute: attribute || undefined,
      starchipCost: Number.isFinite(starchipCost) ? starchipCost : undefined,
      password: Number.isFinite(password) ? password : undefined,
      description: description
        ? description.replaceAll("-\\n", "-").replaceAll("\\n", " ").replace(/ {2,}/g, " ").trim()
        : undefined,
    });
  }
  return cards;
}

function parseFusionsCsv(csv: string): RefFusion[] {
  const fusions: RefFusion[] = [];
  for (const [m1s = "", m2s = "", rs = "", atkS = ""] of parseCsvRows(csv)) {
    const material1Id = parseInt(m1s, 10);
    const material2Id = parseInt(m2s, 10);
    const resultId = parseInt(rs, 10);
    const resultAtk = parseInt(atkS, 10);
    if (
      !Number.isFinite(material1Id) ||
      !Number.isFinite(material2Id) ||
      !Number.isFinite(resultId)
    )
      continue;
    fusions.push({ material1Id, material2Id, resultId, resultAtk });
  }
  return fusions;
}

function parseDuelistsCsv(csv: string): RefDuelistCard[] {
  const rows: RefDuelistCard[] = [];
  for (const cols of parseCsvRows(csv)) {
    const duelistId = parseInt(cols[0] ?? "", 10);
    const duelistName = cols[1] ?? "";
    const cardId = parseInt(cols[2] ?? "", 10);
    const deck = parseInt(cols[3] ?? "", 10);
    const saPow = parseInt(cols[4] ?? "", 10);
    const bcd = parseInt(cols[5] ?? "", 10);
    const saTec = parseInt(cols[6] ?? "", 10);
    if (!Number.isFinite(duelistId) || !Number.isFinite(cardId)) continue;
    rows.push({
      duelistId,
      duelistName: duelistName || `Duelist #${duelistId}`,
      cardId,
      deck: deck || 0,
      saPow: saPow || 0,
      bcd: bcd || 0,
      saTec: saTec || 0,
    });
  }
  return rows;
}

function parseEquipsCsv(csv: string): RefEquip[] {
  const equips: RefEquip[] = [];
  for (const [eqs = "", ms = ""] of parseCsvRows(csv)) {
    const equipId = parseInt(eqs, 10);
    const monsterId = parseInt(ms, 10);
    if (!Number.isFinite(equipId) || !Number.isFinite(monsterId)) continue;
    equips.push({ equipId, monsterId });
  }
  return equips;
}

/**
 * Convert bridge game data to the reference table format.
 * All data (cards, fusions, equips, duelists) comes from the bridge's disc extraction.
 */
export function bridgeGameDataToReference(gameData: BridgeGameData): {
  cards: RefCard[];
  fusions: RefFusion[];
  duelists: RefDuelistCard[];
  equips: RefEquip[];
  deckLimits?: Record<number, number>;
} {
  const cards: RefCard[] = gameData.cards.map((c) => ({
    id: c.id,
    name: c.name || `Card #${c.id}`,
    atk: c.atk,
    def: c.def,
    type: c.type,
    guardianStar1: c.gs1,
    guardianStar2: c.gs2,
    color: c.color || undefined,
    level: c.level,
    attribute: c.attribute || undefined,
    starchipCost: c.starchipCost,
    password: c.password ? parseInt(c.password, 10) : undefined,
    description: c.description
      ? c.description.replaceAll("-\n", "-").replaceAll("\n", " ").replace(/ {2,}/g, " ").trim()
      : undefined,
  }));

  const cardAtk = new Map(cards.map((c) => [c.id, c.atk]));
  const fusions: RefFusion[] = gameData.fusionTable.map((f) => ({
    material1Id: f.material1,
    material2Id: f.material2,
    resultId: f.result,
    resultAtk: cardAtk.get(f.result) ?? 0,
  }));

  const equips: RefEquip[] = [];
  for (const e of gameData.equipTable) {
    for (const monsterId of e.monsterIds) {
      equips.push({ equipId: e.equipId, monsterId });
    }
  }

  const duelists: RefDuelistCard[] = [];
  for (const d of gameData.duelists) {
    for (let cardIdx = 0; cardIdx < d.deck.length; cardIdx++) {
      const cardId = cardIdx + 1;
      duelists.push({
        duelistId: d.id,
        duelistName: d.name,
        cardId,
        deck: d.deck[cardIdx] ?? 0,
        saPow: d.saPow[cardIdx] ?? 0,
        bcd: d.bcd[cardIdx] ?? 0,
        saTec: d.saTec[cardIdx] ?? 0,
      });
    }
  }

  return { cards, fusions, duelists, equips, deckLimits: gameData.deckLimits?.byCard };
}

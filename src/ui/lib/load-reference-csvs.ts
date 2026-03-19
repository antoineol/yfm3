import type { RefCard, RefFusion } from "../../engine/reference/build-reference-table.ts";

/**
 * Fetch and parse the reference CSVs from /data/ (static assets in /public).
 * Cards CSV now includes names and colors directly.
 */
export async function loadReferenceCsvs(): Promise<{
  cards: RefCard[];
  fusions: RefFusion[];
}> {
  const [cardsCsv, fusionsCsv] = await Promise.all([
    fetch("/data/cards.csv").then((r) => r.text()),
    fetch("/data/fusions.csv").then((r) => r.text()),
  ]);

  const cards = parseCardsCsv(cardsCsv);
  const fusions = parseFusionsCsv(fusionsCsv);
  return { cards, fusions };
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

function parseCardsCsv(csv: string): RefCard[] {
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
      description: description ? description.replaceAll("\\n", "\n").trim() : undefined,
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

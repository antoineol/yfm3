import type { RefCard, RefFusion } from "../../engine/reference/build-reference-table.ts";

/**
 * Fetch and parse the three reference CSVs from /data/ (static assets in /public).
 * Merges card-names.csv into cards so each RefCard has a display name.
 */
export async function loadReferenceCsvs(): Promise<{
  cards: RefCard[];
  fusions: RefFusion[];
}> {
  const [cardsCsv, fusionsCsv, namesCsv] = await Promise.all([
    fetch("/data/cards.csv").then((r) => r.text()),
    fetch("/data/fusions.csv").then((r) => r.text()),
    fetch("/data/card-names.csv").then((r) => r.text()),
  ]);

  const nameMap = parseNamesCsv(namesCsv);
  const cards = parseCardsCsv(cardsCsv, nameMap);
  const fusions = parseFusionsCsv(fusionsCsv);
  return { cards, fusions };
}

function parseCsvRows(csv: string): string[][] {
  return csv
    .split("\n")
    .slice(1)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => l.split(","));
}

function parseNamesCsv(csv: string): Map<number, string> {
  const map = new Map<number, string>();
  for (const [idS = "", name = ""] of parseCsvRows(csv)) {
    const id = parseInt(idS, 10);
    if (Number.isFinite(id) && name) map.set(id, name);
  }
  return map;
}

function parseCardsCsv(csv: string, nameMap: Map<number, string>): RefCard[] {
  const cards: RefCard[] = [];
  for (const [idS = "", atkS = "", defS = "", gs1 = "", gs2 = "", type = ""] of parseCsvRows(csv)) {
    const id = parseInt(idS, 10);
    const atk = parseInt(atkS, 10);
    const def = parseInt(defS, 10);
    if (!Number.isFinite(id) || !Number.isFinite(atk) || !Number.isFinite(def)) continue;
    cards.push({
      id,
      atk,
      def,
      type,
      guardianStar1: gs1,
      guardianStar2: gs2,
      name: nameMap.get(id) ?? `Card #${id}`,
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

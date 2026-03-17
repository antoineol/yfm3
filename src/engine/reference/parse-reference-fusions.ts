import type { FusionMaterials } from "../data/card-model.ts";
import { getMaterialPairKey } from "../data/fusion-utils.ts";

export interface ReferenceFusionRow {
  materialA: string;
  materialB: string;
  resultName: string;
  resultAttack: number;
  resultDefense: number;
}

export function parseReferenceFusions(rows: ReferenceFusionRow[]): FusionMaterials[] {
  const fusionByName = new Map<string, FusionMaterials>();

  for (const row of rows) {
    const materialA = normalizeName(row.materialA);
    const materialB = normalizeName(row.materialB);
    const resultName = normalizeName(row.resultName);

    if (!materialA || !materialB || !resultName) {
      throw new Error("Fusion rows must include materialA, materialB, and resultName");
    }

    const key = getMaterialPairKey({ name: materialA }, { name: materialB });
    const existing = fusionByName.get(resultName);
    if (existing) {
      existing.materials.add(key);
      continue;
    }

    fusionByName.set(resultName, {
      name: resultName,
      materials: new Set([key]),
      attack: row.resultAttack,
      defense: row.resultDefense,
    });
  }

  return [...fusionByName.values()];
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

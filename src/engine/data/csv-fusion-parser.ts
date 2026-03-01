import type { FusionMaterials } from "./card-model.ts";
import { parseFusionMaterial } from "./fusion-material-parser.ts";
import { parseFusionResult } from "./fusion-result-parser.ts";

export interface FusionParsingInput {
  material1: string;
  material2: string;
  fusionName: string;
  fusionAttack: string;
  fusionDefense: string;
}

/**
 * Parse a raw CSV line to extract fusion result
 */
export function parseCsvFusion(input: FusionParsingInput): FusionMaterials[] | null {
  const { material1, material2, fusionName, fusionAttack, fusionDefense } = input;
  if (!material1 || !material2 || !fusionName || !fusionAttack || !fusionDefense) {
    throw new Error("Not enough data for a valid fusion");
  }

  try {
    const leftMaterials = parseFusionMaterial(material1);
    const rightMaterials = parseFusionMaterial(material2);

    const fusionResults: FusionMaterials[] = [];

    for (const leftMaterial of leftMaterials) {
      for (const rightMaterial of rightMaterials) {
        const fusionResult = parseFusionResult(
          fusionName,
          leftMaterial,
          rightMaterial,
          fusionAttack,
          fusionDefense,
        );
        if (fusionResult) {
          fusionResults.push(fusionResult);
        }
      }
    }

    return fusionResults.length > 0 ? fusionResults : null;
  } catch (error) {
    console.warn("Error parsing CSV fusion", JSON.stringify(input));
    throw error;
  }
}

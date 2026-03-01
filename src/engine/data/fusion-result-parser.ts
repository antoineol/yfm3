import { parseCardCell } from "./card-cell-parser.ts";
import type { FusionMaterial, FusionMaterials } from "./card-model.ts";
import { getMaterialPairKey, isKindIdentifier } from "./fusion-utils.ts";

/**
 * Parse a fusion result with required attack and defense
 */
export function parseFusionResult(
  resultCell: string,
  leftMaterial: FusionMaterial,
  rightMaterial: FusionMaterial,
  attackCell: string,
  defenseCell: string,
) {
  if (!resultCell || !leftMaterial || !rightMaterial || !attackCell || !defenseCell) {
    throw new Error("Not enough data for a valid fusion result");
  }

  const cards = parseCardCell(resultCell);
  if (cards.length !== 1) {
    throw new Error(`Need exactly one card in result cell: ${resultCell}`);
  }
  const resultCard = cards[0];
  if (!resultCard) {
    throw new Error(`Empty result cell: ${resultCell}`);
  }
  if (isKindIdentifier(resultCard)) {
    throw new Error(`Result cell should not be a kind: ${resultCell}`);
  }

  const materialPairKey = getMaterialPairKey(leftMaterial, rightMaterial);

  const fusionMaterials: FusionMaterials = {
    name: resultCard.name,
    attack: parseInt(attackCell, 10),
    defense: parseInt(defenseCell, 10),
    materials: new Set([materialPairKey]),
  };

  return fusionMaterials;
}

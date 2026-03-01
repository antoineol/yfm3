import { parseCardCell } from "./card-cell-parser.ts";
import type { FusionMaterial } from "./card-model.ts";
import { isKindIdentifier } from "./fusion-utils.ts";

/**
 * Parse fusion materials from a CSV cell
 */
export function parseFusionMaterial(materialCell: string): FusionMaterial[] {
  if (!materialCell || materialCell.trim() === "") {
    throw new Error(`Empty material cell: ${materialCell}`);
  }

  const materials = parseCardCell(materialCell);
  if (materials.length === 0) {
    throw new Error(`Material cell should have at least one material: ${materialCell}`);
  }

  return materials.filter((material) =>
    (isKindIdentifier(material) ? material.kind : material.name).trim(),
  );
}

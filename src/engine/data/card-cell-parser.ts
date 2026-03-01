import type { CardRefByName, Color, FusionMaterial, KindIdentifier } from "./card-model.ts";
import { isValidCardKind } from "./parser-utils.ts";
import { colors, excludedKinds } from "./rp-types.ts";

/**
 * Parse a cell value to extract card information
 */
export function parseCardCell(cellValue: string): FusionMaterial[] {
  if (!cellValue || cellValue.trim() === "") {
    return [];
  }

  // Split by '/' to handle multiple cards in one cell
  const cardParts = cellValue.split("/").map((part) => part.trim());

  return cardParts.map((part) => {
    const colorRegex = /\[(.*?)\]\s+(.*)/;
    const colorMatch = colorRegex.exec(part);
    let color: Color | undefined;
    let name: string = part;

    if (colorMatch?.[1] && colorMatch[2]) {
      const colorCandidate = colorMatch[1].toLowerCase();
      if (colors.includes(colorCandidate as Color)) {
        color = colorCandidate as Color;
      } else {
        throw new Error(`Invalid color: ${colorCandidate} in cell value: ${cellValue}`);
      }
      name = colorMatch[2].trim();
    }

    // Check for excluded kinds
    if ((excludedKinds as readonly string[]).includes(name)) {
      throw new Error(`Excluded kind found: ${name} in cell value: ${cellValue}`);
    }

    // Check if it's a card kind or name
    if (isValidCardKind(name)) {
      const kindIdentifier: KindIdentifier = {
        kind: name,
        ...(color ? { color } : {}),
      };
      return kindIdentifier;
    }
    const cardRefByName: CardRefByName = { name };
    return cardRefByName;
  });
}

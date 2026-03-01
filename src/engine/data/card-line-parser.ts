import type { CardKind, CardSpec, Color } from "./card-model.ts";
import { generateNextId } from "./id-generator.ts";
import { isValidCardKind } from "./parser-utils.ts";
import { colors } from "./rp-types.ts";

/**
 * Parse a card from a CSV line
 */
export function parseCardFromCsv(line: string[]): CardSpec | null {
  if (line.length < 4) {
    return null;
  }

  const idCell = line[0]?.trim();
  const nameCell = line[1]?.trim();
  const kind1Cell = line[2]?.trim();
  const kind2Cell = line[3]?.trim();
  const kind3Cell = line[4]?.trim();
  const atkCell = line[5]?.trim();
  const defCell = line[6]?.trim();
  const colorCell = line[7]?.trim();

  if (!nameCell) {
    return null;
  }

  let id: number;
  if (idCell && !Number.isNaN(Number(idCell))) {
    id = Number(idCell);
  } else {
    id = generateNextId();
  }

  const kinds: CardKind[] = [];
  if (kind1Cell) {
    if (!isValidCardKind(kind1Cell)) {
      throw new Error(`Invalid kind: ${kind1Cell} in cell value: ${line.join(", ")}`);
    }
    kinds.push(kind1Cell);
  }
  if (kind2Cell) {
    if (!isValidCardKind(kind2Cell)) {
      throw new Error(`Invalid kind: ${kind2Cell} in cell value: ${line.join(", ")}`);
    }
    kinds.push(kind2Cell);
  }
  if (kind3Cell) {
    if (!isValidCardKind(kind3Cell)) {
      throw new Error(`Invalid kind: ${kind3Cell} in cell value: ${line.join(", ")}`);
    }
    kinds.push(kind3Cell);
  }

  if (!atkCell || !defCell) {
    throw new Error(`Missing attack or defense in cell value: ${line.join(", ")}`);
  }
  const attack = Number(atkCell);
  const defense = Number(defCell);
  if (Number.isNaN(attack) || Number.isNaN(defense)) {
    throw new Error(`Invalid attack or defense in cell value: ${line.join(", ")}`);
  }

  const colorLower = colorCell?.toLowerCase();
  const color =
    colorLower && colors.includes(colorLower as Color) ? (colorLower as Color) : undefined;

  return {
    id,
    name: nameCell,
    kinds,
    ...(color ? { color } : {}),
    attack,
    defense,
  };
}

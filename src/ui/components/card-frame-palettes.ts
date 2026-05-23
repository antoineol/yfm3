import type { CardSpec, Color } from "../../engine/data/card-model.ts";

export interface FramePalette {
  lo: string;
  mid: string;
  hi: string;
  border: string;
  text: string;
}

export function framePaletteForCard(card: Pick<CardSpec, "color" | "cardType" | "isMonster">) {
  return framePalette(card.color, card.cardType, card.isMonster);
}

export function frameBorderColor(color?: string, cardType?: string, isMonster?: boolean): string {
  return framePalette(parseFrameColor(color), cardType, isMonster).mid;
}

const monsterPalette: FramePalette = {
  lo: "#6a5020",
  mid: "#b89838",
  hi: "#d4b850",
  border: "#8a7028",
  text: "#2a1e0a",
};

const colorPalettes: Record<Color, FramePalette> = {
  yellow: monsterPalette,
  blue: {
    lo: "#082f8f",
    mid: "#1458d8",
    hi: "#2f82ff",
    border: "#0d42b2",
    text: "#05091e",
  },
  green: {
    lo: "#1a5020",
    mid: "#308838",
    hi: "#50a858",
    border: "#246828",
    text: "#0a2a0e",
  },
  purple: {
    lo: "#5c3387",
    mid: "#9c6ed8",
    hi: "#c7a0f0",
    border: "#7044aa",
    text: "#210d2c",
  },
  orange: {
    lo: "#8a4312",
    mid: "#c97824",
    hi: "#e89b45",
    border: "#a85b1a",
    text: "#2a1406",
  },
  red: {
    lo: "#7e1818",
    mid: "#b83232",
    hi: "#dc5858",
    border: "#982424",
    text: "#2a0606",
  },
};

const cardTypePalettes: Record<string, FramePalette> = {
  Magic: colorPalettes.green,
  Equip: colorPalettes.green,
  Trap: {
    lo: "#802058",
    mid: "#c04888",
    hi: "#d868a8",
    border: "#a03070",
    text: "#2a0a1e",
  },
  Ritual: colorPalettes.blue,
};

function framePalette(
  color: Color | undefined,
  cardType: string | undefined,
  isMonster: boolean | undefined,
): FramePalette {
  if (color) return colorPalettes[color];
  if (isMonster === false && cardType) return cardTypePalettes[cardType] ?? monsterPalette;
  return monsterPalette;
}

function parseFrameColor(color: string | undefined): Color | undefined {
  return color && color in colorPalettes ? (color as Color) : undefined;
}

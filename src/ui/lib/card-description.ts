// ---------------------------------------------------------------------------
// Render-time parsing of card descriptions.
//
// The TBL decoder (`bridge/extract/text-decoding.ts`) emits inline type icons
// as Private-Use-Area chars in the range [ICON_TOKEN_BASE, ICON_TOKEN_END].
// This module splits such a description into renderable segments.
// ---------------------------------------------------------------------------

const ICON_TOKEN_BASE = 0xe100;
const ICON_TOKEN_END = 0xe17f;

/** Game-internal type-ID → display name.
 *  Matches the 24-entry type-names table the game renders for these icons. */
const ICON_TYPE_NAMES: readonly string[] = [
  "Dragon", // 0
  "Spellcaster", // 1
  "Zombie", // 2
  "Warrior", // 3
  "Beast-Warrior", // 4
  "Beast", // 5
  "Winged Beast", // 6
  "Fiend", // 7
  "Fairy", // 8
  "Insect", // 9
  "Dinosaur", // 10
  "Reptile", // 11
  "Fish", // 12
  "Sea Serpent", // 13
  "Machine", // 14
  "Thunder", // 15
  "Aqua", // 16
  "Pyro", // 17
  "Rock", // 18
  "Plant", // 19
  "Magic", // 20
  "Trap", // 21
  "Ritual", // 22
  "Equip", // 23
];

export type DescriptionSegment =
  | { kind: "text"; text: string }
  | { kind: "icon"; type: number; label: string };

export function parseDescription(desc: string): DescriptionSegment[] {
  const segments: DescriptionSegment[] = [];
  let run = "";
  for (const ch of desc) {
    const code = ch.charCodeAt(0);
    if (code >= ICON_TOKEN_BASE && code <= ICON_TOKEN_END) {
      if (run) {
        segments.push({ kind: "text", text: run });
        run = "";
      }
      const type = code - ICON_TOKEN_BASE;
      segments.push({ kind: "icon", type, label: ICON_TYPE_NAMES[type] ?? `Type ${type}` });
    } else {
      run += ch;
    }
  }
  if (run) segments.push({ kind: "text", text: run });
  return segments;
}

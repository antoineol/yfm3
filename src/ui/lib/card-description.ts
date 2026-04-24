// ---------------------------------------------------------------------------
// Render-time parsing of card descriptions.
//
// The TBL decoder (`bridge/extract/text-decoding.ts`) emits inline type icons
// as `[TypeName]` — readable as plain text if rendered raw, and parseable
// here so the UI can wrap each occurrence in a styled chip.
// ---------------------------------------------------------------------------

/** Type names the decoder may emit — used to match `[Name]` tokens
 *  confidently without triggering on unrelated bracketed text. */
const ICON_TYPE_NAMES: ReadonlySet<string> = new Set([
  "Dragon",
  "Spellcaster",
  "Zombie",
  "Warrior",
  "Beast-Warrior",
  "Beast",
  "Winged Beast",
  "Fiend",
  "Fairy",
  "Insect",
  "Dinosaur",
  "Reptile",
  "Fish",
  "Sea Serpent",
  "Machine",
  "Thunder",
  "Aqua",
  "Pyro",
  "Rock",
  "Plant",
  "Magic",
  "Trap",
  "Ritual",
  "Equip",
]);

const TOKEN_RE = /\[([^[\]]+?)\]/g;

export type DescriptionSegment = { kind: "text"; text: string } | { kind: "icon"; label: string };

export function parseDescription(desc: string): DescriptionSegment[] {
  const segments: DescriptionSegment[] = [];
  let last = 0;
  for (const match of desc.matchAll(TOKEN_RE)) {
    const name = match[1] ?? "";
    if (!ICON_TYPE_NAMES.has(name)) continue;
    const start = match.index ?? 0;
    if (start > last) segments.push({ kind: "text", text: desc.slice(last, start) });
    segments.push({ kind: "icon", label: name });
    last = start + match[0].length;
  }
  if (last < desc.length) segments.push({ kind: "text", text: desc.slice(last) });
  return segments;
}

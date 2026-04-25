// ---------------------------------------------------------------------------
// Render-time parsing of card descriptions.
//
// The TBL decoder (`bridge/extract/text-decoding.ts`) emits inline type icons
// as `[TypeName]` — readable as plain text if rendered raw, and parseable
// here so the UI can wrap each occurrence in a styled chip.
// ---------------------------------------------------------------------------

/** Recognizable Unicode glyph per type. Matches the guardian-stars approach
 *  (a single symbol next to the name) — close enough without sprite extraction.
 *  Doubles as the whitelist of names the parser will accept as icon tokens. */
const TYPE_GLYPHS: Readonly<Record<string, string>> = {
  Dragon: "🐉",
  Spellcaster: "🧙",
  Zombie: "🧟",
  Warrior: "⚔️",
  "Beast-Warrior": "🐅",
  Beast: "🐺",
  "Winged Beast": "🦅",
  Fiend: "👹",
  Fairy: "🧚",
  Insect: "🐛",
  Dinosaur: "🦖",
  Reptile: "🦎",
  Fish: "🐟",
  "Sea Serpent": "🐍",
  Machine: "⚙️",
  Thunder: "⚡",
  Aqua: "💧",
  Pyro: "🔥",
  Rock: "🪨",
  Plant: "🌱",
  Magic: "✨",
  Trap: "🪤",
  Ritual: "🕯️",
  Equip: "🛡️",
};

export function glyphForType(name: string): string | undefined {
  return TYPE_GLYPHS[name];
}

const TOKEN_RE = /\[([^[\]]+?)\]/g;

export type DescriptionSegment =
  | { kind: "text"; text: string }
  | { kind: "icon"; label: string; glyph: string };

export function parseDescription(desc: string): DescriptionSegment[] {
  const segments: DescriptionSegment[] = [];
  let last = 0;
  for (const match of desc.matchAll(TOKEN_RE)) {
    const name = match[1] ?? "";
    const glyph = TYPE_GLYPHS[name];
    if (!glyph) continue;
    const start = match.index ?? 0;
    if (start > last) segments.push({ kind: "text", text: desc.slice(last, start) });
    segments.push({ kind: "icon", label: name, glyph });
    last = start + match[0].length;
  }
  if (last < desc.length) segments.push({ kind: "text", text: desc.slice(last) });
  return segments;
}

// ---------------------------------------------------------------------------
// Render-time parsing of card descriptions.
//
// The TBL decoder (`bridge/extract/text-decoding.ts`) emits inline type icons
// as `[TypeName]` — readable as plain text if rendered raw, and parseable
// here so the UI can wrap each occurrence in a sprite extracted from the
// game's icon sheet.
// ---------------------------------------------------------------------------

import {
  displayCardType,
  isCardType,
  normalizeCardType,
} from "../../engine/data/card-type-names.ts";
import { cardTypes } from "../../engine/data/rp-types.ts";

const TYPE_NAMES: ReadonlySet<string> = new Set(
  cardTypes.flatMap((type) => [type, displayCardType(type)]),
);

/** Asset URL for a type icon — extracted from the alpha-mod WA_MRG.MRG sprite
 *  sheet at build time and served from `public/images/type-icons/`. */
export function iconUrlForType(name: string): string | undefined {
  if (!TYPE_NAMES.has(name)) return undefined;
  const type = normalizeCardType(name);
  if (!isCardType(type)) return undefined;
  const slug = displayCardType(type).toLowerCase().replace(/\s+/g, "-");
  return `/images/type-icons/${slug}.png`;
}

const TOKEN_RE = /\[([^[\]]+?)\]/g;

export type DescriptionSegment = { kind: "text"; text: string } | { kind: "icon"; name: string };

export function parseDescription(desc: string): DescriptionSegment[] {
  const segments: DescriptionSegment[] = [];
  let last = 0;
  for (const match of desc.matchAll(TOKEN_RE)) {
    const name = match[1] ?? "";
    if (!TYPE_NAMES.has(name)) continue;
    const start = match.index ?? 0;
    if (start > last) segments.push({ kind: "text", text: desc.slice(last, start) });
    segments.push({ kind: "icon", name });
    last = start + match[0].length;
  }
  if (last < desc.length) segments.push({ kind: "text", text: desc.slice(last) });
  return segments;
}

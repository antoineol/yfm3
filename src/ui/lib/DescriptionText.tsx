import { Fragment } from "react";
import { parseDescription } from "./card-description.ts";

/** Render a card description, expanding inline type-icon tokens into styled
 *  chips with a glyph + name. Pixel-accurate sprites can swap in later by
 *  replacing the glyph span with an <img>. */
export function DescriptionText({ text, className }: { text: string; className?: string }) {
  const segments = parseDescription(text);
  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.kind === "text" ? (
          <Fragment key={`t${String(i)}`}>{seg.text}</Fragment>
        ) : (
          <span
            className="inline-flex items-baseline align-baseline mx-0.5 gap-1 px-1.5 py-px rounded border border-gold/30 bg-gold/10 text-gold text-[0.9em] font-semibold leading-none"
            key={`i${String(i)}`}
          >
            <span aria-hidden="true">{seg.glyph}</span>
            <span>{seg.label}</span>
          </span>
        ),
      )}
    </span>
  );
}

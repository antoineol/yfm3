import { Fragment } from "react";
import { parseDescription } from "./card-description.ts";

/** Render a card description, expanding inline type-icon tokens into styled
 *  chips labeled with the type name (MVP — sprite icons come next). */
export function DescriptionText({ text, className }: { text: string; className?: string }) {
  const segments = parseDescription(text);
  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.kind === "text" ? (
          <Fragment key={`t${String(i)}`}>{seg.text}</Fragment>
        ) : (
          <span
            className="inline-flex items-center align-middle mx-0.5 px-1.5 py-px rounded border border-gold/30 bg-gold/10 text-gold text-[0.85em] font-semibold leading-none"
            key={`i${String(i)}`}
          >
            {seg.label}
          </span>
        ),
      )}
    </span>
  );
}

import { Fragment } from "react";
import { iconUrlForType, parseDescription } from "./card-description.ts";

/** Render a card description, expanding inline `[TypeName]` tokens into
 *  pixel sprites extracted from the game's icon sheet. */
export function DescriptionText({ text, className }: { text: string; className?: string }) {
  const segments = parseDescription(text);
  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.kind === "text" ? (
          <Fragment key={`t${String(i)}`}>{seg.text}</Fragment>
        ) : (
          <img
            alt={seg.name}
            className="inline-block align-text-bottom w-[1.1em] h-[1.1em] mx-0.5"
            key={`i${String(i)}`}
            src={iconUrlForType(seg.name)}
            style={{ imageRendering: "pixelated" }}
          />
        ),
      )}
    </span>
  );
}

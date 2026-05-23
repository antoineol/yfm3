import type { CardSpec } from "../../../engine/data/card-model.ts";
import { framePaletteForCard } from "../../components/card-frame-palettes.ts";
import { useOpenCard } from "../../lib/card-detail-context.tsx";
import { useArtworkSrc } from "../../lib/use-artwork-src.ts";

const attributeOrb: Record<string, string> = {
  Light: "#e8c840",
  Dark: "#7848b0",
  Fire: "#d04828",
  Water: "#3868c8",
  Earth: "#a08030",
  Wind: "#48a048",
};

/** Tiny card thumbnail — full card replica at thumbnail scale, clickable to open detail. */
export function FusionCardThumb({ card }: { card: CardSpec }) {
  const openCard = useOpenCard();
  const resolveArtwork = useArtworkSrc();
  const artSrc = resolveArtwork(card.id);
  const orbColor = card.attribute ? attributeOrb[card.attribute] : undefined;
  const p = framePaletteForCard(card);

  return (
    <button
      className="fm-fusion-thumb shrink-0 cursor-pointer"
      onClick={() => openCard(card.id)}
      style={
        {
          "--fm-lo": p.lo,
          "--fm-mid": p.mid,
          "--fm-hi": p.hi,
          "--fm-border": p.border,
          "--fm-text": p.text,
        } as React.CSSProperties
      }
      type="button"
    >
      <div className="fm-mini-edge">
        <div className="fm-mini-frame">
          {/* Name band */}
          <div className="fm-mini-name-band">
            <span className="fm-mini-name-text">{card.name}</span>
            {orbColor && (
              <span
                aria-label={card.attribute}
                className="fm-mini-orb"
                role="img"
                style={{
                  background: `radial-gradient(circle at 38% 32%, #fff8 10%, ${orbColor} 50%, ${orbColor}88 100%)`,
                }}
              />
            )}
          </div>

          {/* Artwork */}
          <div className="fm-mini-art-well">
            <img alt={card.name} className="fm-mini-art-img" loading="lazy" src={artSrc} />
          </div>

          {/* ATK / DFD */}
          {card.isMonster && (
            <div className="fm-mini-stats">
              <span className="fm-mini-stat-value fm-mini-stat-value--atk">{card.attack}</span>
              <span className="fm-mini-stat-sep">/</span>
              <span className="fm-mini-stat-value fm-mini-stat-value--def">{card.defense}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

import type { CardSpec } from "../../engine/data/card-model.ts";
import { DescriptionText } from "../lib/DescriptionText.tsx";
import { useArtworkSrc } from "../lib/use-artwork-src.ts";
import { framePaletteForCard, labelTextColor } from "./card-frame-palettes.ts";

/** Attribute orb colors — the small sphere next to the card name. */
const attributeOrb: Record<string, string> = {
  Light: "#e8c840",
  Dark: "#7848b0",
  Fire: "#d04828",
  Water: "#3868c8",
  Earth: "#a08030",
  Wind: "#48a048",
};

function getCardTypeLabel(cardType: string): string {
  switch (cardType) {
    case "Magic":
      return "Normal Magic Card";
    case "Equip":
      return "Equip Magic Card";
    case "Trap":
      return "Trap Card";
    case "Ritual":
      return "Ritual Card";
    default:
      return "";
  }
}

export function GameCard({ card }: { card: CardSpec }) {
  const resolveArtwork = useArtworkSrc();
  const artSrc = resolveArtwork(card.id);
  const ct = card.cardType ?? "";
  const orbColor = card.attribute ? attributeOrb[card.attribute] : undefined;
  const p = framePaletteForCard(card);
  const nameTextColor = labelTextColor(card.labelColor) ?? p.text;
  const typeLabel = !card.isMonster && ct ? getCardTypeLabel(ct) : "";

  return (
    <div
      className="fm-card w-52 sm:w-60"
      style={
        {
          "--fm-lo": p.lo,
          "--fm-mid": p.mid,
          "--fm-hi": p.hi,
          "--fm-border": p.border,
          "--fm-text": p.text,
          "--fm-name-text": nameTextColor,
        } as React.CSSProperties
      }
    >
      {/* Outer dark edge */}
      <div className="fm-card-edge">
        {/* Frame */}
        <div className="fm-card-frame">
          {/* ── Name band ── */}
          <div className="fm-card-name-band">
            <span className="fm-card-name-text">{card.name}</span>
            {orbColor && (
              <span
                aria-label={card.attribute}
                className="fm-card-orb"
                role="img"
                style={{
                  background: `radial-gradient(circle at 38% 32%, #fff8 10%, ${orbColor} 50%, ${orbColor}88 100%)`,
                }}
              />
            )}
          </div>

          {/* ── Fixed-height zone: stars (monsters) or type line (non-monsters) ── */}
          <div className="fm-card-mid-zone">
            {card.isMonster ? (
              card.level !== undefined && card.level > 0 ? (
                <div className="fm-card-stars">
                  {Array.from({ length: card.level }, (_, i) => (
                    <span className="fm-card-star" key={`star-${String(i)}`}>
                      ★
                    </span>
                  ))}
                </div>
              ) : null
            ) : (
              typeLabel && <p className="fm-card-type-line">[ {typeLabel} ]</p>
            )}
          </div>

          {/* ── Artwork ── */}
          <div className="fm-card-art-well">
            <img alt={card.name} className="fm-card-art-img" loading="lazy" src={artSrc} />
          </div>

          {/* ── Bottom zone ── */}
          <div className={`fm-card-bottom ${card.isMonster ? "fm-card-bottom--split" : ""}`}>
            {card.description && (
              <div className="fm-card-desc">
                <DescriptionText className="fm-card-desc-text" text={card.description} />
              </div>
            )}
            {card.isMonster && (
              <div className="fm-card-stats">
                <div className="fm-card-stat-row">
                  <span className="fm-card-stat-label">ATK</span>
                  <span className="fm-card-stat-value">{card.attack}</span>
                </div>
                <div className="fm-card-stat-row">
                  <span className="fm-card-stat-label">DFD</span>
                  <span className="fm-card-stat-value">{card.defense}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

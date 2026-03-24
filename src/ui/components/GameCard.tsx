import type { CardSpec } from "../../engine/data/card-model.ts";
import { artworkSrc } from "../lib/format.ts";
import { useSelectedMod } from "../lib/use-selected-mod.ts";

/** Attribute orb colors — the small sphere next to the card name. */
const attributeOrb: Record<string, string> = {
  Light: "#e8c840",
  Dark: "#7848b0",
  Fire: "#d04828",
  Water: "#3868c8",
  Earth: "#a08030",
  Wind: "#48a048",
};

/**
 * Each card type has a specific color palette for the frame.
 * lo = shadow tone, mid = main frame, hi = highlight, border = name band border
 */
interface FramePalette {
  lo: string;
  mid: string;
  hi: string;
  border: string;
  text: string;
}

const monsterPalette: FramePalette = {
  lo: "#6a5020",
  mid: "#b89838",
  hi: "#d4b850",
  border: "#8a7028",
  text: "#2a1e0a",
};

const cardTypePalettes: Record<string, FramePalette> = {
  Magic: {
    lo: "#1a5020",
    mid: "#308838",
    hi: "#50a858",
    border: "#246828",
    text: "#0a2a0e",
  },
  Equip: {
    lo: "#1a5020",
    mid: "#308838",
    hi: "#50a858",
    border: "#246828",
    text: "#0a2a0e",
  },
  Trap: {
    lo: "#802058",
    mid: "#c04888",
    hi: "#d868a8",
    border: "#a03070",
    text: "#2a0a1e",
  },
  Ritual: {
    lo: "#183880",
    mid: "#2858c0",
    hi: "#4070e0",
    border: "#1e3090",
    text: "#0a0e2a",
  },
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
  const modId = useSelectedMod();
  const artSrc = artworkSrc(modId, card.id);
  const ct = card.cardType ?? "";
  const orbColor = card.attribute ? attributeOrb[card.attribute] : undefined;
  const p = !card.isMonster && ct ? (cardTypePalettes[ct] ?? monsterPalette) : monsterPalette;
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
                <p className="fm-card-desc-text">{card.description}</p>
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

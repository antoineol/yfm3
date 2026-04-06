import type { CardSpec } from "../../../engine/data/card-model.ts";
import { useOpenCard } from "../../lib/card-detail-context.tsx";
import { useArtworkSrc } from "../../lib/use-artwork-src.ts";

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
  Magic: { lo: "#1a5020", mid: "#308838", hi: "#50a858", border: "#246828", text: "#0a2a0e" },
  Equip: { lo: "#1a5020", mid: "#308838", hi: "#50a858", border: "#246828", text: "#0a2a0e" },
  Trap: { lo: "#802058", mid: "#c04888", hi: "#d868a8", border: "#a03070", text: "#2a0a1e" },
  Ritual: { lo: "#183880", mid: "#2858c0", hi: "#4070e0", border: "#1e3090", text: "#0a0e2a" },
};

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
  const ct = card.cardType ?? "";
  const p = !card.isMonster && ct ? (cardTypePalettes[ct] ?? monsterPalette) : monsterPalette;

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

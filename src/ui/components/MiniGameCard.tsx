import type { CardSpec } from "../../engine/data/card-model.ts";
import { useOpenCard } from "../lib/card-detail-context.tsx";
import { artworkSrc } from "../lib/format.ts";
import { useSelectedMod } from "../lib/use-selected-mod.ts";

const attributeOrb: Record<string, string> = {
  Light: "#e8c840",
  Dark: "#7848b0",
  Fire: "#d04828",
  Water: "#3868c8",
  Earth: "#a08030",
  Wind: "#48a048",
};

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

export function MiniGameCard({
  card,
  onRemove,
  atkOverride,
  defOverride,
}: {
  card: CardSpec;
  onRemove?: () => void;
  /** Live ATK from RAM (includes equip boosts). Shown instead of base ATK when provided. */
  atkOverride?: number;
  /** Live DEF from RAM (includes equip boosts). Shown instead of base DEF when provided. */
  defOverride?: number;
}) {
  const openCard = useOpenCard();
  const modId = useSelectedMod();
  const artSrc = artworkSrc(modId, card.id);
  const ct = card.cardType ?? "";
  const orbColor = card.attribute ? attributeOrb[card.attribute] : undefined;
  const p = !card.isMonster && ct ? (cardTypePalettes[ct] ?? monsterPalette) : monsterPalette;

  return (
    <div
      className="group relative"
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
      <button
        className="fm-mini w-full text-left cursor-pointer"
        onClick={() => openCard(card.id)}
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

            {/* ATK / DEF or card-type label */}
            {card.isMonster ? (
              <div className="fm-mini-stats">
                <span
                  className={`fm-mini-stat-value fm-mini-stat-value--atk${atkOverride !== undefined ? (atkOverride < card.attack ? " fm-mini-stat-value--weakened" : " fm-mini-stat-value--boosted") : ""}`}
                >
                  {atkOverride ?? card.attack}
                </span>
                <span className="fm-mini-stat-sep">/</span>
                <span
                  className={`fm-mini-stat-value fm-mini-stat-value--def${defOverride !== undefined ? (defOverride < card.defense ? " fm-mini-stat-value--weakened" : " fm-mini-stat-value--boosted") : ""}`}
                >
                  {defOverride ?? card.defense}
                </span>
              </div>
            ) : (
              <div className="fm-mini-stats">
                <span className="fm-mini-stat-type">{ct || "Magic"}</span>
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Remove button — sibling to avoid nested interactive elements */}
      {onRemove && (
        <button
          aria-label={`Remove ${card.name}`}
          className="fm-mini-close"
          onClick={onRemove}
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
}

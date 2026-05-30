import type { CardSpec } from "../../engine/data/card-model.ts";
import { useOpenCard } from "../lib/card-detail-context.tsx";
import { useArtworkSrc } from "../lib/use-artwork-src.ts";
import { cardTypeDisplayLabel } from "./card-entries.ts";
import { framePaletteForCard } from "./card-frame-palettes.ts";

const attributeOrb: Record<string, string> = {
  Light: "#e8c840",
  Dark: "#7848b0",
  Fire: "#d04828",
  Water: "#3868c8",
  Earth: "#a08030",
  Wind: "#48a048",
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
  const resolveArtwork = useArtworkSrc();
  const artSrc = resolveArtwork(card.id);
  const typeLabel = cardTypeDisplayLabel(card);
  const orbColor = card.attribute ? attributeOrb[card.attribute] : undefined;
  const p = framePaletteForCard(card);

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
                <span className="fm-mini-stat-type">{typeLabel || "Magic"}</span>
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

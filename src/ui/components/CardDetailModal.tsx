import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { CardSpec } from "../../engine/data/card-model.ts";
import { useCardDb } from "../lib/card-db-context.tsx";
import { useCardDetail } from "../lib/card-detail-context.tsx";
import { formatCardId } from "../lib/format.ts";
import { CloseButton } from "./CloseButton.tsx";

export function CardDetailModal() {
  const { cardId, closeCard } = useCardDetail();
  const { cardsById } = useCardDb();
  const card = cardId ? cardsById.get(cardId) : undefined;

  return (
    <BaseDialog.Root onOpenChange={(v) => !v && closeCard()} open={cardId !== null}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/70" />
        <BaseDialog.Popup className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-bg-panel border border-border-accent rounded-xl shadow-overlay w-[calc(100vw-2rem)] max-w-3xl max-h-[calc(100vh-2rem)] overflow-y-auto focus:outline-none">
          {card && <CardDetailContent card={card} />}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

function CardDetailContent({ card }: { card: CardSpec }) {
  const firstKind = card.kinds[0];
  const isMonster = firstKind !== undefined && !NON_MONSTER_TYPES.has(firstKind);

  return (
    <div className="flex flex-col sm:flex-row">
      {/* Card rendering (left / top on mobile) */}
      <div className="flex flex-col items-center justify-center gap-2 p-4 sm:p-6 sm:border-r border-b sm:border-b-0 border-border-subtle bg-bg-deep/50">
        <GameCard card={card} isMonster={isMonster} />
        <div className="flex items-center justify-between w-52 sm:w-60 px-1">
          <span className="text-text-muted text-[10px] font-mono">{formatCardId(card.id)}</span>
          <span className="text-text-secondary text-[10px] font-display truncate max-w-[80%] text-right">
            {card.name}
          </span>
        </div>
      </div>

      {/* Card details (right / bottom on mobile) */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col gap-4 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <BaseDialog.Title className="font-display text-base sm:text-lg font-bold text-gold leading-tight">
            {card.name}
          </BaseDialog.Title>
          <BaseDialog.Close render={<CloseButton label="Close" />} />
        </div>

        <DetailPanel card={card} isMonster={isMonster} />
      </div>
    </div>
  );
}

/* ── Detail Panel (right side) ───────────────────────────────── */

function DetailPanel({ card, isMonster }: { card: CardSpec; isMonster: boolean }) {
  const firstKind = card.kinds[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-4">
        {firstKind && (
          <DetailSection label="Type">
            <span className="text-sm text-text-primary">{formatKind(firstKind)}</span>
          </DetailSection>
        )}
        {card.attribute && (
          <DetailSection label="Attribute">
            <span className="text-sm text-text-primary">{card.attribute}</span>
          </DetailSection>
        )}
        {card.level !== undefined && isMonster && (
          <DetailSection label="Level">
            <span className="text-sm text-text-primary">{card.level}</span>
          </DetailSection>
        )}
      </div>

      {isMonster && (
        <div className="flex gap-6">
          <DetailSection label="ATK">
            <span className="text-base font-mono font-bold text-stat-atk">{card.attack}</span>
          </DetailSection>
          <DetailSection label="DEF">
            <span className="text-base font-mono font-bold text-stat-def">{card.defense}</span>
          </DetailSection>
        </div>
      )}

      {card.guardianStar1 && card.guardianStar1 !== "None" && (
        <DetailSection label="Guardian Star">
          <div className="flex flex-col gap-0.5">
            <GuardianStarRow star={card.guardianStar1} />
            {card.guardianStar2 && card.guardianStar2 !== "None" && (
              <GuardianStarRow star={card.guardianStar2} />
            )}
          </div>
        </DetailSection>
      )}

      {card.description && (
        <div className="rounded-lg border border-border-subtle bg-bg-surface/40 px-3 py-2.5">
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
            {card.description}
          </p>
        </div>
      )}

      <div className="flex gap-4 text-xs text-text-muted">
        {card.color && <span>Color: {capitalize(card.color)}</span>}
        {card.starchipCost !== undefined && <span>Starchips: {card.starchipCost}</span>}
        {card.password !== undefined && (
          <span>Password: {String(card.password).padStart(8, "0")}</span>
        )}
      </div>
    </div>
  );
}

function DetailSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-text-muted uppercase tracking-wide font-bold">{label}</span>
      {children}
    </div>
  );
}

/* ── Guardian Star Symbols ───────────────────────────────────── */

const guardianStarSymbols: Record<string, string> = {
  Sun: "\u2609",
  Moon: "\u263D",
  Mercury: "\u263F",
  Venus: "\u2640",
  Mars: "\u2642",
  Jupiter: "\u2643",
  Saturn: "\u2644",
  Uranus: "\u2645",
  Neptune: "\u2646",
  Pluto: "\u2647",
};

function GuardianStarRow({ star }: { star: string }) {
  const symbol = guardianStarSymbols[star];
  return (
    <span className="text-sm text-text-primary">
      {symbol && <span className="text-gold mr-1.5">{symbol}</span>}
      {star}
    </span>
  );
}

/* ── Game Card Rendering ─────────────────────────────────────── */

const NON_MONSTER_TYPES = new Set(["Magic", "Equip", "Trap", "Ritual"]);

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
 * Each card type has a specific color palette for the frame, sampled from the game.
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
    lo: "#183880",
    mid: "#2858c0",
    hi: "#4070e0",
    border: "#1e3090",
    text: "#0a0e2a",
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
    lo: "#185868",
    mid: "#2888a0",
    hi: "#48a8c0",
    border: "#207088",
    text: "#0a1e2a",
  },
};

function getCardTypeLabel(firstKind: string): string {
  switch (firstKind) {
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

function GameCard({ card, isMonster }: { card: CardSpec; isMonster: boolean }) {
  const artSrc = `/images/artwork/${formatCardId(card.id)}.webp`;
  const firstKind = card.kinds[0];
  const orbColor = card.attribute ? attributeOrb[card.attribute] : undefined;
  const p =
    firstKind && !isMonster ? (cardTypePalettes[firstKind] ?? monsterPalette) : monsterPalette;
  const typeLabel = firstKind && !isMonster ? getCardTypeLabel(firstKind) : "";

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
        {/* Golden frame */}
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

          {/* ── Type line for non-monsters ── */}
          {typeLabel && <p className="fm-card-type-line">[ {typeLabel} ]</p>}

          {/* ── Level stars for monsters ── */}
          {card.level !== undefined && card.level > 0 && isMonster && (
            <div className="fm-card-stars">
              {Array.from({ length: card.level }, (_, i) => (
                <span className="fm-card-star" key={`star-${String(i)}`}>
                  ★
                </span>
              ))}
            </div>
          )}

          {/* ── Artwork ── */}
          <div className="fm-card-art-well">
            <img alt={card.name} className="fm-card-art-img" loading="lazy" src={artSrc} />
          </div>

          {/* ── Bottom zone ── */}
          <div className={`fm-card-bottom ${isMonster ? "fm-card-bottom--split" : ""}`}>
            {card.description && (
              <div className="fm-card-desc">
                <p className="fm-card-desc-text">{card.description}</p>
              </div>
            )}
            {isMonster && (
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

/* ── Helpers ──────────────────────────────────────────────────── */

function formatKind(kind: string): string {
  if (kind === "WingedBeast") return "Winged Beast";
  if (kind === "SeaSerpent") return "Sea Serpent";
  return kind;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

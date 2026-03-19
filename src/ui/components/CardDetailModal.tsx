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
        {/* Below-card info like the game */}
        <div className="flex items-center justify-between w-48 sm:w-56 px-1">
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
      {/* Type + Stats row */}
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

      {/* ATK / DEF */}
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

      {/* Guardian Stars */}
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

      {/* Description */}
      {card.description && (
        <div className="rounded-lg border border-border-subtle bg-bg-surface/40 px-3 py-2.5">
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
            {card.description}
          </p>
        </div>
      )}

      {/* Extra info */}
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

/**
 * Card frame colors matching the FM aesthetic.
 * Monsters get the classic brownish-gold frame; spell/trap types get distinct colors.
 */
const frameStyles: Record<string, { outer: string; inner: string }> = {
  Magic: { outer: "#2d5a3a", inner: "#1a3a24" },
  Equip: { outer: "#2a4a6a", inner: "#1a2e44" },
  Trap: { outer: "#6a2a5a", inner: "#3e1a36" },
  Ritual: { outer: "#2a5a6a", inner: "#1a3a44" },
};

const monsterFrame = { outer: "#8a7535", inner: "#5a4a20" };

function GameCard({ card, isMonster }: { card: CardSpec; isMonster: boolean }) {
  const artSrc = `/images/artwork/${formatCardId(card.id)}.webp`;
  const firstKind = card.kinds[0];
  const frame = firstKind && !isMonster ? (frameStyles[firstKind] ?? monsterFrame) : monsterFrame;

  return (
    <div
      className="w-48 sm:w-56 rounded-sm overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${frame.outer} 0%, ${frame.inner} 50%, ${frame.outer} 100%)`,
        boxShadow: "0 0 24px rgba(0,0,0,0.5), inset 0 0 1px rgba(255,255,255,0.1)",
      }}
    >
      {/* Outer frame padding — thick like the game */}
      <div className="p-1.5 sm:p-2">
        {/* Inner card body */}
        <div className="flex flex-col overflow-hidden rounded-xs" style={{ background: "#0c0e14" }}>
          {/* Card name banner */}
          <div
            className="px-2 py-1 sm:py-1.5 border-b"
            style={{
              background: "linear-gradient(180deg, #2a2418 0%, #1a1610 100%)",
              borderColor: "#3a3020",
            }}
          >
            <p className="font-display text-[10px] sm:text-xs text-gold-bright leading-tight truncate">
              {card.name}
            </p>
          </div>

          {/* Level stars */}
          {card.level !== undefined && card.level > 0 && isMonster && (
            <div className="flex justify-center gap-0.5 py-0.75" style={{ background: "#0c0e14" }}>
              {Array.from({ length: card.level }, (_, i) => (
                <span
                  className="text-[7px] sm:text-[8px] leading-none"
                  key={`star-${String(i)}`}
                  style={{ color: "#d4a830" }}
                >
                  ★
                </span>
              ))}
            </div>
          )}

          {/* Artwork — fills the card like in-game */}
          <div className="mx-1.25 sm:mx-1.5 mt-0.5">
            <div
              className="aspect-square overflow-hidden"
              style={{
                border: "1px solid #2a2418",
                boxShadow: "inset 0 0 4px rgba(0,0,0,0.6)",
              }}
            >
              <img
                alt={card.name}
                className="w-full h-full object-cover"
                loading="lazy"
                src={artSrc}
              />
            </div>
          </div>

          {/* ATK / DEF bar — matching the game's bottom bar */}
          {isMonster && (
            <div
              className="flex items-center justify-between px-2 sm:px-2.5 py-1 sm:py-1.5 mt-0.5"
              style={{
                background: "linear-gradient(180deg, #14161e 0%, #0c0e14 100%)",
                borderTop: "1px solid #2a2418",
              }}
            >
              <span className="text-[10px] sm:text-xs">
                <span style={{ color: "#888" }}>ATK </span>
                <span className="font-mono font-bold" style={{ color: "#f0f0f0" }}>
                  {card.attack}
                </span>
              </span>
              <span className="text-[10px] sm:text-xs">
                <span style={{ color: "#888" }}>DEF </span>
                <span className="font-mono font-bold" style={{ color: "#f0f0f0" }}>
                  {card.defense}
                </span>
              </span>
            </div>
          )}
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

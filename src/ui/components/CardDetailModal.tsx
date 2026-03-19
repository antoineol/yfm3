import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { CardSpec } from "../../engine/data/card-model.ts";
import { useCardDb } from "../lib/card-db-context.tsx";
import { useCardDetail } from "../lib/card-detail-context.tsx";
import { CloseButton } from "./CloseButton.tsx";
import { GameCard } from "./GameCard.tsx";

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
  return (
    <div className="flex flex-col sm:flex-row">
      {/* Card rendering (left / top on mobile) */}
      <div className="flex flex-col items-center justify-center gap-2 p-4 sm:p-6 sm:border-r border-b sm:border-b-0 border-border-subtle bg-bg-deep/50">
        <GameCard card={card} />
        {/* <div className="flex items-center justify-between w-52 sm:w-60 px-1">
          <span className="text-text-muted text-[10px] font-mono">{formatCardId(card.id)}</span>
          <span className="text-text-secondary text-[10px] font-display truncate max-w-[80%] text-right">
            {card.name}
          </span>
        </div> */}
      </div>

      {/* Card details (right / bottom on mobile) */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col gap-4 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <BaseDialog.Title className="font-display text-base sm:text-lg font-bold text-gold leading-tight">
            {card.name}
          </BaseDialog.Title>
          <BaseDialog.Close render={<CloseButton label="Close" />} />
        </div>

        <DetailPanel card={card} />
      </div>
    </div>
  );
}

/* ── Detail Panel (right side) ───────────────────────────────── */

function DetailPanel({ card }: { card: CardSpec }) {
  const typeDisplay = card.kinds[0] ? formatKind(card.kinds[0]) : card.cardType;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-4">
        {typeDisplay && (
          <DetailSection label="Type">
            <span className="text-sm text-text-primary">{typeDisplay}</span>
          </DetailSection>
        )}
        {card.attribute && (
          <DetailSection label="Attribute">
            <span className="text-sm text-text-primary">{card.attribute}</span>
          </DetailSection>
        )}
        {card.level !== undefined && card.isMonster && (
          <DetailSection label="Level">
            <span className="text-sm text-text-primary">{card.level}</span>
          </DetailSection>
        )}
      </div>

      {card.isMonster && (
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
          <p className="text-sm text-text-primary leading-relaxed">{card.description}</p>
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

/* ── Helpers ──────────────────────────────────────────────────── */

function formatKind(kind: string): string {
  if (kind === "WingedBeast") return "Winged Beast";
  if (kind === "SeaSerpent") return "Sea Serpent";
  return kind;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

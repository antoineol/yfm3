import type { ReactNode } from "react";
import { useMemo } from "react";
import type { CardSpec } from "../../../engine/data/card-model.ts";
import { maxCopiesFor } from "../../../engine/data/game-db.ts";
import { MAX_CARD_ID } from "../../../engine/types/constants.ts";
import { GameCard } from "../../components/GameCard.tsx";
import { useOwnedCardTotals } from "../../db/use-owned-card-totals.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { useFusionTable } from "../../lib/fusion-table-context.tsx";
import { DroppedBySection } from "./DroppedBySection.tsx";
import { EquippableBySection } from "./EquippableBySection.tsx";
import { EquipsToSection } from "./EquipsToSection.tsx";
import { FusesToSection } from "./FusesToSection.tsx";

export function CardDetailBody({ card, header }: { card: CardSpec; header: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row">
      {/* Card rendering (left / top on mobile) */}
      <div className="flex flex-col items-center justify-center sm:justify-start gap-2 p-4 sm:p-6 sm:border-r border-b sm:border-b-0 border-border-subtle bg-bg-deep/50">
        <GameCard card={card} />
      </div>

      {/* Card details (right / bottom on mobile) */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col gap-4 min-w-0">
        {header}
        <DetailPanel card={card} />
      </div>
    </div>
  );
}

/* ── Detail Panel (right side) ───────────────────────────────── */

function DetailPanel({ card }: { card: CardSpec }) {
  const typeDisplay = card.kinds[0] ? formatKind(card.kinds[0]) : card.cardType;
  const ownedTotals = useOwnedCardTotals();
  const cardDb = useCardDb();
  const cap = maxCopiesFor(cardDb, card.id);

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
        {card.isMonster && (
          <>
            <DetailSection label="ATK">
              <span className="text-base font-mono font-bold text-stat-atk">{card.attack}</span>
            </DetailSection>
            <DetailSection label="DFD">
              <span className="text-base font-mono font-bold text-stat-def">{card.defense}</span>
            </DetailSection>
          </>
        )}
        {ownedTotals !== undefined && <OwnedBadge count={ownedTotals[card.id] ?? 0} max={cap} />}
      </div>

      {card.guardianStar1 && card.guardianStar1 !== "None" && (
        <DetailSection label="Guardian Stars">
          <div className="flex gap-3">
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

      <DroppedBySection cardId={card.id} />
      <FusedBySection cardId={card.id} />
      <FusesToSection cardId={card.id} />
      {card.isMonster && <EquippableBySection cardId={card.id} />}
      {card.cardType === "Equip" && <EquipsToSection cardId={card.id} />}
    </div>
  );
}

/* ── Fused By Section ────────────────────────────────────────── */

function FusedBySection({ cardId }: { cardId: number }) {
  const { fusions, cardDb } = useFusionTable();

  const fusedBy = useMemo(() => fusions.filter((f) => f.resultId === cardId), [fusions, cardId]);

  function cardLink(id: number) {
    const card = cardDb.cardsById.get(id);
    return (
      <a
        className="block truncate text-text-primary hover:text-gold transition-colors duration-150 hover:underline decoration-gold/30 underline-offset-2"
        href={`${window.location.pathname}#data/cards/${id}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        {card?.name ?? `#${id}`}
      </a>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] text-text-muted uppercase tracking-wide font-bold">
        Fused by
      </span>
      {fusedBy.length === 0 ? (
        <p className="text-xs text-text-muted italic">No fusions produce this card.</p>
      ) : (
        <div className="rounded-lg border border-border-subtle overflow-hidden">
          <table className="w-full table-fixed text-xs">
            <thead>
              <tr className="bg-bg-surface/80 text-text-muted uppercase tracking-wider text-[10px]">
                <th className="text-left py-1.5 px-2.5 font-semibold w-1/2">Material 1</th>
                <th className="text-left py-1.5 px-2.5 font-semibold w-1/2">Material 2</th>
              </tr>
            </thead>
            <tbody>
              {fusedBy.map((f) => (
                <tr
                  className="border-t border-border-subtle/40 transition-colors duration-100 hover:bg-gold/4 even:bg-bg-surface/20"
                  key={f.material1Id * MAX_CARD_ID + f.material2Id}
                >
                  <td className="py-1.5 px-2.5 text-text-primary">{cardLink(f.material1Id)}</td>
                  <td className="py-1.5 px-2.5 text-text-primary">{cardLink(f.material2Id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Small UI helpers ────────────────────────────────────────── */

function OwnedBadge({ count, max }: { count: number; max: number }) {
  const needMore = count < max;
  return (
    <DetailSection label="Owned">
      <span
        className={`text-base font-mono font-bold ${needMore ? "text-text-need owned-need" : "text-text-muted"}`}
      >
        {count}
        <span className="text-text-muted font-normal text-xs"> / {max}</span>
      </span>
    </DetailSection>
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

function formatKind(kind: string): string {
  if (kind === "WingedBeast") return "Winged Beast";
  if (kind === "SeaSerpent") return "Sea Serpent";
  return kind;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { useMemo } from "react";
import type { CardSpec } from "../../engine/data/card-model.ts";
import { useCardDb } from "../lib/card-db-context.tsx";
import { useCardDetail } from "../lib/card-detail-context.tsx";
import { formatRate } from "../lib/format.ts";
import { useFusionTable } from "../lib/fusion-table-context.tsx";
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

      <DroppedBySection cardId={card.id} />
    </div>
  );
}

/* ── Dropped By Section ──────────────────────────────────────── */

interface DuelistDrop {
  duelistId: number;
  duelistName: string;
  saPow: number;
  bcd: number;
  saTec: number;
}

function DroppedBySection({ cardId }: { cardId: number }) {
  const { duelists } = useFusionTable();

  const drops = useMemo(() => {
    const result: DuelistDrop[] = [];
    for (const row of duelists) {
      if (row.cardId === cardId && (row.saPow > 0 || row.bcd > 0 || row.saTec > 0)) {
        result.push({
          duelistId: row.duelistId,
          duelistName: row.duelistName,
          saPow: row.saPow,
          bcd: row.bcd,
          saTec: row.saTec,
        });
      }
    }
    result.sort((a, b) => b.saPow + b.bcd + b.saTec - (a.saPow + a.bcd + a.saTec));
    return result;
  }, [duelists, cardId]);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] text-text-muted uppercase tracking-wide font-bold">
        Dropped by
      </span>
      {drops.length === 0 ? (
        <p className="text-xs text-text-muted italic">No duelists drop this card.</p>
      ) : (
        <div className="rounded-lg border border-border-subtle overflow-hidden max-h-48 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-bg-surface/80 backdrop-blur-sm text-text-muted uppercase tracking-wider text-[10px]">
                <th className="text-left py-1.5 px-2.5 font-semibold">Duelist</th>
                <th className="text-right py-1.5 px-2 font-semibold w-16">SA-POW</th>
                <th className="text-right py-1.5 px-2 font-semibold w-14">BCD</th>
                <th className="text-right py-1.5 px-2 font-semibold w-16">SA-TEC</th>
              </tr>
            </thead>
            <tbody>
              {drops.map((d) => (
                <tr
                  className="border-t border-border-subtle/40 transition-colors duration-100 hover:bg-gold/4 even:bg-bg-surface/20"
                  key={d.duelistId}
                >
                  <td className="py-1.5 px-2.5">
                    <a
                      className="text-text-primary hover:text-gold transition-colors duration-150 hover:underline decoration-gold/30 underline-offset-2"
                      href={`#data/duelists/${d.duelistId}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {d.duelistName}
                    </a>
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-gold/90">
                    {formatRate(d.saPow)}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-gold/90">
                    {formatRate(d.bcd)}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-gold/90">
                    {formatRate(d.saTec)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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

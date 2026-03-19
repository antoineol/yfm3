import { useMemo, useState } from "react";
import type { CardDb } from "../../../engine/data/game-db.ts";
import type { RefDuelistCard } from "../../../engine/reference/build-reference-table.ts";
import { CardName } from "../../components/CardName.tsx";
import { SectionLabel } from "../../components/panel-chrome.tsx";
import { formatCardId } from "../../lib/format.ts";

const DROP_TOTAL = 2048;

export function formatRate(raw: number): string {
  if (raw === 0) return "—";
  const pct = ((raw / DROP_TOTAL) * 100).toFixed(1);
  return `${raw} (${pct}%)`;
}

interface Duelist {
  id: number;
  name: string;
}

function extractDuelists(rows: RefDuelistCard[]): Duelist[] {
  const seen = new Map<number, string>();
  for (const r of rows) {
    if (!seen.has(r.duelistId)) seen.set(r.duelistId, r.duelistName);
  }
  return [...seen.entries()].map(([id, name]) => ({ id, name }));
}

function getDeckCards(rows: RefDuelistCard[], duelistId: number) {
  return rows
    .filter((r) => r.duelistId === duelistId && r.deck > 0)
    .sort((a, b) => b.deck - a.deck);
}

function getDropCards(rows: RefDuelistCard[], duelistId: number) {
  return rows
    .filter((r) => r.duelistId === duelistId && (r.saPow > 0 || r.bcd > 0 || r.saTec > 0))
    .sort((a, b) => b.saPow + b.bcd + b.saTec - (a.saPow + a.bcd + a.saTec));
}

export function DuelistsPanel({
  duelists,
  cardDb,
}: {
  duelists: RefDuelistCard[];
  cardDb: CardDb;
}) {
  const duelistList = useMemo(() => extractDuelists(duelists), [duelists]);
  const [selectedId, setSelectedId] = useState<number>(duelistList[0]?.id ?? 1);

  const selectedDuelist = duelistList.find((d) => d.id === selectedId);
  const deckCards = useMemo(() => getDeckCards(duelists, selectedId), [duelists, selectedId]);
  const dropCards = useMemo(() => getDropCards(duelists, selectedId), [duelists, selectedId]);

  return (
    <div className="flex flex-col gap-5">
      {/* Duelist Selector */}
      <div className="flex items-center gap-4">
        <label
          className="font-display text-xs font-semibold uppercase tracking-widest text-gold-dim"
          htmlFor="duelist-select"
        >
          Duelist
        </label>
        <div className="relative">
          <select
            className="appearance-none bg-bg-surface border border-border-subtle rounded-lg pl-3 pr-8 py-2 text-sm text-text-primary
              focus:outline-none focus:border-gold-dim focus:shadow-glow-gold-xs transition-all duration-200
              hover:border-border-accent cursor-pointer"
            id="duelist-select"
            onChange={(e) => setSelectedId(Number(e.target.value))}
            value={selectedId}
          >
            {duelistList.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">
            ▾
          </div>
        </div>
        {selectedDuelist && (
          <span className="text-xs text-text-muted ml-auto">#{selectedDuelist.id}</span>
        )}
      </div>

      {/* Drops Section */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <SectionLabel>Drops</SectionLabel>
          <span className="text-xs text-text-muted font-mono">{dropCards.length} cards</span>
        </div>
        {dropCards.length > 0 ? (
          <DuelistTable>
            <thead className="sticky top-0 bg-bg-surface border-b border-border-subtle z-10">
              <tr className="text-text-secondary text-xs uppercase tracking-wide">
                <th className="text-left py-2 px-1 font-normal w-10">#</th>
                <th className="text-left py-2 px-1 font-normal">Card</th>
                <th className="text-left py-2 px-2 font-normal w-14">ATK</th>
                <th className="text-right py-2 px-2 font-normal w-28">SA-POW</th>
                <th className="text-right py-2 px-2 font-normal w-28">BCD</th>
                <th className="text-right py-2 px-2 font-normal w-28">SA-TEC</th>
              </tr>
            </thead>
            <tbody>
              {dropCards.map((row) => {
                const card = cardDb.cardsById.get(row.cardId);
                return (
                  <DuelistRow key={row.cardId}>
                    <td className="py-1.5 px-1 font-mono text-xs text-text-muted">
                      {formatCardId(row.cardId)}
                    </td>
                    <td className="py-1.5 px-1 text-text-primary">
                      <CardName cardId={row.cardId} name={card?.name ?? `#${row.cardId}`} />
                    </td>
                    <td className="py-1.5 px-2 font-mono font-bold text-stat-atk">
                      {card?.attack ?? 0}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-xs text-gold">
                      {formatRate(row.saPow)}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-xs text-gold">
                      {formatRate(row.bcd)}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-xs text-gold">
                      {formatRate(row.saTec)}
                    </td>
                  </DuelistRow>
                );
              })}
            </tbody>
          </DuelistTable>
        ) : (
          <EmptySection message="No drops for this duelist." />
        )}
      </section>

      {/* Deck Section */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <SectionLabel>Deck</SectionLabel>
          <span className="text-xs text-text-muted font-mono">{deckCards.length} cards</span>
        </div>
        {deckCards.length > 0 ? (
          <DuelistTable>
            <thead className="sticky top-0 bg-bg-surface border-b border-border-subtle z-10">
              <tr className="text-text-secondary text-xs uppercase tracking-wide">
                <th className="text-left py-2 px-1 font-normal w-10">#</th>
                <th className="text-left py-2 px-1 font-normal">Card</th>
                <th className="text-left py-2 px-2 font-normal w-14">ATK</th>
                <th className="text-left py-2 px-2 font-normal w-14">DEF</th>
                <th className="text-right py-2 px-2 font-normal w-28">Rate</th>
              </tr>
            </thead>
            <tbody>
              {deckCards.map((row) => {
                const card = cardDb.cardsById.get(row.cardId);
                return (
                  <DuelistRow key={row.cardId}>
                    <td className="py-1.5 px-1 font-mono text-xs text-text-muted">
                      {formatCardId(row.cardId)}
                    </td>
                    <td className="py-1.5 px-1 text-text-primary">
                      <CardName cardId={row.cardId} name={card?.name ?? `#${row.cardId}`} />
                    </td>
                    <td className="py-1.5 px-2 font-mono font-bold text-stat-atk">
                      {card?.attack ?? 0}
                    </td>
                    <td className="py-1.5 px-2 font-mono text-xs text-stat-def">
                      {card?.defense ?? 0}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-xs text-gold">
                      {formatRate(row.deck)}
                    </td>
                  </DuelistRow>
                );
              })}
            </tbody>
          </DuelistTable>
        ) : (
          <EmptySection message="No cards in deck." />
        )}
      </section>
    </div>
  );
}

function DuelistTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

function DuelistRow({ children }: { children: React.ReactNode }) {
  return (
    <tr className="border-t border-border-subtle/50 transition-colors duration-150 hover:bg-bg-hover even:bg-bg-surface/30">
      {children}
    </tr>
  );
}

function EmptySection({ message }: { message: string }) {
  return (
    <div className="py-6 text-center text-text-muted text-sm border border-border-subtle rounded-lg bg-bg-surface/20">
      {message}
    </div>
  );
}

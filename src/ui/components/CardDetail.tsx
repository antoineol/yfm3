import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import type { CardSpec } from "../../engine/data/card-model.ts";
import { MODS } from "../../engine/mods.ts";
import { MAX_CARD_ID, MAX_COPIES } from "../../engine/types/constants.ts";
import { useOwnedCardTotals } from "../db/use-owned-card-totals.ts";
import { formatRate } from "../lib/format.ts";
import { useFusionTable } from "../lib/fusion-table-context.tsx";
import { useSelectedMod } from "../lib/use-selected-mod.ts";
import { GameCard } from "./GameCard.tsx";
import type { SortDir } from "./sortable-header.tsx";
import { SortableHeader } from "./sortable-header.tsx";

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
        {ownedTotals !== undefined && <OwnedBadge count={ownedTotals[card.id] ?? 0} />}
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

/* ── Dropped By Section ──────────────────────────────────────── */

interface DuelistDrop {
  duelistId: number;
  duelistName: string;
  saPow: number;
  bcd: number;
  saTec: number;
}

type DropSortKey = "saPow" | "bcd" | "saTec";
type DropSortState = { key: DropSortKey; dir: SortDir } | null;

function toggleDropSort(prev: DropSortState, key: DropSortKey): DropSortState {
  if (prev?.key !== key) return { key, dir: "desc" };
  if (prev.dir === "desc") return { key, dir: "asc" };
  return null;
}

function sortDrops(drops: DuelistDrop[], sort: DropSortState): DuelistDrop[] {
  if (!sort) return drops;
  const dir = sort.dir === "asc" ? 1 : -1;
  const getter = (d: DuelistDrop) => d[sort.key];
  return [...drops].sort((a, b) => dir * (getter(a) - getter(b)));
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

  const [sort, setSort] = useState<DropSortState>(null);
  const handleSort = useCallback(
    (key: DropSortKey) => setSort((prev) => toggleDropSort(prev, key)),
    [],
  );
  const sortedDrops = useMemo(() => sortDrops(drops, sort), [drops, sort]);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] text-text-muted uppercase tracking-wide font-bold">
        Dropped by
      </span>
      {drops.length === 0 ? (
        <p className="text-xs text-text-muted italic">No duelists drop this card.</p>
      ) : (
        <div className="rounded-lg border border-border-subtle overflow-hidden">
          <table className="w-full table-fixed text-xs">
            <thead>
              <tr className="bg-bg-surface/80 text-text-muted uppercase tracking-wider text-[10px]">
                <th className="text-left py-1.5 px-2.5 font-semibold">Duelist</th>
                <SortableHeader
                  align="text-right"
                  className="w-15"
                  dir={sort?.key === "saPow" ? sort.dir : undefined}
                  label="SA-POW"
                  onClick={() => handleSort("saPow")}
                  px="px-2"
                />
                <SortableHeader
                  align="text-right"
                  className="w-12"
                  dir={sort?.key === "bcd" ? sort.dir : undefined}
                  label="BCD"
                  onClick={() => handleSort("bcd")}
                  px="px-2"
                />
                <SortableHeader
                  align="text-right"
                  className="w-14"
                  dir={sort?.key === "saTec" ? sort.dir : undefined}
                  label="SA-TEC"
                  onClick={() => handleSort("saTec")}
                  px="px-2"
                />
              </tr>
            </thead>
            <tbody>
              {sortedDrops.map((d) => (
                <tr
                  className="border-t border-border-subtle/40 transition-colors duration-100 hover:bg-gold/4 even:bg-bg-surface/20"
                  key={d.duelistId}
                >
                  <td className="py-1.5 px-2.5 truncate">
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

/* ── Fuses To Section ───────────────────────────────────────── */

interface FusesToRow {
  otherMaterialId: number;
  otherMaterialName: string;
  resultId: number;
  resultName: string;
  resultAtk: number;
  fusionKey: number;
}

type FusesToSortKey = "resultAtk";
type FusesToSortState = { key: FusesToSortKey; dir: SortDir } | null;

function toggleFusesToSort(prev: FusesToSortState, key: FusesToSortKey): FusesToSortState {
  if (prev?.key !== key) return { key, dir: "desc" };
  if (prev.dir === "desc") return { key, dir: "asc" };
  return null;
}

function sortFusesTo(rows: FusesToRow[], sort: FusesToSortState): FusesToRow[] {
  if (!sort) return rows;
  const dir = sort.dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => dir * (a.resultAtk - b.resultAtk));
}

function FusesToSection({ cardId }: { cardId: number }) {
  const { fusions, cardDb } = useFusionTable();

  const fusesTo = useMemo(() => {
    const rows: FusesToRow[] = [];
    for (const f of fusions) {
      if (f.material1Id === cardId || f.material2Id === cardId) {
        const otherId = f.material1Id === cardId ? f.material2Id : f.material1Id;
        const otherCard = cardDb.cardsById.get(otherId);
        const resultCard = cardDb.cardsById.get(f.resultId);
        rows.push({
          otherMaterialId: otherId,
          otherMaterialName: otherCard?.name ?? `#${otherId}`,
          resultId: f.resultId,
          resultName: resultCard?.name ?? `#${f.resultId}`,
          resultAtk: f.resultAtk,
          fusionKey: f.material1Id * MAX_CARD_ID + f.material2Id,
        });
      }
    }
    rows.sort((a, b) => b.resultAtk - a.resultAtk);
    return rows;
  }, [fusions, cardDb, cardId]);

  const [sort, setSort] = useState<FusesToSortState>(null);
  const handleSort = useCallback(
    (key: FusesToSortKey) => setSort((prev) => toggleFusesToSort(prev, key)),
    [],
  );
  const sortedRows = useMemo(() => sortFusesTo(fusesTo, sort), [fusesTo, sort]);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] text-text-muted uppercase tracking-wide font-bold">
        Fuses to
      </span>
      {fusesTo.length === 0 ? (
        <p className="text-xs text-text-muted italic">This card has no fusions.</p>
      ) : (
        <div className="rounded-lg border border-border-subtle overflow-hidden">
          <table className="w-full table-fixed text-xs">
            <thead>
              <tr className="bg-bg-surface/80 text-text-muted uppercase tracking-wider text-[10px]">
                <th className="w-12 py-1.5 px-2.5 font-semibold text-left">With</th>
                <th className="text-left py-1.5 px-2.5 font-semibold">Result</th>
                <SortableHeader
                  align="text-right"
                  className="w-14"
                  dir={sort?.key === "resultAtk" ? sort.dir : undefined}
                  label="ATK"
                  onClick={() => handleSort("resultAtk")}
                  px="px-2"
                />
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((r) => (
                <tr
                  className="border-t border-border-subtle/40 transition-colors duration-100 hover:bg-gold/4 even:bg-bg-surface/20"
                  key={r.fusionKey}
                >
                  <td className="py-1.5 px-2.5 font-mono text-text-muted">
                    <a
                      className="block truncate hover:text-gold transition-colors duration-150 hover:underline decoration-gold/30 underline-offset-2"
                      href={`${window.location.pathname}#data/cards/${String(r.otherMaterialId)}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      #{String(r.otherMaterialId)}
                    </a>
                  </td>
                  <td className="py-1.5 px-2.5 text-gold">
                    <a
                      className="block truncate text-gold hover:text-gold-bright transition-colors duration-150 hover:underline decoration-gold/30 underline-offset-2"
                      href={`${window.location.pathname}#data/cards/${String(r.resultId)}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {r.resultName}
                    </a>
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold text-stat-atk whitespace-nowrap">
                    {r.resultAtk}
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

/* ── Equippable By Section (shown on monster cards) ─────────── */

interface EquippableByRow {
  equipId: number;
  equipName: string;
  bonus: number;
}

type EquippableBySortKey = "bonus";
type EquippableBySortState = { key: EquippableBySortKey; dir: SortDir } | null;

function toggleEquippableBySort(
  prev: EquippableBySortState,
  key: EquippableBySortKey,
): EquippableBySortState {
  if (prev?.key !== key) return { key, dir: "desc" };
  if (prev.dir === "desc") return { key, dir: "asc" };
  return null;
}

function sortEquippableBy(rows: EquippableByRow[], sort: EquippableBySortState): EquippableByRow[] {
  if (!sort) return rows;
  const dir = sort.dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => dir * (a.bonus - b.bonus));
}

function EquippableBySection({ cardId }: { cardId: number }) {
  const { equipCompat, cardDb } = useFusionTable();
  const modId = useSelectedMod();
  const megamorphId = MODS[modId].megamorphId;

  const rows = useMemo(() => {
    const result: EquippableByRow[] = [];
    for (let equipId = 1; equipId < MAX_CARD_ID; equipId++) {
      if (!equipCompat[equipId * MAX_CARD_ID + cardId]) continue;
      const equipCard = cardDb.cardsById.get(equipId);
      const name = equipCard?.name ?? `#${equipId}`;
      if (isDummyCard(name)) continue;
      result.push({
        equipId,
        equipName: name,
        bonus: equipId === megamorphId ? 1000 : 500,
      });
    }
    result.sort((a, b) => b.bonus - a.bonus || a.equipName.localeCompare(b.equipName));
    return result;
  }, [equipCompat, cardDb, cardId, megamorphId]);

  const [sort, setSort] = useState<EquippableBySortState>(null);
  const handleSort = useCallback(
    (key: EquippableBySortKey) => setSort((prev) => toggleEquippableBySort(prev, key)),
    [],
  );
  const sortedRows = useMemo(() => sortEquippableBy(rows, sort), [rows, sort]);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] text-text-muted uppercase tracking-wide font-bold">
        Can be equipped by
      </span>
      {rows.length === 0 ? (
        <p className="text-xs text-text-muted italic">No equip cards for this monster.</p>
      ) : (
        <div className="rounded-lg border border-border-subtle overflow-hidden">
          <table className="w-full table-fixed text-xs">
            <thead>
              <tr className="bg-bg-surface/80 text-text-muted uppercase tracking-wider text-[10px]">
                <th className="text-left py-1.5 px-2.5 font-semibold">Equip</th>
                <SortableHeader
                  align="text-right"
                  className="w-16"
                  dir={sort?.key === "bonus" ? sort.dir : undefined}
                  label="Bonus"
                  onClick={() => handleSort("bonus")}
                  px="px-2"
                />
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((r) => (
                <tr
                  className="border-t border-border-subtle/40 transition-colors duration-100 hover:bg-gold/4 even:bg-bg-surface/20"
                  key={r.equipId}
                >
                  <td className="py-1.5 px-2.5">
                    <a
                      className="block truncate text-text-primary hover:text-gold transition-colors duration-150 hover:underline decoration-gold/30 underline-offset-2"
                      href={`${window.location.pathname}#data/cards/${r.equipId}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {r.equipName}
                    </a>
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold text-stat-atk whitespace-nowrap">
                    +{r.bonus}
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

/* ── Equips To Section (shown on equip cards) ──────────────── */

interface EquipsToRow {
  monsterId: number;
  monsterName: string;
  monsterAtk: number;
}

type EquipsToSortKey = "monsterAtk";
type EquipsToSortState = { key: EquipsToSortKey; dir: SortDir } | null;

function toggleEquipsToSort(prev: EquipsToSortState, key: EquipsToSortKey): EquipsToSortState {
  if (prev?.key !== key) return { key, dir: "desc" };
  if (prev.dir === "desc") return { key, dir: "asc" };
  return null;
}

function sortEquipsTo(rows: EquipsToRow[], sort: EquipsToSortState): EquipsToRow[] {
  if (!sort) return rows;
  const dir = sort.dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => dir * (a.monsterAtk - b.monsterAtk));
}

function EquipsToSection({ cardId }: { cardId: number }) {
  const { equipCompat, cardDb } = useFusionTable();

  const totalMonsters = useMemo(
    () => cardDb.cards.filter((c) => c.isMonster && !isDummyCard(c.name)).length,
    [cardDb],
  );

  const rows = useMemo(() => {
    const result: EquipsToRow[] = [];
    for (let monsterId = 1; monsterId < MAX_CARD_ID; monsterId++) {
      if (!equipCompat[cardId * MAX_CARD_ID + monsterId]) continue;
      const monsterCard = cardDb.cardsById.get(monsterId);
      const name = monsterCard?.name ?? `#${monsterId}`;
      if (isDummyCard(name)) continue;
      result.push({
        monsterId,
        monsterName: name,
        monsterAtk: monsterCard?.attack ?? 0,
      });
    }
    result.sort((a, b) => b.monsterAtk - a.monsterAtk);
    return result;
  }, [equipCompat, cardDb, cardId]);

  const equipsAll = rows.length > 0 && rows.length >= totalMonsters;

  const [sort, setSort] = useState<EquipsToSortState>(null);
  const handleSort = useCallback(
    (key: EquipsToSortKey) => setSort((prev) => toggleEquipsToSort(prev, key)),
    [],
  );
  const sortedRows = useMemo(() => sortEquipsTo(rows, sort), [rows, sort]);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] text-text-muted uppercase tracking-wide font-bold">
        Can equip
      </span>
      {rows.length === 0 ? (
        <p className="text-xs text-text-muted italic">No monsters can use this equip.</p>
      ) : equipsAll ? (
        <div className="rounded-lg border border-gold-dim/60 bg-gradient-to-r from-gold-dim/10 via-gold/8 to-gold-dim/10 px-3 py-2.5">
          <span className="text-sm font-bold text-gold">All monsters</span>
          <span className="text-xs text-text-muted ml-2">({totalMonsters} cards)</span>
        </div>
      ) : (
        <div className="rounded-lg border border-border-subtle overflow-hidden">
          <table className="w-full table-fixed text-xs">
            <thead>
              <tr className="bg-bg-surface/80 text-text-muted uppercase tracking-wider text-[10px]">
                <th className="text-left py-1.5 px-2.5 font-semibold">Monster</th>
                <SortableHeader
                  align="text-right"
                  className="w-14"
                  dir={sort?.key === "monsterAtk" ? sort.dir : undefined}
                  label="ATK"
                  onClick={() => handleSort("monsterAtk")}
                  px="px-2"
                />
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((r) => (
                <tr
                  className="border-t border-border-subtle/40 transition-colors duration-100 hover:bg-gold/4 even:bg-bg-surface/20"
                  key={r.monsterId}
                >
                  <td className="py-1.5 px-2.5">
                    <a
                      className="block truncate text-text-primary hover:text-gold transition-colors duration-150 hover:underline decoration-gold/30 underline-offset-2"
                      href={`${window.location.pathname}#data/cards/${r.monsterId}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {r.monsterName}
                    </a>
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold text-stat-atk whitespace-nowrap">
                    {r.monsterAtk}
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

function OwnedBadge({ count }: { count: number }) {
  const needMore = count < MAX_COPIES;
  return (
    <DetailSection label="Owned">
      <span
        className={`text-base font-mono font-bold ${needMore ? "text-text-need owned-need" : "text-text-muted"}`}
      >
        {count}
        <span className="text-text-muted font-normal text-xs"> / {MAX_COPIES}</span>
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

/** Placeholder cards in some mods have numeric-only names (e.g. "177"). */
const NUMERIC_NAME_RE = /^\d+$/;
function isDummyCard(name: string): boolean {
  return NUMERIC_NAME_RE.test(name);
}

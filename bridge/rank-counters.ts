import type { OffsetProfile } from "./offset-profiles.ts";

/**
 * Read the 10 rank scoring counters from RAM.
 *
 * The game stores duel stats in two groups:
 * - 6 contiguous u8 at rankStatsBase: [turns, effAttacks, defWins, faceDown, pureMagic, traps]
 * - fusionCounter (u8), equipCounter (u8): separate addresses at rankStatsBase+7/+8 in NTSC
 * - rankCardsUsed (u8), rankLp (u16): in the rank/result block
 *
 * Returns them in the engine's RankFactors order:
 * [turns, effAttacks, defWins, faceDown, fusions, equips, pureMagic, traps, remainingCards, remainingLp]
 */
export function readLiveRankCounters(
  view: DataView,
  profile: OffsetProfile,
  duelPhase: number | null,
): Array<number | null> {
  const counters = readRankCounters(view, profile);
  counters[8] = readRemainingCards(view, profile, isActiveDuelPhase(duelPhase));
  return counters;
}

export function readRankCounters(view: DataView, profile: OffsetProfile): Array<number | null> {
  const base = readU8Array(view, profile.rankStatsBase, 6); // turns, effAtk, defWin, faceDown, pureMagic, traps
  const fusions = readU8(view, profile.fusionCounter);
  const equips = profile.equipCounter > 0 ? readU8(view, profile.equipCounter) : null;
  const remainingCards = readRemainingCards(view, profile, false);
  const lp = readU16(view, profile.rankLp);

  return [
    base[0] ?? 0, // turns
    base[1] ?? 0, // effectiveAttacks
    base[2] ?? 0, // defensiveWins
    base[3] ?? 0, // faceDownPlays
    fusions, // fusionsInitiated
    equips, // equipMagicUsed
    base[4] ?? 0, // pureMagicUsed
    base[5] ?? 0, // trapsTriggered
    remainingCards,
    lp, // remainingLp
  ];
}

function readRemainingCards(
  view: DataView,
  profile: OffsetProfile,
  preferLiveDealCounter: boolean,
): number | null {
  const rankCardsUsed = readValidCardsUsed(view, profile.rankCardsUsed);
  const liveCardsDealt = readValidCardsUsed(view, profile.cardsDealt);
  const cardsUsed = preferLiveDealCounter
    ? (liveCardsDealt ?? rankCardsUsed)
    : (rankCardsUsed ?? liveCardsDealt);
  return cardsUsed == null ? null : 40 - cardsUsed;
}

function isActiveDuelPhase(duelPhase: number | null): boolean {
  return duelPhase != null && duelPhase >= 0x01 && duelPhase <= 0x0a;
}

function readValidCardsUsed(view: DataView, offset: number): number | null {
  if (offset <= 0) return null;
  const value = readU8(view, offset);
  return value >= 0 && value <= 40 ? value : null;
}

function readU8(view: DataView, offset: number): number {
  if (offset < 0 || offset >= view.byteLength) return 0;
  return view.getUint8(offset);
}

function readU16(view: DataView, offset: number): number {
  if (offset < 0 || offset + 1 >= view.byteLength) return 0;
  return view.getUint16(offset, true);
}

function readU8Array(view: DataView, offset: number, length: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < length; i++) {
    result.push(readU8(view, offset + i));
  }
  return result;
}

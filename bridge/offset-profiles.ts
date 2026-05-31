export interface OffsetProfile {
  label: string;
  duelPhase: number;
  turnIndicator: number;
  sceneId: number;
  terrain: number;
  duelistId: number;
  lpP1: number;
  lpP2: number;
  /** LP address consumed by the rank routine/result counters. */
  rankLp: number;
  /** Fusion-initiation counter used by the rank "Fusions" row. */
  fusionCounter: number;
  /** Cards-used counter consumed by the rank routine (u8). */
  rankCardsUsed: number;
  /** Absolute address of total-cards-dealt counter (u8). */
  cardsDealt: number;
  /** Absolute address of hand slot index array (u8[5], 0xFF = card left hand). */
  handSlots: number;
  /**
   * Rank counter base: 6 contiguous u8 counters starting here.
   * [turns, effAttacks, defWins, faceDown, pureMagic, traps]
   */
  rankStatsBase: number;
  /** Counter consumed by the rank routine's second special-play row, 0 when unmapped. */
  equipCounter: number;
  /** Selected card id under the in-game duel cursor (u16), 0 when unmapped. */
  duelCursorTargetCard: number;
  /** Active player field cursor focus signal (u8), 0 when unmapped or no active field card. */
  duelCursorFieldSlot: number;
}

/** Default profile: NTSC-U (SLUS-01411) -- also used by RP mod. */
export const DEFAULT_PROFILE: OffsetProfile = {
  label: "NTSC-U",
  duelPhase: 0x09b23a,
  turnIndicator: 0x09b1d5,
  sceneId: 0x09b26c,
  terrain: 0x09b364,
  duelistId: 0x09b361,
  lpP1: 0x0ea004,
  lpP2: 0x0ea024,
  rankLp: 0x0ea004,
  fusionCounter: 0x0e9ff8, // rankStatsBase+0x07: initiated fusions
  rankCardsUsed: 0x0ea008, // rankStatsBase+0x17
  cardsDealt: 0x0ea008, // lpP1+0x04 (NTSC-U has 2 LP copies before dealt)
  handSlots: 0x0ea00a, // lpP1+0x06
  rankStatsBase: 0x0e9ff1, // lpP1-0x13: [turns, effAtk, defWin, faceDown, pureMagic, traps]
  equipCounter: 0x0e9ff9, // rankStatsBase+0x08: scored by FUN_80021598 row 9
  duelCursorTargetCard: 0x09b338,
  duelCursorFieldSlot: 0x09b34e,
};

/**
 * PAL profile: SLES-039.47 / SLES-039.48 (EU multi-language, including French).
 *
 * PAL relative offsets differ from NTSC-U. Live SLES_039.48 result-screen
 * evidence maps the player result/rank block at 0x0EB279.
 */
export const PAL_PROFILE: OffsetProfile = {
  label: "PAL",
  duelPhase: 0x09c564,
  turnIndicator: 0x09c504,
  sceneId: 0x09c4c2,
  terrain: 0x09c6f9,
  duelistId: 0x09c6f3,
  lpP1: 0x0eb28a,
  lpP2: 0x0eb2aa,
  rankLp: 0x0eb28a,
  fusionCounter: 0x0eb280, // rankStatsBase+0x07: initiated fusions
  rankCardsUsed: 0x0eb296,
  cardsDealt: 0x0eb290, // lpP1+0x06 (PAL has 3 LP copies before dealt)
  handSlots: 0x0eb292, // lpP1+0x08
  rankStatsBase: 0x0eb279,
  equipCounter: 0x0eb281,
  duelCursorTargetCard: 0x09c6b8,
  duelCursorFieldSlot: 0x09c6d1,
};

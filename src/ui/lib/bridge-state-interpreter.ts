/** Duel phase labels derived from raw bridge data. */
export type DuelPhase =
  | "hand"
  | "draw"
  | "fusion"
  | "field"
  | "battle"
  | "opponent"
  | "ended"
  | "other";

export type DuelStats = {
  fusions: number;
  terrain: number;
  duelistId: number;
  /** Raw rank counter bytes from RAM (10 values matching scoring table order), null if unavailable. */
  rankCounters: number[] | null;
};

/** A monster on the field with its live (equip-boosted) ATK/DEF from RAM. */
export type FieldCard = { cardId: number; atk: number; def: number };

// ── Raw bridge message types ─────────────────────────────────────────

export type RawCardSlot = { cardId: number; atk: number; def: number; status: number };

export type RawBridgeState = {
  connected: true;
  status?: "ready";
  version?: string;
  pid: number;
  modFingerprint?: string;
  gameSerial?: string;
  // Version-dependent fields — null when the game binary is unrecognized
  // (e.g. PAL version without a known offset profile).
  sceneId: number | null;
  duelPhase: number | null;
  turnIndicator: number | null;
  lp: [number, number] | null;
  fusions: number | null;
  terrain: number | null;
  duelistId: number | null;
  /** Raw rank counter bytes from RAM (10 values in scoring table order). */
  rankCounters?: number[] | null;
  /** Hand slot indices (u8[5]): deal index or 0xFF = card left hand. Null if profile unavailable. */
  handSlots: number[] | null;
  // Universal fields — always available.
  hand: RawCardSlot[];
  field: RawCardSlot[];
  /** Player's shuffled deck during a duel (40 card IDs, 0 = empty). */
  shuffledDeck: number[];
  trunk: number[];
  deckDefinition: number[];
  // Opponent data (same card slot struct as player)
  opponentHand: RawCardSlot[];
  opponentField: RawCardSlot[];
  opponentHandSlots: number[] | null;
  cpuShuffledDeck: number[];
  /** Free-duel duelist unlock bitfield (raw bytes from 0x1D06F4). */
  duelistUnlock?: number[];
};

// ── Duel phase bytes ─────────────────────────────────────────────────

const PHASE_INIT = 0x01;
const PHASE_CLEANUP = 0x02;
const PHASE_DRAW = 0x03;
const PHASE_HAND_SELECT = 0x04;
const PHASE_FIELD = 0x05;
const PHASE_FUSION = 0x07;
const PHASE_FUSION_RESOLVE = 0x08;
const PHASE_BATTLE = 0x09;
const PHASE_POST_BATTLE = 0x0a;
const PHASE_DUEL_END = 0x0c;
const PHASE_RESULTS = 0x0d;

const DUELIST_MASTER_K_ID = 39;
const NUM_DUELISTS = 39;

// ── Interpretation logic (pure, testable) ────────────────────────────

type InterpretedState = {
  hand: number[];
  field: FieldCard[];
  handReliable: boolean;
  phase: DuelPhase;
  /** Phase mapped from raw bytes during opponent's turn (for opponent zone toggle). */
  opponentPhase: DuelPhase;
  inDuel: boolean;
  lp: [number, number] | null;
  stats: DuelStats | null;
  opponentHand: number[];
  opponentField: FieldCard[];
};

/**
 * Interpret raw bridge state into game-meaningful values.
 * Pure function — all game logic lives here, not in the bridge.
 *
 * When the bridge has a resolved offset profile (NTSC-U, RP), duelPhase
 * and related fields are numbers → exact phase detection.
 *
 * When the profile is unknown (PAL, etc.), those fields are null →
 * duel state is inferred from hand/field card presence.
 */
export function interpretRawState(raw: RawBridgeState): InterpretedState {
  const hand = raw.handSlots
    ? filterHandBySlots(raw.hand, raw.handSlots)
    : filterCardSlots(raw.hand);
  const field = filterFieldSlots(raw.field);
  const stats: DuelStats | null =
    raw.fusions != null
      ? {
          fusions: raw.fusions,
          terrain: raw.terrain ?? 0,
          duelistId: raw.duelistId ?? 0,
          rankCounters: Array.isArray(raw.rankCounters) ? raw.rankCounters : null,
        }
      : null;

  // Opponent data — same filtering logic as player (gracefully handle missing data from older bridges)
  const opponentHand = raw.opponentHand
    ? raw.opponentHandSlots
      ? filterHandBySlots(raw.opponentHand, raw.opponentHandSlots)
      : filterCardSlots(raw.opponentHand)
    : [];
  const opponentField = raw.opponentField ? filterFieldSlots(raw.opponentField) : [];

  // ── Exact detection: duel phase byte is available ──────────────────
  if (raw.duelPhase != null) {
    const isPlayerTurn = raw.turnIndicator === 0;
    const phase = mapDuelPhase(raw.duelPhase, isPlayerTurn);
    const opponentPhase = isPlayerTurn ? ("field" as DuelPhase) : mapRawPhase(raw.duelPhase);
    // With handSlots-based filtering the hand data is deterministic at all
    // phases and turns — no flickering from status-byte transitions.
    // The player's hand doesn't change during the opponent's turn either.
    const handReliable = true;

    // A recognized duel phase means we are in a duel, even if cards have not
    // been dealt yet (e.g. first DRAW).  The game always progresses through
    // DUEL_END / RESULTS at end-of-duel, which are excluded here, so
    // isDuelPhase reliably goes false when the duel ends.
    const inDuel =
      raw.duelPhase === PHASE_INIT ||
      raw.duelPhase === PHASE_CLEANUP ||
      raw.duelPhase === PHASE_DRAW ||
      raw.duelPhase === PHASE_HAND_SELECT ||
      raw.duelPhase === PHASE_FIELD ||
      raw.duelPhase === PHASE_FUSION ||
      raw.duelPhase === PHASE_FUSION_RESOLVE ||
      raw.duelPhase === PHASE_BATTLE ||
      raw.duelPhase === PHASE_POST_BATTLE;

    return {
      hand,
      field,
      handReliable,
      phase,
      opponentPhase,
      inDuel,
      lp: raw.lp,
      stats,
      opponentHand,
      opponentField,
    };
  }

  // ── Fallback: no duel phase — infer from hand/field presence ───────
  // Used when the game binary is unrecognized (e.g. PAL).
  // Hand/field RAM addresses are universal across all versions.
  if (hand.length > 0 || field.length > 0) {
    const fallbackPhase: DuelPhase =
      hand.length >= 5 ? "hand" : field.length > 0 ? "field" : "draw";
    return {
      hand,
      field,
      handReliable: hand.length >= 5,
      phase: fallbackPhase,
      opponentPhase: "other",
      inDuel: true,
      lp: raw.lp,
      stats,
      opponentHand,
      opponentField,
    };
  }

  return {
    hand,
    field,
    handReliable: false,
    phase: "other",
    opponentPhase: "other",
    inDuel: false,
    lp: raw.lp,
    stats,
    opponentHand,
    opponentField,
  };
}

/**
 * Merge trunk (spare copies) + deck definition into total owned per card.
 * trunk[i] = spare copies of card (i+1), deckDef = array of 40 card IDs.
 */
export function computeOwnedCards(trunk: number[], deckDef: number[]): Record<number, number> {
  const owned: Record<number, number> = {};
  for (const [i, count] of trunk.entries()) {
    if (count > 0) owned[i + 1] = count;
  }
  for (const cardId of deckDef) {
    if (cardId > 0) owned[cardId] = (owned[cardId] ?? 0) + 1;
  }
  return owned;
}

/**
 * Decode duelist unlock bitfield (MSB-first within each byte).
 * Bit position = duelist ID. Duel Master K (39) is always unlocked.
 */
export function decodeDuelistUnlock(bytes: number[]): number[] {
  const unlocked: number[] = [];
  for (let id = 1; id <= NUM_DUELISTS; id++) {
    if (id === DUELIST_MASTER_K_ID) {
      unlocked.push(id);
      continue;
    }
    const byteIdx = Math.floor(id / 8);
    const bitIdx = 7 - (id % 8); // MSB-first
    const byteVal = bytes[byteIdx] ?? 0;
    if ((byteVal & (1 << bitIdx)) !== 0) unlocked.push(id);
  }
  return unlocked;
}

// ── Private helpers ──────────────────────────────────────────────────

/**
 * Filter hand cards using the hand slot index array from RAM.
 * A slot with a non-0xFF value means the card is present in hand.
 * This is deterministic — no flickering during animations.
 */
function filterHandBySlots(slots: RawCardSlot[], handSlots: number[]): number[] {
  const result: number[] = [];
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    if (!s) continue;
    if (handSlots[i] !== 0xff && s.cardId > 0 && s.cardId < 723) {
      result.push(s.cardId);
    }
  }
  return result;
}

/** A card occupies a slot if it has a valid ID and non-zero status. */
function isActiveSlot(s: RawCardSlot): boolean {
  // Any non-zero status means the card is in an active state.
  // During battle the game temporarily clears the STATUS_PRESENT (0x80)
  // bit on the attacker while keeping other bits (e.g. 0x04 = face-up).
  // Truly empty slots always have status === 0x00.
  return s.cardId > 0 && s.cardId < 723 && s.status !== 0;
}

/**
 * Fallback hand filter when handSlots is unavailable (unknown game binary).
 * Uses the status byte, which can flicker during animations.
 * Bit 0x10 is set when a card is being played from hand to field —
 * the card briefly exists in both zones during the animation.
 * Excluding it prevents double-counting (hand=5 + field=1).
 */
function filterCardSlots(slots: RawCardSlot[]): number[] {
  const result: number[] = [];
  for (const s of slots) {
    if (isActiveSlot(s) && (s.status & 0x10) === 0) result.push(s.cardId);
  }
  return result;
}

function filterFieldSlots(slots: RawCardSlot[]): FieldCard[] {
  const result: FieldCard[] = [];
  for (const s of slots) {
    if (isActiveSlot(s)) result.push({ cardId: s.cardId, atk: s.atk, def: s.def });
  }
  return result;
}

/** Map raw phase byte to DuelPhase, ignoring whose turn it is. */
function mapRawPhase(duelPhase: number): DuelPhase {
  if (duelPhase === PHASE_DUEL_END || duelPhase === PHASE_RESULTS) return "ended";
  if (duelPhase === PHASE_INIT) return "draw";
  if (duelPhase === PHASE_HAND_SELECT) return "hand";
  if (duelPhase === PHASE_DRAW || duelPhase === PHASE_CLEANUP) return "draw";
  if (duelPhase === PHASE_FUSION || duelPhase === PHASE_FUSION_RESOLVE) return "fusion";
  if (duelPhase === PHASE_FIELD) return "field";
  if (duelPhase === PHASE_BATTLE) return "battle";
  return "other";
}

function mapDuelPhase(duelPhase: number, isPlayerTurn: boolean): DuelPhase {
  if (duelPhase === PHASE_DUEL_END || duelPhase === PHASE_RESULTS) return "ended";
  if (duelPhase === PHASE_INIT) return "draw"; // pre-deal setup, cards not yet dealt
  if (!isPlayerTurn) return "opponent";
  if (duelPhase === PHASE_HAND_SELECT) return "hand";
  if (duelPhase === PHASE_DRAW || duelPhase === PHASE_CLEANUP) return "draw";
  if (duelPhase === PHASE_FUSION || duelPhase === PHASE_FUSION_RESOLVE) return "fusion";
  if (duelPhase === PHASE_FIELD) return "field";
  if (duelPhase === PHASE_BATTLE) return "battle";
  return "other";
}

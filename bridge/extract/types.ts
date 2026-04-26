// ---------------------------------------------------------------------------
// Shared types for disc data extraction
// ---------------------------------------------------------------------------

export const NUM_CARDS = 722;
export const NUM_DUELISTS = 39;

// Fusion table
export const FUSION_TABLE_SIZE = 0x1_0000;

// Duelist entry layout within WA_MRG
export const DUELIST_ENTRY_SIZE = 0x1800;
export const DUELIST_DECK_OFFSET = 0x000;
export const DUELIST_SA_POW_OFFSET = 0x5b4;
export const DUELIST_BCD_OFFSET = 0xb68;
export const DUELIST_SA_TEC_OFFSET = 0x111c;

export interface ExeLayout {
  cardStats: number;
  levelAttr: number;
  nameOffsetTable: number;
  textPoolBase: number;
  descOffsetTable: number;
  descTextPoolBase: number;
  duelistNames: number;
  typeNamesTable: number;
  gsNamesTable: number;
}

export interface EquipBonusConfig {
  /** ATK bonus for standard equip cards. */
  equipBonus: number;
  /** Card ID of Megamorph (or equivalent). */
  megamorphId: number;
  /** ATK bonus for the Megamorph card. */
  megamorphBonus: number;
}

export interface WaMrgLayout {
  fusionTable: number;
  equipTable: number;
  starchipTable: number;
  duelistTable: number;
  /** Artwork block size per card.  US/RP = 0x3800, PAL = 0x4000. */
  artworkBlockSize: number;
}

export interface CardStats {
  id: number;
  name: string;
  atk: number;
  def: number;
  gs1: string;
  gs2: string;
  type: string;
  color: string;
  level: number;
  attribute: string;
  description: string;
  starchipCost: number;
  password: string;
}

export interface Fusion {
  material1: number;
  material2: number;
  result: number;
}

export interface EquipEntry {
  equipId: number;
  monsterIds: number[];
}

export interface DuelistData {
  id: number;
  name: string;
  deck: number[];
  saPow: number[];
  bcd: number[];
  saTec: number[];
}

export type RankFactorKey =
  | "turns"
  | "effectiveAttacks"
  | "defensiveWins"
  | "faceDownPlays"
  | "fusionsInitiated"
  | "equipMagicUsed"
  | "pureMagicUsed"
  | "trapsTriggered"
  | "remainingCards"
  | "remainingLp";

export interface RankScoringFactor {
  name: string;
  key: RankFactorKey;
  thresholds: number[];
  points: number[];
}

export interface RankScoringData {
  source: "bin-majority";
  tableCount: number;
  selectedCount: number;
  variantCount: number;
  factors: RankScoringFactor[];
}

export interface IsoFile {
  name: string;
  sector: number;
  size: number;
  isDir: boolean;
}

/** Text data extracted from a WA_MRG text block (one language). */
export interface WaMrgTextBlock {
  /** Offset where the card description header marker begins. */
  descBlockStart: number;
  /** Offset where the first card name string begins. */
  nameBlockStart: number;
}

/** PS-X EXE header fields needed for data detection. */
export interface PsxExeHeader {
  /** RAM address where the executable is loaded (typically 0x80010000). */
  loadAddr: number;
  /** Size of the code+data payload (everything after the 0x800-byte header). */
  textSize: number;
}

interface CardText {
  name: string;
  color: string;
}

interface Starchip {
  cost: number;
  password: string;
}

// Re-export internal-use types that extraction modules share
export type { CardText, Starchip };

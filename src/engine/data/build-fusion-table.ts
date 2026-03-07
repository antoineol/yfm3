import { MAX_CARD_ID } from "../types/constants.ts";
import type { AttackValue, CardId, CardSpec, FusionMaterials } from "./card-model.ts";
import { isValidCardKind } from "./parser-utils.ts";

/**
 * Build the flat fusion lookup table with 3-pass priority resolution.
 *
 * Stores result card IDs: fusionTable[a * 722 + b] = resultCardId (or FUSION_NONE).
 *
 * Priority tiers (higher tier never overwrites lower):
 *   Pass 1 — name+name:  absolute priority, highest ATK wins among ties
 *   Pass 2 — name+kind:  only writes to unset slots, lowest ATK wins among ties
 *   Pass 3 — kind+kind:  only writes to unset slots, lowest ATK wins among ties
 *
 * Strict improvement: only writes if resultATK > cardAtk[a] AND resultATK > cardAtk[b].
 * Symmetry: always writes both [a*722+b] and [b*722+a].
 */
export function buildFusionTable(
  cards: CardSpec[],
  fusions: FusionMaterials[],
  fusionTable: Int16Array,
  cardAtk: Int16Array,
): void {
  const { nameToIds, kindToIds, colorKindToIds } = buildLookupMaps(cards);
  const nameToId = buildNameToIdMap(cards);
  const tiers = classifyFusions(fusions, nameToId, cardAtk, nameToIds, kindToIds, colorKindToIds);

  // Tier tracking: 0 = unset, 1/2/3 = which pass wrote it
  const written = new Uint8Array(MAX_CARD_ID * MAX_CARD_ID);

  // Pass 1: name-name — keep highest ATK among ties
  for (const entry of tiers[0]) {
    applyEntry(entry, fusionTable, cardAtk, written, 1, true);
  }
  // Pass 2: name-kind — only unset slots, keep lowest ATK among ties
  for (const entry of tiers[1]) {
    applyEntry(entry, fusionTable, cardAtk, written, 2, false);
  }
  // Pass 3: kind-kind — only unset slots, keep lowest ATK among ties
  for (const entry of tiers[2]) {
    applyEntry(entry, fusionTable, cardAtk, written, 3, false);
  }
}

// --- Tier classification ---

const PART_KIND = 1;
const PART_NAME = 0;

function classifyPart(part: string): number {
  if (/^\[\w+\]\w+$/.test(part)) return PART_KIND;
  if (isValidCardKind(part)) return PART_KIND;
  return PART_NAME;
}

interface TieredEntry {
  leftIds: CardId[];
  rightIds: CardId[];
  resultId: CardId;
  resultAtk: AttackValue;
}

function classifyFusions(
  fusions: FusionMaterials[],
  nameToId: Map<string, CardId>,
  cardAtk: Int16Array,
  nameToIds: Map<string, CardId[]>,
  kindToIds: Map<string, CardId[]>,
  colorKindToIds: Map<string, CardId[]>,
): [TieredEntry[], TieredEntry[], TieredEntry[]] {
  const tiers: [TieredEntry[], TieredEntry[], TieredEntry[]] = [[], [], []];

  for (const fusion of fusions) {
    const resultId = nameToId.get(fusion.name);
    if (resultId === undefined) {
      console.warn(`Fusion ${fusion.name} not found in database`);
      continue;
    }
    // Use cardAtk as canonical source (consistent with what consumers see)
    const resultAtk = cardAtk[resultId] ?? 0;
    if (resultAtk <= 0) continue;

    for (const materialKey of fusion.materials) {
      const sep = materialKey.indexOf(":");
      if (sep === -1) {
        console.warn(`Malformed material key "${materialKey}" for fusion ${fusion.name}`);
        continue;
      }

      const left = materialKey.slice(0, sep);
      const right = materialKey.slice(sep + 1);
      const leftIds = resolveKeyPart(left, nameToIds, kindToIds, colorKindToIds);
      const rightIds = resolveKeyPart(right, nameToIds, kindToIds, colorKindToIds);

      if (leftIds.length === 0) {
        console.warn(`Material "${left}" resolved to no cards for fusion ${fusion.name}`);
      }
      if (rightIds.length === 0) {
        console.warn(`Material "${right}" resolved to no cards for fusion ${fusion.name}`);
      }

      const lc = classifyPart(left);
      const rc = classifyPart(right);
      const tier =
        lc === PART_NAME && rc === PART_NAME ? 0 : lc === PART_NAME || rc === PART_NAME ? 1 : 2;

      tiers[tier].push({ leftIds, rightIds, resultId, resultAtk });
    }
  }

  return tiers;
}

// --- Entry application ---

function applyEntry(
  entry: TieredEntry,
  fusionTable: Int16Array,
  cardAtk: Int16Array,
  written: Uint8Array,
  tier: number,
  keepHighest: boolean,
): void {
  const { leftIds, rightIds, resultId, resultAtk } = entry;

  for (const a of leftIds) {
    if (a >= MAX_CARD_ID) continue;
    const atkA = cardAtk[a] ?? 0;
    if (resultAtk <= atkA) continue;

    for (const b of rightIds) {
      if (b >= MAX_CARD_ID || a === b) continue;
      const atkB = cardAtk[b] ?? 0;
      if (resultAtk <= atkB) continue;

      writeSlot(
        a * MAX_CARD_ID + b,
        resultId,
        resultAtk,
        fusionTable,
        cardAtk,
        written,
        tier,
        keepHighest,
      );
      writeSlot(
        b * MAX_CARD_ID + a,
        resultId,
        resultAtk,
        fusionTable,
        cardAtk,
        written,
        tier,
        keepHighest,
      );
    }
  }
}

function writeSlot(
  idx: number,
  resultId: CardId,
  resultAtk: AttackValue,
  fusionTable: Int16Array,
  cardAtk: Int16Array,
  written: Uint8Array,
  tier: number,
  keepHighest: boolean,
): void {
  const currentTier = written[idx] ?? 0;

  if (currentTier === 0) {
    // Unset — write it
    fusionTable[idx] = resultId;
    written[idx] = tier;
  } else if (currentTier === tier) {
    // Same tier — apply tiebreaker
    const existingAtk = cardAtk[fusionTable[idx] ?? 0] ?? 0;
    if (keepHighest ? resultAtk > existingAtk : resultAtk < existingAtk) {
      fusionTable[idx] = resultId;
    }
  }
  // Higher-priority tier already wrote — skip
}

// --- Lookup map construction ---

function buildNameToIdMap(cards: CardSpec[]): Map<string, CardId> {
  const map = new Map<string, CardId>();
  for (const card of cards) {
    map.set(card.name, card.id);
  }
  return map;
}

function buildLookupMaps(cards: CardSpec[]) {
  const nameToIds = new Map<string, CardId[]>();
  const kindToIds = new Map<string, CardId[]>();
  const colorKindToIds = new Map<string, CardId[]>();

  for (const card of cards) {
    const nameIds = nameToIds.get(card.name);
    if (nameIds) {
      nameIds.push(card.id);
    } else {
      nameToIds.set(card.name, [card.id]);
    }

    for (const kind of card.kinds) {
      const kindIds = kindToIds.get(kind);
      if (kindIds) {
        kindIds.push(card.id);
      } else {
        kindToIds.set(kind, [card.id]);
      }

      if (card.color) {
        const colorKindKey = `[${card.color}]${kind}`;
        const ckIds = colorKindToIds.get(colorKindKey);
        if (ckIds) {
          ckIds.push(card.id);
        } else {
          colorKindToIds.set(colorKindKey, [card.id]);
        }
      }
    }
  }

  return { nameToIds, kindToIds, colorKindToIds };
}

/**
 * Resolve a single part of a material pair key to a set of card IDs.
 *
 * Key part formats:
 * - "[blue]Reptile" → color-qualified kind, matches only blue Reptile cards
 * - "Dragon" (valid kind) → matches all cards with that kind
 * - "Kuriboh" (not a kind) → matches by card name
 */
function resolveKeyPart(
  part: string,
  nameToIds: Map<string, CardId[]>,
  kindToIds: Map<string, CardId[]>,
  colorKindToIds: Map<string, CardId[]>,
): CardId[] {
  const colorMatch = /^\[(\w+)\](\w+)$/.exec(part);
  if (colorMatch) {
    const key = `[${colorMatch[1]}]${colorMatch[2]}`;
    return colorKindToIds.get(key) ?? [];
  }

  if (isValidCardKind(part)) {
    return kindToIds.get(part) ?? [];
  }

  return nameToIds.get(part) ?? [];
}

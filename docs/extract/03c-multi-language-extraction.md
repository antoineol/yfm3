# Plan: Multi-Language Text Extraction

## Status: DONE

## Goal

Extract card names, descriptions, and duelist names in all 5 PAL languages (EN, FR, DE, IT, ES). Currently `extractAllCsvs` hardcodes `waMrgTextBlocks[0]` (English only).

## Open issues from 03b

Three problems discovered during TBL analysis that this step must fix:

1. **FR/ES name blocks have garbage prefix entries.** `extractCardTexts` reads 722 names starting at `textBlock.nameBlockStart`, but FR block 1 has 1 junk entry and ES block 4 has 2 junk entries before the real card names. Reading from offset 0 gives shifted/garbled names for those languages.

2. **Byte 0x3f decodes differently per language.** `extractWaMrgStrings` uses the single `PAL_CHAR_TABLE` for all blocks. Byte 0x3f = `œ` in FR (Bœuf, Sœurs — 9 uses) but `á` in ES (Máquina — 44 uses). Decoding ES with the current table produces wrong characters.

3. **Byte 0x2f is unmapped.** Appears once in ES card "Kuwagata {2f}" (likely `α`). Single occurrence, low confidence.

## Implementation

### Step 1: Per-language name block offsets

Add a constant mapping language block index → number of garbage entries to skip:

```ts
const WAMRG_NAME_OFFSETS = [0, 1, 0, 0, 2]; // EN, FR, DE, IT, ES
```

In `extractCardTexts`, `extractCardDescriptions`, and `extractDuelistNames`, when reading from `waMrgTextBlocks[langIdx]`, pass `textBlock.nameBlockStart + skipCount` where `skipCount` is the number of garbage 0xFF-terminated entries to walk past (not a byte count — need to scan past N terminators).

Concretely, add a helper:

```ts
function skipWaMrgEntries(buf: Buffer, offset: number, count: number): number {
  let pos = offset;
  for (let i = 0; i < count; i++) {
    const end = buf.indexOf(0xff, pos);
    if (end === -1) break;
    pos = end + 1;
  }
  return pos;
}
```

Then in `extractCardTexts` PAL fallback (line ~1283):

```ts
const nameOffset = WAMRG_NAME_OFFSETS[langIdx] ?? 0;
const start = skipWaMrgEntries(waMrg, textBlock.nameBlockStart, nameOffset);
const names = extractWaMrgStrings(waMrg, start, WAMRG_NAME_CARD_COUNT);
```

Same pattern for duelist names (the garbage entries also shift the duelist name indices).

### Step 2: Per-language TBL override for 0x3f

Add an ES-specific override to `extractWaMrgStrings`. Simplest approach — accept an optional override map:

```ts
const ES_TBL_OVERRIDES: Record<number, string> = { 0x3f: "á" };

function extractWaMrgStrings(
  buf: Buffer, offset: number, count: number,
  tblOverrides?: Record<number, string>,
): string[] {
  // ... existing loop ...
  // Change the decode line from:
  //   result += PAL_CHAR_TABLE[b] ?? `{...}`;
  // To:
  //   result += tblOverrides?.[b] ?? PAL_CHAR_TABLE[b] ?? `{...}`;
}
```

Pass `ES_TBL_OVERRIDES` when decoding block 4.

### Step 3: Add language parameter to extraction

Change the three PAL fallback functions (`extractCardTexts`, `extractCardDescriptions`, `extractDuelistNames`) to accept a `langIdx` parameter (default 0) instead of hardcoding `waMrgTextBlocks[0]`.

Update `extractAllCsvs` signature:

```ts
export function extractAllCsvs(
  slus: Buffer, waMrg: Buffer, langIdx = 0,
): Record<string, string>
```

### Step 4: Per-language CSV output

In the CLI main function, after extracting the default (EN) CSVs, loop over blocks 1–4 and write `cards_fr.csv`, `cards_de.csv`, `cards_it.csv`, `cards_es.csv`. Only card names and descriptions change — stats, fusions, equips are shared, so only the cards CSV needs per-language variants.

### Step 5: Map 0x2f → α

Add `[0x2f, "α"]` to `PAL_CHAR_TABLE`. Single occurrence in "Kuwagata α" — name confirmed across all language versions of the game.

## Validation

- Decode cards 1–10 from each language and spot-check against known translations (see 03b's language block table).
- `bun verify:vanilla` must still pass (EN extraction unchanged).
- FR "Bœuf" must show `œ`, ES "Máquina" must show `á` (the 0x3f conflict resolved per-language).

## Files

- `scripts/extract-game-data.ts` — all changes above

# Plan: Multi-Language Text Extraction

## Status: PENDING

## Depends On

- 03b (complete PAL TBL) — need full character table to decode non-English text correctly

## Goal

Expose all 5 PAL language translations (EN, FR, DE, IT, ES) for i18n support. Currently `extractAllCsvs` only uses block 0 (English).

## Implementation

1. **Add language parameter to `extractAllCsvs`.** Default to block 0 (English). Accept optional language index or code (e.g., `"fr"` → block 1).

2. **Per-language CSV output.** In the main script, optionally generate `cards_fr.csv`, `cards_de.csv`, etc. alongside the default `cards.csv`. Only card names and descriptions differ; stats/fusions/equips are shared.

3. **App integration.** The app's `loadGameData` could accept a language parameter and load the appropriate CSV. The card database UI could show translations.

## Scope

This is a nice-to-have for app internationalization. Defer until the app actually needs multilingual card display.

## Files

- `scripts/extract-game-data.ts` — language param, per-language CSV generation
- `src/engine/data/load-game-data.ts` — optional language loading

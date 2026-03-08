# Phase 8.1: Configuration UI Including Deck Size (DONE)

## Goal

Replace per-parameter threading with a global config module so configuration values (starting with `deckSize`) are accessible from any engine layer without explicit parameter passing.

## What was done

1. **Global config module** (`src/engine/config.ts`): `EngineConfig` interface with `getConfig()`, `setConfig()`, `resetConfig()`. Entry points apply config from options; internal functions read from config; workers receive config via messages and apply it locally.

2. **Removed deckSize parameter threading** from `createBuffers()`, `initializeBuffers()`, `initializeBuffersBrowser()`, `generateInitialDecks()`. All now read from `getConfig().deckSize`.

3. **Worker messages** carry full `config: EngineConfig` instead of individual `deckSize` field. Workers call `setConfig(config)` before buffer initialization.

4. **Convex storage**: Added `deckSize` field to `userPreferences` table schema + `updatePreferences` mutation. Preferences load on mount and persist on change.

5. **UI**: New `ConfigPanel` component above the 3-column layout. Shows default values (40) on first load. Deck size input moved out of `CollectionPanel`.

## Adding a new config option (e.g. fusionDepth)

1. Add field to `EngineConfig` in `src/engine/config.ts` (with default)
2. Add field to `userPreferences` schema + `updatePreferences` args
3. Add UI control in `ConfigPanel`
4. Update engine code to read from `getConfig()` instead of hardcoded value

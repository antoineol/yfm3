# Phase 9: Configurable Fusion Depth (DONE)

Previously, the fusion chain depth was hardcoded to 3 fusions (4 materials consumed). Now it's configurable via the same `EngineConfig` system used for deck size.

## What changed

- **Constants:** `DEFAULT_FUSION_DEPTH = 3`, `MAX_FUSION_DEPTH = 4` in `src/engine/types/constants.ts`
- **Config:** `fusionDepth: number` added to `EngineConfig` in `src/engine/config.ts`
- **FusionScorer:** reads `getConfig().fusionDepth`, stack buffer sized for `MAX_FUSION_DEPTH`
- **Reference scorer:** accepts optional `maxDepth` parameter
- **Entry points:** `optimizeDeck()` and `optimizeDeckParallel()` accept `fusionDepth` option, validate range 1–4
- **Convex:** `fusionDepth` field in `userPreferences` table, `updatePreferences` mutation
- **UI:** `useFusionDepth()` hook, `useUpdateFusionDepth()` hook, fusion depth input in `ConfigPanel`
- **Tests:** configurable depth tests (depth 1, 2, 3, 4) in `fusion-scorer.integration.test.ts`

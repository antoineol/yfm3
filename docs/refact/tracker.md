# Refactoring Tracker

## Scoring

Priority = (LOC / 150) x max(importers, 1) x change_freq_bucket

- change_freq_bucket: 3 = 5+ commits in 3 months, 2 = 2-4, 1 = 1, 0.5 = 0

## Targets

| # | File | LOC | Importers | Freq | Priority | Status |
|---|------|-----|-----------|------|----------|--------|
| 1 | ui/lib/use-emulator-bridge.ts | 824 | 11 | 3 | 181 | not started |
| 2 | ui/components/CardTable.tsx | 402 | 11 | 3 | 88 | not started |
| 3 | ui/components/CardDetail.tsx | 689 | 4 | 3 | 55 | not started |
| 4 | engine/worker/messages.ts | 167 | 15 | 3 | 50 | not started |
| 5 | ui/features/hand/FusionResultsList.tsx | 438 | 2 | 3 | 18 | not started |
| 6 | engine/farm/discover-farmable-fusions.ts | 372 | 3 | 2 | 15 | not started |
| 7 | ui/features/hand/use-post-duel-suggestion.ts | 352 | 2 | 3 | 14 | not started |
| 8 | ui/features/auth/Header.tsx | 319 | 2 | 3 | 13 | not started |
| 9 | engine/fusion-chain-finder.ts | 318 | 2 | 3 | 13 | not started |
| 10 | ui/components/CardAutocomplete.tsx | 195 | 3 | 3 | 12 | not started |
| 11 | ui/features/collection/use-last-added-card-hint.ts | 184 | 3 | 3 | 11 | not started |
| 12 | engine/ranking/rank-scoring.ts | 389 | 2 | 2 | 10 | not started |
| 13 | ui/components/GameCard.tsx | 167 | 4 | 2 | 9 | not started |
| 14 | ui/features/bridge/setup-steps.tsx | 329 | 2 | 2 | 9 | not started |
| 15 | ui/lib/load-reference-csvs.ts | 213 | 2 | 3 | 9 | not started |
| 16 | engine/optimizer/sa-optimizer.ts | 208 | 2 | 3 | 8 | not started |
| 17 | ui/features/data/DuelistsPanel.tsx | 391 | 1 | 3 | 8 | not started |
| 18 | ui/features/deck/ScoreExplanation.tsx | 191 | 2 | 3 | 8 | not started |
| 19 | ui/features/hand/HandFusionCalculator.tsx | 366 | 1 | 3 | 7 | not started |
| 20 | engine/orchestrator.ts | 312 | 1 | 3 | 6 | not started |
| 21 | ui/features/result/ResultPanel.tsx | 304 | 1 | 3 | 6 | not started |
| 22 | ui/features/collection/collection-state.ts | 209 | 2 | 2 | 6 | not started |
| 23 | ui/features/farm/FarmPanel.tsx | 382 | 1 | 2 | 5 | not started |
| 24 | ui/features/hand/PostDuelSuggestion.tsx | 215 | 1 | 3 | 4 | not started |
| 25 | ui/features/hand/RankTracker.tsx | 276 | 1 | 2 | 4 | not started |
| 26 | ui/features/bridge/BridgeSetupGuide.tsx | 155 | 1 | 3 | 3 | not started |
| 27 | ui/features/farm/use-farm-discovery.ts | 165 | 1 | 2 | 2 | not started |

## Completed

| File | Date | Before LOC | After LOC | New files | Notes |
|------|------|------------|-----------|-----------|-------|

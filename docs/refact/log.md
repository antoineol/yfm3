# Refactoring Log

One line per iteration. Format: `YYYY-MM-DD | file(s) | what was done (< 80 chars)`

Archive entries older than 100 lines to `log-archive.md`.

---

2026-04-03 | use-emulator-bridge.ts | split 824-line god file into 3 SRP modules
2026-04-04 | use-post-duel-suggestion.ts | split 352-line god hook into 3 SRP hooks
2026-04-04 | CardDetail.tsx + sortable-header.tsx | split 689-line god file, generic sort utils, 4x dedup
2026-04-04 | CardDetail + sections + modal | move from components/ to features/data/ (ownership)

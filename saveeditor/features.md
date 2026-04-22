# Save editor — scope notes

The feature ships in two surfaces:

- **UI:** auto-sync-only, integrated into the main app as **Deck → Edit**
  (`src/ui/features/saves/`). Lists memcards DuckStation has written, opens
  one for editing, writes it back in place with a timestamped backup.
  Card names come from the bridge's per-BIN game-data extraction — never
  from the legacy CSVs under `public/data/*`.
- **CLI:** `bun saveeditor/cli.ts` — unchanged semantics, operates on raw
  `.mcd`/`.mcr` files by path. Uses a vanilla card dictionary
  (`saveeditor/vanilla-cards.ts`) for human-readable `dump` output; CLI is
  the *only* surface that touches the vanilla dictionary.

## Shipped

- Game listing via `GET /api/saves` — enumerates memcards in DuckStation's
  memcard directory, matches each to a discovered BIN by embedded game code.
- Per-save card data via `GET /api/saves/:id/gamedata` — extracted from the
  matched BIN on demand, cached in-memory by `(binPath, mtime)`.
- In-place save + automatic backup via `PUT /api/saves/:id/bytes`; timestamp
  filenames (`backup_YYYYMMDD-HHMMSS-mmm.mcd`), keep newest 50, older pruned
  on each write.
- Backup listing + restore via `GET /api/saves/:id/backups` and
  `POST /api/saves/:id/backups/:filename/restore`. Restore itself creates a
  pre-restore backup so it's undoable.
- UI: game picker, editor with starchips / unique-cards / total-copies
  summary, searchable ledger with owned/missing filter, +/− steppers,
  grant-all, revert, save-to-disk with toast confirmation, backups panel.
- Mod badge: green pill when the fingerprint matches `MODS`; red "Unknown
  mod" pill otherwise. Card names stay accurate either way (always sourced
  from the BIN).

## Out of scope for this iteration

- **Slot 2 memcards.** Only slot-1 `.mcd` files are enumerated. Slot 2 is
  rare for FM and the memcard-discovery path currently returns at most one
  entry per matched game.
- **`.gme`/`.psv`/`.srm` import.** Only raw DuckStation `.mcd`s are handled.
- **Multi-block memcards** hosting more than one game. We assume the memcard
  file is a single-game save (DuckStation per-game mode's normal output).
- **DuckStation "game is running" lockout.** If DuckStation has the memcard
  open it may flush on suspend and overwrite our edit. We don't detect or
  warn about this today.
- **Manual mode.** The Edit sub-tab shows an "Auto-sync required" empty
  state when auto-sync is off. There's no manual-file-picker fallback; by
  design, the save editor is auto-sync-only.
- **Alpha-mod `MODS` entry.** Alpha-mod saves will show "Unknown mod" in the
  badge until someone adds its fingerprint to `src/engine/mods.ts`. Card
  names are still correct because they come from the BIN.
- **Keyboard shortcuts** (e.g. `/` focus search, arrow-key row navigation).
- **Virtualization** of the 720-row ledger — renders fine on modern hardware.
- **Deck desktop layout restructure.** The original 4-column `collection / deck
  / result / farm` layout is untouched. Edit renders full-width on all
  breakpoints. A broader restructure — sub-tabs on desktop, similar to the
  Data tab — remains a separate change.

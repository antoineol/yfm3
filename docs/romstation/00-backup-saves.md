# Romstation Support — Step 0: Backup DuckStation Saves

## Goal

Before installing Romstation and testing a fresh setup, back up all DuckStation save data so nothing is lost. This ensures you can always restore your current game progress.

## What to back up

DuckStation stores save data in its data directory. Locate it first:
- New versions: `Documents\DuckStation\`
- Older versions: `%LOCALAPPDATA%\DuckStation\`

### 1. Memory cards (game saves)

- **Path:** `<DuckStation data dir>\memcards\`
- **Files:** `*.mcd` (typically `shared_card_1.mcd`, `shared_card_2.mcd`, or game-specific cards)
- **What it is:** PS1 virtual memory card data — your in-game save files live here (deck, collection, campaign progress, etc.)

### 2. Save states

- **Path:** `<DuckStation data dir>\savestates\`
- **Files:** `*.sav` or numbered files per game (e.g., `SLUS-01411_1.sav`)
- **What it is:** Emulator snapshots — exact point-in-time state of the game (F1/F2/F3 saves)

### 3. Settings (optional but useful)

- **Path:** `<DuckStation data dir>\settings.ini`
- **What it is:** All DuckStation config including controller mappings, display settings, `ExportSharedMemory`, game directories. Useful to diff against Romstation's config later.

## Steps

1. **Find your DuckStation data directory.** Open DuckStation → Settings → look at the window title or check `About`. Or check both paths listed above and see which exists.

2. **Copy the entire data directory** to a safe backup location:
   ```
   xcopy /E /I "Documents\DuckStation" "D:\Backup\DuckStation-backup"
   ```
   Or just copy the `memcards\` and `savestates\` folders if you only care about saves.

3. **Verify the backup.** Check that the backup contains `.mcd` files in `memcards\` and save state files in `savestates\`.

4. **Record paths here** for reference during later steps.

## Findings

**DuckStation data directory:**
<!-- e.g., C:\Users\<you>\Documents\DuckStation -->

**Backup location:**
<!-- e.g., D:\Backup\DuckStation-backup-2026-03-29 -->

**Memory card files found:**
<!-- e.g., shared_card_1.mcd (128 KB), shared_card_2.mcd (128 KB) -->

**Save state files found:**
<!-- e.g., SLUS-01411_1.sav through _5.sav -->

## Restoring later

If anything goes wrong during Romstation testing, copy the backed-up `memcards\` and `savestates\` folders back into your DuckStation data directory (standalone or Romstation-managed) and restart the emulator.

Note: DuckStation memory card format is standard PS1 — it works across emulators. If Romstation's DuckStation uses a different data directory, just copy the `.mcd` files into its `memcards\` folder.

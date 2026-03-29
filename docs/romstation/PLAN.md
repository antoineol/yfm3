# Romstation Support

Romstation is a game launcher/frontend (not an emulator). For PS1 games it spawns **DuckStation** as a child process. The existing bridge should work with minimal changes.

## Steps

0. **[Backup saves](00-backup-saves.md)** — Back up DuckStation memory cards, save states, and settings before touching anything. Ensures zero risk of data loss when switching to a fresh Romstation install.

1. **[Investigation](01-investigation.md)** — Install Romstation, launch YGO FM, and record how its DuckStation differs from standalone (process name, settings.ini path, shared memory, game dirs, restart). Fill in the "Findings" section directly in that file.

2. **[Implementation](02-implementation.md)** — Adapt bridge + UI based on investigation findings. Every task is conditional on what step 1 discovered. Read the findings first.

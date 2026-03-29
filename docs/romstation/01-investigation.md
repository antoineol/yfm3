# Romstation Support — Step 1: Investigation

## Background

Romstation is a game launcher/frontend (not an emulator). For PS1 games, it downloads and spawns **DuckStation** as a child process. The existing bridge connects to DuckStation via Windows shared memory (`duckstation_{pid}`), so it should work with Romstation-managed DuckStation — but we need to verify.

**Prerequisite:** Romstation installed on Windows with YGO Forbidden Memories available.

## What to investigate

For each item, record the finding directly in this file (in the "Findings" section below) so the next session can pick up step 2 without re-investigating.

### 1. Process name

Run `tasklist /FI "IMAGENAME eq duckstation*" /FO CSV` while the game is running via Romstation.

- Does a `duckstation*` process appear?
- If not, what is the actual process name? (`tasklist /V` or Process Explorer)
- **Why it matters:** `bridge/memory.ts:478–494` uses this exact filter in `findDuckStationPids()`.

### 2. Shared memory

With the game running via Romstation, run the existing bridge (`bun bridge/serve.ts`).

- Does the bridge connect and read hand cards?
- If not, does it find the PID but fail on shared memory? Or does it not find the PID at all?
- **Why it matters:** If this works out of the box, the core integration needs zero changes.

### 3. Settings.ini location

Find where Romstation puts DuckStation's config. Check these paths:

- `%PROGRAMFILES%\RomStation\emulators\<duckstation-folder>\settings.ini`
- `%PROGRAMFILES%\RomStation\emulators\<duckstation-folder>\portable.txt` (if this file exists, DuckStation runs in portable mode and settings.ini is next to the exe)
- `Documents\DuckStation\settings.ini` (same as standalone — possible if Romstation doesn't use portable mode)
- `%LOCALAPPDATA%\DuckStation\settings.ini`

Record:
- The exact path where settings.ini lives.
- Whether `[Hacks] ExportSharedMemory = true` is already present.
- Whether `portable.txt` exists next to the DuckStation exe.
- **Why it matters:** `bridge/settings.ts:83–111` auto-patches this file. If the path isn't found, the bridge can't enable shared memory automatically.

### 4. Game directory / ROM path

Check how Romstation launches DuckStation:

- Open Task Manager → DuckStation process → right-click → "command line" (or use `wmic process where "name like 'duckstation%'" get CommandLine`).
- Does Romstation pass the ROM path as a CLI argument? (e.g., `duckstation.exe "C:\...\game.bin"`)
- Check `[GameList] RecursivePaths` in the Romstation-managed settings.ini — is it populated?
- Where does Romstation store ROMs? (likely `%PROGRAMFILES%\RomStation\games\` or a user-chosen folder)
- **Why it matters:** `bridge/game-data.ts:151–170` reads game directories from settings.ini to find the .bin disc image (needed for fusion/equip table extraction). If Romstation passes the ROM via CLI instead of configuring gamelist, this path won't work.

### 5. Restart behavior

From the bridge UI, trigger "Restart DuckStation" (or call `restartDuckStation()` directly).

- Does DuckStation restart successfully?
- Does Romstation notice the kill and react (e.g., show its own UI, re-launch DuckStation, show an error)?
- After restart, does the bridge reconnect?
- **Why it matters:** `bridge/serve.ts:552–614` kills the process and relaunches the exe. If Romstation interferes, we may need to disable this feature for Romstation users.

## Findings

> Fill in each section below during investigation. Use exact values — the implementation step depends on these.

### 1. Process name
<!-- e.g., "duckstation-qt-x64-ReleaseLTCG.exe — matches existing filter" or "romstation-emu.exe — does NOT match" -->

**Result:**

### 2. Shared memory
<!-- e.g., "Bridge connected on first try, hand detection works" or "PID found but shared memory unavailable" -->

**Result:**

### 3. Settings.ini location
<!-- e.g., "C:\Program Files\RomStation\emulators\duckstation-latest\settings.ini, portable mode (portable.txt present)" -->

**Result:**

**ExportSharedMemory present?**

**portable.txt present?**

### 4. Game directory / ROM path
<!-- e.g., "CLI: duckstation.exe C:\...\game.cue — ROM passed as arg, gamelist not configured" -->

**Result:**

**Command line:**

**RecursivePaths in settings.ini:**

**ROM storage location:**

### 5. Restart behavior
<!-- e.g., "DuckStation restarted fine, Romstation didn't interfere" or "Romstation showed error dialog after kill" -->

**Result:**

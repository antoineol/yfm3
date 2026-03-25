## Auto-enable DuckStation shared memory export — IMPLEMENTED

DuckStation's "Export Shared Memory" option (Settings > Advanced) must be enabled for the bridge to read PS1 RAM. The bridge now auto-patches this setting on startup.

### How it works

DuckStation stores settings in `Documents\DuckStation\settings.ini` (new versions, resolved via `FOLDERID_Documents`) or `%LOCALAPPDATA%\DuckStation\settings.ini` (older versions). The setting is:

```ini
[Hacks]
ExportSharedMemory = true
```

### Implementation

- **`bridge/settings.mjs`** — `patchSettingsIni()` (pure INI patching), `findSettingsPath()` (resolves Documents path via PowerShell), `ensureSharedMemoryEnabled()` (file I/O wrapper)
- **`bridge/serve.mjs`** — calls `ensureSharedMemoryEnabled()` on startup, sends `settingsPatched` flag in WebSocket `no_shared_memory` status
- **`src/ui/lib/use-emulator-bridge.ts`** — parses `settingsPatched` from WebSocket, exposes on `EmulatorBridge`
- **`src/ui/features/bridge/BridgeSetupGuide.tsx`** — step 4 shows "restart DuckStation" when auto-patched
- **`tests/bridge/settings.test.ts`** — tests for `patchSettingsIni`

### Edge cases handled

- settings.ini doesn't exist (DuckStation not installed or portable mode) — skipped with warning
- `[Hacks]` section doesn't exist yet — appended
- File is read-only — error logged, manual instructions shown
- CRLF vs LF line endings — preserved
- Documents folder redirected (e.g. OneDrive) — resolved via `[Environment]::GetFolderPath('MyDocuments')`

### Migration note

The `settingsPatched` notification is currently WebSocket-based. When the bridge migrates to Convex HTTP POST (see `docs/mobile/plan.md`), this notification needs to move to a Convex POST so it can be displayed on any device.

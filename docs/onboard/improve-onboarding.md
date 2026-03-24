Remastered Perfected download: https://mega.nz/file/SwQwVb5a#1EdeL_Sb8mwvlRodT3sJ3loRjT1kjRfHcvP6eHH3sLo

## Auto-enable DuckStation shared memory export

DuckStation's "Export Shared Memory" option (Settings > Advanced) must be enabled for the bridge to read PS1 RAM. Currently the user has to enable it manually.

### How it works

DuckStation stores settings in `%APPDATA%\DuckStation\settings.ini` (Windows). The setting is:

```ini
[Hacks]
ExportSharedMemory = true
```

### Approach: check-and-patch on bridge startup

On startup, before attempting to open shared memory, the bridge:

1. Locates `%APPDATA%\DuckStation\settings.ini`
2. Parses the INI file
3. If `ExportSharedMemory` is missing or `false` under `[Hacks]`, sets it to `true` and writes the file back
4. If patched, notifies the user via WebSocket status (or Convex, post-migration): "Enabled shared memory export in DuckStation settings — please restart DuckStation for the change to take effect."
5. If already enabled, does nothing

DuckStation must be restarted after the setting is changed for it to take effect.

### Implementation notes

- On implementation, update `docs/mobile/plan.md`: add the "need to restart DuckStation" notification to the list of things that need to be moved to Convex (so that it can be displayed on any device and the bridge can drop WebSocket entirely).
- Handle edge cases: settings.ini doesn't exist (DuckStation not installed or portable mode), `[Hacks]` section doesn't exist yet (append it), file is read-only.
- The bridge already runs on Windows with filesystem access, so no extra permissions needed.

# Bridge Restart Resilience

Status: DONE

## Problem

Bridge live reloads made the app fall back to onboarding while the WebSocket
was briefly disconnected. A measured local restart on May 31, 2026 showed:

- server bound quickly after the previous bridge shut down;
- DuckStation PID discovery took about 3.3s on the cold run;
- cached game data acquisition added about 0.43s;
- the app's 3s reconnect interval could add another full wait before it saw
  the ready bridge again.

A follow-up restart exposed a cache miss that forced full extraction for about
16.2s. The source disc was unchanged; the cache had stored a fractional
`mtimeMs`, while Windows Bun later reported the same timestamp rounded to the
nearest millisecond.

A later live reload left the app on "Game loaded — reading game data" even
though duel RAM was readable. The bridge had broadcast a one-time game-data
ambiguity before the browser reconnected, then the new client only received the
ready RAM state. The ambiguity itself was caused by scanning bridge-managed
`.yfm3-iso-backups` folders as possible active discs.

An opened PAL French BIN load then showed a 26.6s full extraction. The cache
miss path was reading the 548 MB BIN twice: once to pull ISO9660 files and once
to scan rank tables.

## Change

- Keep the last ready bridge snapshot during a short reconnect grace window so
  the active app view stays mounted through bridge live reloads.
- Retry the bridge WebSocket every 500ms instead of every 3s.
- If the bridge stays down past the grace window, return to the setup guide.
- Accept sub-millisecond `mtimeMs` drift when validating game-data cache entries
  so Windows timestamp rounding does not force a full disc extraction.
- Exclude bridge backup folders from DuckStation game-directory scans, so ISO
  backups cannot become active-disc candidates.
- Replay the last game-data success or error to new WebSocket clients, and let
  the UI request a refresh when it is ready but still missing game data.
- Read extracted ISO9660 files through positioned file-descriptor reads, and
  stream the raw-BIN rank-table scan instead of materializing the whole disc
  image in memory.

## Next

- If bridge boot still feels slow after the UI no longer blanks, investigate a
  native PID discovery path to avoid shelling out to `tasklist` on cold starts.
- If cache-miss game-data load is still above target on Windows, profile
  Defender/NTFS read latency around the remaining WA_MRG read and rank-table
  stream.
- If a real user library still has several byte-identical playable ISOs in
  DuckStation scan paths, surface a direct chooser instead of requiring file
  moves.

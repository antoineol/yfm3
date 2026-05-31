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

## Change

- Keep the last ready bridge snapshot during a short reconnect grace window so
  the active app view stays mounted through bridge live reloads.
- Retry the bridge WebSocket every 500ms instead of every 3s.
- If the bridge stays down past the grace window, return to the setup guide.
- Accept sub-millisecond `mtimeMs` drift when validating game-data cache entries
  so Windows timestamp rounding does not force a full disc extraction.

## Next

- If bridge boot still feels slow after the UI no longer blanks, investigate a
  native PID discovery path to avoid shelling out to `tasklist` on cold starts.

# Decomp/Recomp Verification Log

Short factual log only. Do not use this as a planning scratchpad.

- Initialized loop at `select_target_disc`.
- Selected US target `SLUS_014.11`; disc SHA-256 `19e659b0c6f63eca661e0129b38bcb6f83d6458dbab905c119f02bb15d689181`; executable SHA-256 `e5a19297b87f2bdb59e35335a7c8ce2cc1119f906fbb11f7f8829b61a4fb27d4`.
- Extracted boot executable to `decomp/artifacts/original/SLUS_014.11.exe`.
- Verified raw executable re-emission as byte-identical plumbing.
- Verified initial executable boundary map `decomp/maps/SLUS_014.11.json`.
- Verified byte-replay seed unit `decomp/units/SLUS_014.11/entrypoint-init-v0.json` through manifest rebuild.
- Correction: previous manual emulator checks of rebuilt discs did not add evidence because those full-disc artifacts were byte-identical to the original target disc.
- Removed stale Windows-side manual-test `.bin` copies from the old byte-identical loop.
- Current checkpoint is serialized in `decomp/STATE.json`.

- 2026-06-28T20:25:07.047Z: Verified source-generated unit decomp/units/SLUS_014.11/entrypoint-init-source-v0.json; no manual test requested.

- 2026-06-28T20:31:45.474Z: Advanced to linked executable probe after source-generation verification.

- 2026-06-28T20:31:45.573Z: Verified linked executable unit decomp/linked-units/SLUS_014.11/entrypoint-init-linked-v0.json; no manual test requested.

- 2026-06-28T20:34:07.680Z: Advanced to linked bootstrap window after linked executable probe.

- 2026-06-28T20:34:07.778Z: Verified linked bootstrap window decomp/linked-units/SLUS_014.11/entrypoint-bootstrap-linked-v0.json; no manual test requested.

- 2026-06-28T20:36:11.675Z: Advanced to first function boundary probe after linked bootstrap verification.

- 2026-06-28T20:36:11.760Z: Verified first function boundary runtime_init_once in decomp/maps/SLUS_014.11.json; no manual test requested.

- 2026-06-28T21:01:50.954Z: Built behavioral boot probe decomp/manual-tests/SLUS_014.11/bootstrap-nop-variant-v0.json; manual boot/load test required at /mnt/c/jeux/ps1/Yu-gi-oh! Forbidden Memories/Vanilla USA rebuilt/Yu-Gi-Oh! Forbidden Memories (USA).cue.

- 2026-06-28T21:44:07.453Z: Manual behavioral boot/load probe passed.

- 2026-06-28T21:47:07.993Z: Verified linked runtime_init_once unit decomp/linked-units/SLUS_014.11/runtime-init-once-linked-v0.json; next checkpoint is behavioral runtime-init probe.

- 2026-06-28T21:47:17.802Z: Built runtime_init_once behavioral probe decomp/manual-tests/SLUS_014.11/runtime-init-once-nop-variant-v0.json; manual boot/load test required at /mnt/c/jeux/ps1/Yu-gi-oh! Forbidden Memories/Vanilla USA rebuilt/Yu-Gi-Oh! Forbidden Memories (USA).cue.

- 2026-06-28T22:27:29.587Z: Manual runtime_init_once behavioral boot/load probe passed.

- 2026-06-28T22:33:53.175Z: Built runtime_init_once TTY probe decomp/manual-tests/SLUS_014.11/runtime-init-once-tty-log-v0.json; manual boot/load/log test required at /mnt/c/jeux/ps1/Yu-gi-oh! Forbidden Memories/Vanilla USA rebuilt/Yu-Gi-Oh! Forbidden Memories (USA).cue.

- 2026-06-28T22:42:44.412Z: Manual runtime_init_once TTY boot/load/log probe passed.

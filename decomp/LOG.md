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

- 2026-06-29T09:01:15.267Z: Verified linked runtime_init_always unit decomp/linked-units/SLUS_014.11/runtime-init-always-linked-v0.json; next checkpoint is linked assembly rebuild manifest.

- 2026-06-29T09:01:15.518Z: Verified linked assembly rebuild manifest decomp/manifests/SLUS_014.11.linked-asm-v0.json; next checkpoint is main boot function boundary mapping.

- 2026-06-29T09:02:35.429Z: Verified main_boot function boundary in decomp/maps/SLUS_014.11.json; no manual test requested.

- 2026-06-29T09:04:13.957Z: Verified linked main_boot unit decomp/linked-units/SLUS_014.11/main-boot-linked-v0.json and refreshed linked assembly manifest decomp/manifests/SLUS_014.11.linked-asm-v0.json.

- 2026-06-29T09:08:35.713Z: Verified post-main_boot helper boundaries in decomp/maps/SLUS_014.11.json; no manual test requested.

- 2026-06-29T09:08:36.120Z: Verified linked post-main_boot helpers decomp/linked-units/SLUS_014.11/post-main-boot-helpers-linked-v0.json and refreshed linked assembly manifest decomp/manifests/SLUS_014.11.linked-asm-v0.json.

- 2026-06-29T09:10:30.239Z: Verified boot_status_renderer boundary in decomp/maps/SLUS_014.11.json; no manual test requested.

- 2026-06-29T09:10:30.708Z: Verified linked boot_status_renderer decomp/linked-units/SLUS_014.11/boot-status-renderer-linked-v0.json and refreshed linked assembly manifest decomp/manifests/SLUS_014.11.linked-asm-v0.json.

- 2026-06-29T09:33:27.576Z: Built boot_status_renderer behavioral probe decomp/manual-tests/SLUS_014.11/boot-status-renderer-nop-variant-v0.json; manual boot/load test required at /mnt/c/jeux/ps1/Yu-gi-oh! Forbidden Memories/Vanilla USA rebuilt/Yu-Gi-Oh! Forbidden Memories (USA).cue.

- 2026-06-29T09:44:41.056Z: Manual boot_status_renderer behavioral boot/load probe passed.

- 2026-07-02T09:31:27.470Z: Verified boot_frame_dispatch boundary in decomp/maps/SLUS_014.11.json; no manual test requested.

- 2026-07-02T09:31:31.966Z: Verified linked boot_frame_dispatch decomp/linked-units/SLUS_014.11/boot-frame-dispatch-linked-v0.json and refreshed linked assembly manifest decomp/manifests/SLUS_014.11.linked-asm-v0.json.

- 2026-07-02T09:34:06.884Z: Verified boot_status_state_init boundary in decomp/maps/SLUS_014.11.json; no manual test requested.

- 2026-07-02T09:34:10.940Z: Verified linked boot_status_state_init decomp/linked-units/SLUS_014.11/boot-status-state-init-linked-v0.json and refreshed linked assembly manifest decomp/manifests/SLUS_014.11.linked-asm-v0.json.

- 2026-07-02T09:37:40.426Z: Verified boot_input_position_loop and boot_callback_slots_clear boundaries in decomp/maps/SLUS_014.11.json; no manual test requested.

- 2026-07-02T09:37:46.586Z: Verified linked boot input helpers decomp/linked-units/SLUS_014.11/boot-input-helpers-linked-v0.json and refreshed linked assembly manifest decomp/manifests/SLUS_014.11.linked-asm-v0.json.

- 2026-07-02T09:42:04.196Z: Verified boot transform helper boundaries in decomp/maps/SLUS_014.11.json; no manual test requested.

- 2026-07-02T09:42:08.631Z: Verified linked boot transform helpers decomp/linked-units/SLUS_014.11/boot-transform-helpers-linked-v0.json and refreshed linked assembly manifest decomp/manifests/SLUS_014.11.linked-asm-v0.json.

- 2026-07-02T09:42:53.793Z: Verified linked boot transform helpers decomp/linked-units/SLUS_014.11/boot-transform-helpers-linked-v0.json and refreshed linked assembly manifest decomp/manifests/SLUS_014.11.linked-asm-v0.json.

- 2026-07-02T09:42:53.793Z: Correction: the earlier boot_status_renderer semantic no-op probe is legacy evidence only; future manual gates must describe a meaningful binary/runtime change and must not be created from equivalent instruction re-encodings alone.

- 2026-07-02T10:30:34.698Z: Verified boot_gfx_init boundary in decomp/maps/SLUS_014.11.json; no manual test requested.

- 2026-07-02T10:30:40.422Z: Verified linked boot_gfx_init decomp/linked-units/SLUS_014.11/boot-gfx-init-linked-v0.json and refreshed linked assembly manifest decomp/manifests/SLUS_014.11.linked-asm-v0.json.

- 2026-07-02T10:31:04.137Z: Built boot_gfx_init TTY probe decomp/manual-tests/SLUS_014.11/boot-gfx-init-tty-log-v0.json; manual boot/load/log test required at /mnt/c/jeux/ps1/Yu-gi-oh! Forbidden Memories/Vanilla USA rebuilt/Yu-Gi-Oh! Forbidden Memories (USA).cue.

- 2026-07-02T11:32:41.020Z: Manual boot_gfx_init TTY boot/load/log probe passed.

- 2026-07-02T19:56:20+08:00: Built boot_gfx_state_reset TTY checkpoint probe decomp/manual-tests/SLUS_014.11/boot-gfx-helpers-tty-log-v0.json; manual boot/load/log test required at /mnt/c/jeux/ps1/Yu-gi-oh! Forbidden Memories/Vanilla USA rebuilt/Yu-Gi-Oh! Forbidden Memories (USA).cue.

- 2026-07-02T21:47:08+08:00: Manual boot_gfx_state_reset TTY checkpoint passed; DuckStation log contained fresh MDEC_out_sync output after the rebuilt disc boot/load test.

- 2026-07-02T11:50:24.332Z: Verified boot graphics helper boundaries 0x800137e4..0x80015078 in decomp/maps/SLUS_014.11.json; no manual test requested.

- 2026-07-02T11:50:32.635Z: Verified linked boot graphics helpers decomp/linked-units/SLUS_014.11/boot-gfx-helpers-linked-v0.json and refreshed linked assembly manifest decomp/manifests/SLUS_014.11.linked-asm-v0.json.

- 2026-07-02T11:50:37.624Z: Verified boot fade/palette helper boundaries 0x80015078..0x80015d18 in decomp/maps/SLUS_014.11.json; no manual test requested.

- 2026-07-02T11:50:38.660Z: Verified linked boot fade/palette helpers decomp/linked-units/SLUS_014.11/boot-fade-helpers-linked-v0.json and refreshed linked assembly manifest decomp/manifests/SLUS_014.11.linked-asm-v0.json.

- 2026-07-02T13:50:43.462Z: Verified boot GTE helper boundaries 0x80015d18..0x80016784 in decomp/maps/SLUS_014.11.json; no manual test requested.

- 2026-07-02T13:50:44.607Z: Verified linked boot GTE helpers decomp/linked-units/SLUS_014.11/boot-gte-helpers-linked-v0.json and refreshed linked assembly manifest decomp/manifests/SLUS_014.11.linked-asm-v0.json.

- 2026-07-02T13:50:44.715Z: Verified boot object-render helper boundaries 0x80016784..0x8001755c in decomp/maps/SLUS_014.11.json; no manual test requested.

- 2026-07-02T13:50:45.882Z: Verified linked boot object-render helpers decomp/linked-units/SLUS_014.11/boot-object-render-helpers-linked-v0.json and refreshed linked assembly manifest decomp/manifests/SLUS_014.11.linked-asm-v0.json.

- 2026-07-02T13:58:04.113Z: Verified boot scene-animation helper boundaries 0x8001755c..0x80017db4 in decomp/maps/SLUS_014.11.json; no manual test requested.

- 2026-07-02T13:58:05.394Z: Verified linked boot scene-animation helpers decomp/linked-units/SLUS_014.11/boot-scene-animation-helpers-linked-v0.json and refreshed linked assembly manifest decomp/manifests/SLUS_014.11.linked-asm-v0.json.

- 2026-07-02T14:02:17.537Z: Verified boot object-runtime helper boundaries 0x80017db4..0x80018db4 in decomp/maps/SLUS_014.11.json; no manual test requested.

- 2026-07-02T14:02:19.072Z: Verified linked boot object-runtime helpers decomp/linked-units/SLUS_014.11/boot-object-runtime-helpers-linked-v0.json and refreshed linked assembly manifest decomp/manifests/SLUS_014.11.linked-asm-v0.json.

- 2026-07-02T14:05:07.383Z: Verified boot scene-runtime helper boundaries 0x80018db4..0x8001944c in decomp/maps/SLUS_014.11.json; no manual test requested.

- 2026-07-02T14:05:08.516Z: Verified linked boot scene-runtime helpers decomp/linked-units/SLUS_014.11/boot-scene-runtime-helpers-linked-v0.json and refreshed linked assembly manifest decomp/manifests/SLUS_014.11.linked-asm-v0.json.

- 2026-07-02T14:26:58.256Z: Verified boot scene wait/duel-runtime helper boundaries 0x8001944c..0x800208d4 in decomp/maps/SLUS_014.11.json; no manual test requested.

- 2026-07-02T14:27:04.720Z: Verified linked boot scene wait/duel-runtime helpers decomp/linked-units/SLUS_014.11/boot-scene-wait-helpers-linked-v0.json and refreshed linked assembly manifest decomp/manifests/SLUS_014.11.linked-asm-v0.json.

- 2026-07-02T14:30:39.105Z: Verified boot scene late-runtime helper boundaries 0x800208d4..0x80023fbc in decomp/maps/SLUS_014.11.json; no manual test requested.

- 2026-07-02T14:30:44.803Z: Verified linked boot scene late-runtime helpers decomp/linked-units/SLUS_014.11/boot-scene-late-runtime-helpers-linked-v0.json and refreshed linked assembly manifest decomp/manifests/SLUS_014.11.linked-asm-v0.json.

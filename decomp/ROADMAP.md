# Decomp/Recomp State Machine

This is a convergence guard, not a backlog. A phase exists only if it adds evidence toward
rebuilding the original executable from repo-controlled sources.

## Direction Check

Every loop step must report its evidence class:

- `byte_identical_plumbing`: extraction/re-emission/reinsertion that hashes exactly like the
  original. Useful for tooling only. Do not request manual tests.
- `byte_replay_unit`: source-controlled copied bytes such as `bytesLe`. Useful as a seed
  fixture only. Do not expand this class repeatedly.
- `source_generated_unit`: executable bytes emitted from repo-controlled source logic.
  This is the current target.
- `linked_executable`: source-generated ranges placed by a controlled linker/layout step.
- `behavioral_equivalence`: runtime evidence for cases hash checks cannot prove. A
  non-byte-identical artifact is not sufficient by itself; manual gates must describe the
  binary change under test and why runtime evidence adds information.

Manual emulator testing is evidence only when hashing does not already prove the artifact
is byte-identical to the original disc. Do not stop for manual testing on semantic no-op
instruction re-encodings alone; keep advancing deterministic linked-source coverage unless
the probe has an observable runtime signal or meaningful integration risk.

Command split:

- `bun decomp:state`: inspect or advance deterministic loop state.
- `bun decomp:loop`: compatibility alias for `bun decomp:state`.
- `bun decomp:verify-map`, `bun decomp:verify-unit`, `bun decomp:verify-linked-unit`,
  `bun decomp:verify-linked-manifest`, and `bun decomp:rebuild-exe`: narrow verifiers
  used by the state helper.

## Phase: select_target_disc

Active task: `select-target-disc`

Goal: choose exactly one `.bin` or `.iso` disc image as the original rebuild target.

Pass when target disc identity and boot executable identity are recorded.

Allowed next phase: `extract_executable`

## Phase: extract_executable

Active task: `extract-executable`

Goal: extract the target disc's boot PS-X executable into ignored local artifacts.

Pass when `decomp/artifacts/original/<serial>.exe` hashes to the selected executable SHA-256.

Allowed next phase: `raw_reemit_executable`

## Phase: raw_reemit_executable

Active task: `raw-reemit-executable`

Goal: prove the local rebuild pipeline can write an executable byte-identically.

Pass when `decomp/build/raw/<serial>.exe` hashes to the selected executable SHA-256.

Evidence class: `byte_identical_plumbing`

Allowed next phase: `map_boundaries`

## Phase: map_boundaries

Active task: `map-boundaries`

Goal: record the minimum executable structure consumed by later verifiers.

Pass when a source-controlled map exists and `bun decomp:verify-map` consumes it.

Allowed next phase: `byte_replay_seed`

## Phase: byte_replay_seed

Active task: `byte-replay-seed`

Goal: keep one tiny byte-replay unit as a seed fixture for manifest/rebuild plumbing.

Pass when one small unit verifies, the manifest consumes it, and the rebuilt executable
still hashes to the original executable SHA-256.

Evidence class: `byte_replay_unit`

Allowed next phase: `source_generation_probe`

## Phase: source_generation_probe

Active task: `source-generation-probe`

Goal: replace byte replay with the first independently source-generated executable bytes.

Pass when:

- at least one tiny executable range is represented without copied `bytesLe` as the source
  of truth,
- repo-controlled source logic emits the bytes for that range,
- emitted bytes match the original range,
- the manifest rebuild consumes the source-generated unit and the executable SHA-256 still
  equals the original executable SHA-256.

Evidence class: `source_generated_unit`

Allowed next phase: `linked_executable_probe`

## Phase: linked_executable_probe

Active task: `linked-executable-probe`

Goal: prove the same tiny source-generated range can be produced by a real MIPS
assembler/linker at its original executable address.

Pass when:

- an external little-endian MIPS binutils toolchain assembles source-controlled assembly,
- the linker places the output section at the expected PS-X executable RAM address,
- the linked raw bytes match the original executable range,
- the linked range is overlaid into the extracted executable, and the rebuilt executable
  still hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `linked_bootstrap_window`

## Phase: linked_bootstrap_window

Active task: `linked-bootstrap-window`

Goal: expand linked source coverage from the seed instructions to the complete PS-X
entrypoint bootstrap window ending at the `break 0,1` after the first `jal`.

Pass when:

- source-controlled assembly represents the range `0x800129d8..0x80012a78`,
- external little-endian MIPS binutils links that range at `0x800129d8`,
- the linked raw bytes match the original 160-byte executable range,
- the linked range is overlaid into the extracted executable, and the rebuilt executable
  still hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `first_function_boundary_probe`

## Phase: first_function_boundary_probe

Active task: `first-function-boundary-probe`

Goal: record the first callable function boundary after the linked entrypoint bootstrap,
so the future C-unit work starts from an explicit map instead of an inferred chat note.

Pass when:

- the boundary map records `entrypoint_bootstrap` as `0x800129d8..0x80012a78`,
- the boundary map records the first post-bootstrap function as
  `runtime_init_once` at `0x80012a78..0x80012ae8`,
- `bun decomp:verify-map` validates RAM/file consistency, alignment, payload containment,
  non-overlap, and the expected return shape for `runtime_init_once`.

Evidence class: `linked_executable` remains the strongest current evidence; this phase
adds map-verifier coverage.

Allowed next phase: `behavioral_boot_probe`

## Phase: behavioral_boot_probe

Active task: `behavioral-boot-probe`

Goal: create the first manual-testable rebuilt disc whose executable is not byte-identical
but should behave identically at boot.

Pass when:

- source-controlled assembly for the linked bootstrap emits a non-byte-identical executable
  range with exactly one expected semantic no-op word change,
- the rebuilt executable SHA-256 differs from the original executable SHA-256,
- the rebuilt disc SHA-256 differs from the original disc SHA-256,
- the rebuilt disc is written to the Windows manual-test directory,
- the user boots the rebuilt disc in DuckStation and confirms it can start and load a save.

Evidence class: `behavioral_equivalence`

Allowed next phase: `linked_runtime_init_once`

## Phase: linked_runtime_init_once

Active task: `linked-runtime-init-once`

Goal: expand linked source coverage from the entrypoint bootstrap into the first mapped
post-bootstrap function.

Pass when:

- source-controlled assembly represents `runtime_init_once` at `0x80012a78..0x80012ae8`,
- external little-endian MIPS binutils links that range at `0x80012a78`,
- the linked raw bytes match the original 112-byte executable range,
- the linked range is overlaid into the extracted executable, and the rebuilt executable
  still hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `behavioral_runtime_init_once_probe`

## Phase: behavioral_runtime_init_once_probe

Active task: `behavioral-runtime-init-once-probe`

Goal: create a manual-testable rebuilt disc whose first mapped function is generated from
repo-controlled source and differs only by an executed semantic no-op instruction.

Pass when:

- source-controlled assembly for `runtime_init_once` emits a non-byte-identical executable
  range with exactly one expected semantic no-op word change,
- the rebuilt executable SHA-256 differs from the original executable SHA-256,
- the rebuilt disc SHA-256 differs from the original disc SHA-256,
- the rebuilt disc is written to the Windows manual-test directory,
- the user boots the rebuilt disc in DuckStation and confirms it can start and load a save.

Evidence class: `behavioral_equivalence`

Allowed next phase: `behavioral_runtime_init_once_tty_probe`

## Phase: behavioral_runtime_init_once_tty_probe

Active task: `behavioral-runtime-init-once-tty-probe`

Goal: create a manual-testable rebuilt disc whose first mapped function emits a
DuckStation-visible TTY message, proving the generated code path ran.

Pass when:

- source-controlled assembly for `runtime_init_once` emits a non-byte-identical executable
  range that calls the PS1 BIOS TTY output vector on the first-run path,
- the rebuilt executable SHA-256 differs from the original executable SHA-256,
- the rebuilt disc SHA-256 differs from the original disc SHA-256,
- the rebuilt disc is written to the Windows manual-test directory,
- the user boots the rebuilt disc in DuckStation and confirms it can start and load a save,
- the agent verifies DuckStation logs contain the expected `MDEC_out_sync` TTY output from
  that run.

Evidence class: `behavioral_equivalence`

Allowed next phase: `linked_runtime_init_always`

## Phase: linked_runtime_init_always

Active task: `linked-runtime-init-always`

Goal: continue assembly rebuild coverage to the next contiguous post-bootstrap function
before attempting any C conversion.

Pass when:

- source-controlled assembly represents the range `0x80012ae8..0x80012b50`,
- external little-endian MIPS binutils links that range at `0x80012ae8`,
- the linked raw bytes match the original 104-byte executable range,
- the linked range is overlaid into the extracted executable, and the rebuilt executable
  still hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `linked_asm_rebuild_manifest`

## Phase: linked_asm_rebuild_manifest

Active task: `linked-asm-rebuild-manifest`

Goal: prove linked assembly coverage can be combined through one manifest rebuild instead
of only verifying one range at a time.

Pass when:

- a source-controlled linked-assembly manifest lists the linked bootstrap, `runtime_init_once`,
  and `runtime_init_always` units,
- each listed unit links at its original executable RAM address and matches the original
  executable range,
- listed ranges are non-overlapping,
- the manifest overlays all linked unit bytes into the extracted executable,
- the rebuilt executable hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `map_main_boot_function_boundary`

## Phase: map_main_boot_function_boundary

Active task: `map-main-boot-function-boundary`

Goal: record the next high-value boot function boundary before expanding linked assembly
coverage into a larger function.

Pass when:

- the boundary map records `runtime_init_always` as `0x80012ae8..0x80012b50`,
- the boundary map records `main_boot` as `0x80012b50..0x80012cd4`,
- `bun decomp:verify-map` validates RAM/file consistency, alignment, payload containment,
  non-overlap, and the expected return shapes for both functions.

Evidence class: `linked_executable` remains the strongest current evidence; this phase
adds map-verifier coverage for the next assembly expansion target.

Allowed next phase: `linked_main_boot_function`

## Phase: linked_main_boot_function

Active task: `linked-main-boot-function`

Goal: expand linked assembly coverage through the main boot function before attempting any
C conversion.

Pass when:

- source-controlled assembly represents `main_boot` at `0x80012b50..0x80012cd4`,
- external little-endian MIPS binutils links that range at `0x80012b50`,
- the linked raw bytes match the original 388-byte executable range,
- the linked-assembly manifest includes the linked bootstrap, `runtime_init_once`,
  `runtime_init_always`, and `main_boot` units,
- the manifest rebuild hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `map_post_main_boot_function_boundary`

## Phase: map_post_main_boot_function_boundary

Active task: `map-post-main-boot-function-boundary`

Goal: map the next contiguous boot helpers as one assembly expansion block.

Pass when:

- the boundary map records `boot_frame_counters` as `0x80012cd4..0x80012d4c`,
- the boundary map records `boot_frame_step` as `0x80012d4c..0x80012d84`,
- the boundary map records `boot_frame_repeat` as `0x80012d84..0x80012db4`,
- the boundary map records `boot_wait_draw_gate` as `0x80012db4..0x80012e5c`,
- `bun decomp:verify-map` validates RAM/file consistency, alignment, payload containment,
  non-overlap, and the expected return shapes for those functions.

Evidence class: `linked_executable` remains the strongest current evidence; this phase
adds map-verifier coverage for the next linked assembly block.

Allowed next phase: `linked_post_main_boot_helpers`

## Phase: linked_post_main_boot_helpers

Active task: `linked-post-main-boot-helpers`

Goal: expand linked assembly coverage through the next contiguous helper block in one
verified unit instead of one tiny function at a time.

Pass when:

- source-controlled assembly represents `0x80012cd4..0x80012e5c`,
- external little-endian MIPS binutils links that range at `0x80012cd4`,
- the linked raw bytes match the original 392-byte executable range,
- the linked-assembly manifest includes the helper block and rebuilds 1,156 bytes from
  repo-controlled linked assembly,
- the manifest rebuild hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `map_boot_status_renderer_boundary`

## Phase: map_boot_status_renderer_boundary

Active task: `map-boot-status-renderer-boundary`

Goal: map the next larger boot renderer function before linking it from assembly.

Pass when:

- the boundary map records `boot_status_renderer` as `0x80012e5c..0x8001306c`,
- `bun decomp:verify-map` validates RAM/file consistency, alignment, payload containment,
  non-overlap, and the expected return shape for that function.

Evidence class: `linked_executable` remains the strongest current evidence; this phase
adds map-verifier coverage for the next larger assembly expansion.

Allowed next phase: `linked_boot_status_renderer`

## Phase: linked_boot_status_renderer

Active task: `linked-boot-status-renderer`

Goal: expand linked assembly coverage through the next larger boot renderer function.

Pass when:

- source-controlled assembly represents `boot_status_renderer` at
  `0x80012e5c..0x8001306c`,
- external little-endian MIPS binutils links that range at `0x80012e5c`,
- the linked raw bytes match the original 528-byte executable range,
- the linked-assembly manifest includes the renderer and rebuilds 1,684 bytes from
  repo-controlled linked assembly,
- the manifest rebuild hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `map_boot_frame_dispatch_boundary`

## Phase: behavioral_boot_status_renderer_probe

Active task: `behavioral-boot-status-renderer-probe`

Legacy note: this already-tested semantic no-op probe is not a good future manual gate.
Keep the record for traceability, but do not create new manual-test phases of this shape.

Evidence class: `behavioral_equivalence`

Allowed next phase after the already-recorded gate passes: `map_boot_frame_dispatch_boundary`

## Phase: map_boot_frame_dispatch_boundary

Active task: `map-boot-frame-dispatch-boundary`

Goal: map the next frame-dispatch helper before linking it from assembly.

Pass when:

- the boundary map records `boot_frame_dispatch` as `0x8001306c..0x80013154`,
- `bun decomp:verify-map` validates RAM/file consistency, alignment, payload containment,
  non-overlap, and the expected return shape.

Evidence class: `linked_executable` remains the strongest current evidence; this phase
adds map-verifier coverage for the next linked assembly block.

Allowed next phase: `linked_boot_frame_dispatch`

## Phase: linked_boot_frame_dispatch

Active task: `linked-boot-frame-dispatch`

Goal: expand linked assembly coverage through the frame dispatch/timer helper.

Pass when:

- source-controlled assembly represents `boot_frame_dispatch` at
  `0x8001306c..0x80013154`,
- external little-endian MIPS binutils links that range at `0x8001306c`,
- the linked raw bytes match the original 232-byte executable range,
- the linked-assembly manifest includes the unit and rebuilds 1,916 bytes from
  repo-controlled linked assembly,
- the manifest rebuild hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `map_boot_status_state_init_boundary`

## Phase: map_boot_status_state_init_boundary

Active task: `map-boot-status-state-init-boundary`

Goal: map the next boot status state initializer before linking it from assembly.

Pass when:

- the boundary map records `boot_status_state_init` as `0x80013154..0x80013360`,
- `bun decomp:verify-map` validates RAM/file consistency, alignment, payload containment,
  non-overlap, and the expected return shape.

Evidence class: `linked_executable` remains the strongest current evidence.

Allowed next phase: `linked_boot_status_state_init`

## Phase: linked_boot_status_state_init

Active task: `linked-boot-status-state-init`

Goal: expand linked assembly coverage through the boot status state initializer.

Pass when:

- source-controlled assembly represents `boot_status_state_init` at
  `0x80013154..0x80013360`,
- external little-endian MIPS binutils links that range at `0x80013154`,
- the linked raw bytes match the original 524-byte executable range,
- the linked-assembly manifest includes the unit and rebuilds 2,440 bytes from
  repo-controlled linked assembly,
- the manifest rebuild hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `map_boot_input_helpers_boundary`

## Phase: map_boot_input_helpers_boundary

Active task: `map-boot-input-helpers-boundary`

Goal: map the next contiguous input-position helper block before linking it from assembly.

Pass when:

- the boundary map records `boot_input_position_loop` as `0x80013360..0x800134b4`,
- the boundary map records `boot_callback_slots_clear` as `0x800134b4..0x800134e0`,
- `bun decomp:verify-map` validates RAM/file consistency, alignment, payload containment,
  non-overlap, and the expected return shapes.

Evidence class: `linked_executable` remains the strongest current evidence.

Allowed next phase: `linked_boot_input_helpers`

## Phase: linked_boot_input_helpers

Active task: `linked-boot-input-helpers`

Goal: expand linked assembly coverage through the input-position helper block.

Pass when:

- source-controlled assembly represents `0x80013360..0x800134e0`,
- external little-endian MIPS binutils links that range at `0x80013360`,
- the linked raw bytes match the original 384-byte executable range,
- the linked-assembly manifest includes the unit and rebuilds 2,824 bytes from
  repo-controlled linked assembly,
- the manifest rebuild hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `map_boot_transform_helpers_boundary`

## Phase: map_boot_transform_helpers_boundary

Active task: `map-boot-transform-helpers-boundary`

Goal: map the next contiguous transform helper block before linking it from assembly.

Pass when:

- the boundary map records `boot_apply_object_offset` as `0x800134e0..0x8001352c`,
- the boundary map records `boot_rotate_status_object_a` as `0x8001352c..0x800135fc`,
- the boundary map records `boot_rotate_status_object_b` as `0x800135fc..0x800136d4`,
- the boundary map records `boot_frame_draw_hook` as `0x800136d4..0x800136e4`,
- `bun decomp:verify-map` validates RAM/file consistency, alignment, payload containment,
  non-overlap, and the expected return shapes.

Evidence class: `linked_executable` remains the strongest current evidence.

Allowed next phase: `linked_boot_transform_helpers`

## Phase: linked_boot_transform_helpers

Active task: `linked-boot-transform-helpers`

Goal: expand linked assembly coverage through the transform helper block.

Pass when:

- source-controlled assembly represents `0x800134e0..0x800136e4`,
- external little-endian MIPS binutils links that range at `0x800134e0`,
- the linked raw bytes match the original 516-byte executable range,
- the linked-assembly manifest includes the unit and rebuilds 3,340 bytes from
  repo-controlled linked assembly,
- the manifest rebuild hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `map_boot_gfx_init_boundary`

## Phase: map_boot_gfx_init_boundary

Active task: `map-boot-gfx-init-boundary`

Goal: map the boot graphics initialization function starting at `0x800136e4`.

Pass when:

- the boundary map records `boot_gfx_init` as `0x800136e4..0x800137e4`,
- `bun decomp:verify-map` validates RAM/file consistency, alignment, payload containment,
  non-overlap, and the expected return shape.

Evidence class: `linked_executable` remains the strongest current evidence.

Allowed next phase: `linked_boot_gfx_init`

## Phase: linked_boot_gfx_init

Active task: `linked-boot-gfx-init`

Goal: expand linked assembly coverage through the boot graphics initialization function.

Pass when:

- source-controlled assembly represents `boot_gfx_init` at `0x800136e4..0x800137e4`,
- external little-endian MIPS binutils links that range at `0x800136e4`,
- the linked raw bytes match the original 256-byte executable range,
- the linked-assembly manifest includes the unit and rebuilds 3,596 bytes from
  repo-controlled linked assembly,
- the manifest rebuild hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `behavioral_boot_gfx_init_tty_probe`

## Phase: behavioral_boot_gfx_init_tty_probe

Active task: `behavioral-boot-gfx-init-tty-probe`

Goal: create a manual-testable rebuilt disc that proves the newly linked `boot_gfx_init`
code path runs in DuckStation.

Pass when:

- a generated overlay routes `boot_gfx_init`'s initialization call through a generated
  TTY hook,
- the hook emits the existing DuckStation-visible `MDEC_out_sync` marker, then tail-jumps
  to the original initialization callee,
- the rebuilt executable SHA-256 differs from the original executable SHA-256,
- the rebuilt disc SHA-256 differs from the original disc SHA-256,
- the rebuilt disc is written to the Windows manual-test directory,
- the user boots the rebuilt disc in DuckStation and confirms it can start and load a save,
- the agent verifies DuckStation logs contain the expected `MDEC_out_sync` marker from
  that run.

Evidence class: `behavioral_equivalence`

Allowed next phase: `map_boot_frame_wait_loop_boundary`

## Phase: map_boot_frame_wait_loop_boundary

Active task: `map-boot-frame-wait-loop-boundary`

Goal: map the contiguous boot graphics helper block starting at `0x800137e4`.

Pass when the boundary map records `0x800137e4..0x80015078` as contiguous functions and
`bun decomp:verify-map` validates it. This phase is automated, not a manual gate.

Evidence class: `linked_executable`

Allowed next phase: `linked_boot_gfx_helpers`

## Phase: linked_boot_gfx_helpers

Active task: `linked-boot-gfx-helpers`

Goal: expand linked assembly coverage through the boot graphics helper block.

Pass when:

- source-controlled assembly represents `0x800137e4..0x80015078`,
- the linked raw bytes match the original 6,292-byte executable range,
- the linked-assembly manifest includes the unit and rebuilds 9,888 bytes from
  repo-controlled linked assembly,
- the manifest rebuild hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `map_boot_fade_helpers_boundary`

## Phase: map_boot_fade_helpers_boundary

Active task: `map-boot-fade-helpers-boundary`

Goal: map the contiguous fade/palette helper block starting at `0x80015078`.

Pass when the boundary map records `0x80015078..0x80015d18` as contiguous functions and
`bun decomp:verify-map` validates it.

Evidence class: `linked_executable`

Allowed next phase: `linked_boot_fade_helpers`

## Phase: linked_boot_fade_helpers

Active task: `linked-boot-fade-helpers`

Goal: expand linked assembly coverage through the fade/palette helper block.

Pass when:

- source-controlled assembly represents `0x80015078..0x80015d18`,
- the linked raw bytes match the original 3,232-byte executable range,
- the linked-assembly manifest includes the unit and rebuilds 13,120 bytes from
  repo-controlled linked assembly,
- the manifest rebuild hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `map_boot_gte_helpers_boundary`

## Phase: map_boot_gte_helpers_boundary

Active task: `map-boot-gte-helpers-boundary`

Goal: map the contiguous GTE/object projection helper block starting at `0x80015d18`.

Pass when the boundary map records `0x80015d18..0x80016784` as contiguous functions and
`bun decomp:verify-map` validates it.

Evidence class: `linked_executable`

Allowed next phase: `linked_boot_gte_helpers`

## Phase: linked_boot_gte_helpers

Active task: `linked-boot-gte-helpers`

Goal: expand linked assembly coverage through the GTE/object projection helper block.

Pass when:

- source-controlled assembly represents `0x80015d18..0x80016784`,
- the linked raw bytes match the original 2,668-byte executable range,
- the linked-assembly manifest includes the unit and rebuilds 15,788 bytes from
  repo-controlled linked assembly,
- the manifest rebuild hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `map_boot_object_render_helpers_boundary`

## Phase: map_boot_object_render_helpers_boundary

Active task: `map-boot-object-render-helpers-boundary`

Goal: map the contiguous object-render helper block starting at `0x80016784`.

Pass when the boundary map records `0x80016784..0x8001755c` as contiguous functions and
`bun decomp:verify-map` validates it.

Evidence class: `linked_executable`

Allowed next phase: `linked_boot_object_render_helpers`

## Phase: linked_boot_object_render_helpers

Active task: `linked-boot-object-render-helpers`

Goal: expand linked assembly coverage through the object-render helper block.

Pass when:

- source-controlled assembly represents `0x80016784..0x8001755c`,
- the linked raw bytes match the original 3,544-byte executable range,
- the linked-assembly manifest includes the unit and rebuilds 19,332 bytes from
  repo-controlled linked assembly,
- the manifest rebuild hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `map_boot_scene_animation_boundary`

## Phase: map_boot_scene_animation_boundary

Active task: `map-boot-scene-animation-boundary`

Goal: map the contiguous scene/object animation helper block starting at `0x8001755c`.

Pass when the boundary map records `0x8001755c..0x80017db4` as contiguous functions and
`bun decomp:verify-map` validates it.

Evidence class: `linked_executable`

Allowed next phase: `linked_boot_scene_animation_helpers`

## Phase: linked_boot_scene_animation_helpers

Active task: `linked-boot-scene-animation-helpers`

Goal: expand linked assembly coverage through the scene/object animation helper block.

Pass when:

- source-controlled assembly represents `0x8001755c..0x80017db4`,
- the linked raw bytes match the original 2,136-byte executable range,
- the linked-assembly manifest includes the unit and rebuilds 21,468 bytes from
  repo-controlled linked assembly,
- the manifest rebuild hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `map_boot_object_runtime_boundary`

## Phase: map_boot_object_runtime_boundary

Active task: `map-boot-object-runtime-boundary`

Goal: map the next contiguous object-runtime helper block starting at `0x80017db4`.

Pass when the boundary map records `0x80017db4..0x80018db4` as contiguous functions and
`bun decomp:verify-map` validates it.

Evidence class: `linked_executable`

Allowed next phase: `linked_boot_object_runtime_helpers`

## Phase: linked_boot_object_runtime_helpers

Active task: `linked-boot-object-runtime-helpers`

Goal: expand linked assembly coverage through the first object-runtime helper block.

Pass when:

- source-controlled assembly represents `0x80017db4..0x80018db4`,
- the linked raw bytes match the original 4,096-byte executable range,
- the linked-assembly manifest includes the unit and rebuilds 25,564 bytes from
  repo-controlled linked assembly,
- the manifest rebuild hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `map_boot_scene_runtime_boundary`

## Phase: map_boot_scene_runtime_boundary

Active task: `map-boot-scene-runtime-boundary`

Goal: map the next scene-runtime state block starting at `0x80018db4`.

Pass when the boundary map records `0x80018db4..0x8001944c` as contiguous functions and
`bun decomp:verify-map` validates it.

Evidence class: `linked_executable`

Allowed next phase: `linked_boot_scene_runtime_helpers`

## Phase: linked_boot_scene_runtime_helpers

Active task: `linked-boot-scene-runtime-helpers`

Goal: expand linked assembly coverage through the scene-runtime state block.

Pass when:

- source-controlled assembly represents `0x80018db4..0x8001944c`,
- the linked raw bytes match the original 1,688-byte executable range,
- the linked-assembly manifest includes the unit and rebuilds 27,252 bytes from
  repo-controlled linked assembly,
- the manifest rebuild hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `map_boot_scene_wait_boundary`

## Phase: map_boot_scene_wait_boundary

Active task: `map-boot-scene-wait-boundary`

Goal: map the next scene wait/input block starting at `0x8001944c`.

Pass when the boundary map records `0x8001944c..0x800208d4` as contiguous functions and
`bun decomp:verify-map` validates it. This is intentionally a larger wait/duel-runtime
block so the loop advances evidence in meaningful chunks instead of one small helper at a
time.

Evidence class: `linked_executable`

Allowed next phase: `linked_boot_scene_wait_helpers`

## Phase: linked_boot_scene_wait_helpers

Active task: `linked-boot-scene-wait-helpers`

Goal: expand linked assembly coverage through the scene wait/duel-runtime block.

Pass when:

- source-controlled assembly represents `0x8001944c..0x800208d4`,
- the linked raw bytes match the original 29,832-byte executable range,
- the linked-assembly manifest includes the unit and rebuilds 57,084 bytes from
  repo-controlled linked assembly,
- the manifest rebuild hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `map_boot_scene_late_runtime_boundary`

## Phase: map_boot_scene_late_runtime_boundary

Active task: `map-boot-scene-late-runtime-boundary`

Goal: map the next boot scene/runtime block starting at `0x800208d4`.

Pass when the boundary map records `0x800208d4..0x80023fbc` as contiguous functions and
`bun decomp:verify-map` validates it.

Evidence class: `linked_executable`

Allowed next phase: `linked_boot_scene_late_runtime_helpers`

## Phase: linked_boot_scene_late_runtime_helpers

Active task: `linked-boot-scene-late-runtime-helpers`

Goal: expand linked assembly coverage through the next boot scene/runtime block.

Pass when:

- source-controlled assembly represents `0x800208d4..0x80023fbc`,
- the linked raw bytes match the original 14,056-byte executable range,
- the linked-assembly manifest includes the unit and rebuilds 71,140 bytes from
  repo-controlled linked assembly,
- the manifest rebuild hashes to the original executable SHA-256.

Evidence class: `linked_executable`

Allowed next phase: `map_boot_scene_interaction_boundary`

## Phase: map_boot_scene_interaction_boundary

Active task: `map-boot-scene-interaction-boundary`

Goal: map the next boot scene interaction block starting at `0x80023fbc`.

Pass when the boundary map records the next meaningful contiguous function block and
`bun decomp:verify-map` validates it.

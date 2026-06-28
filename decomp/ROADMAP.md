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
- `behavioral_equivalence`: runtime evidence for cases hash checks cannot prove.

Manual emulator testing is evidence only when hashing does not already prove the artifact
is byte-identical to the original disc.

Command split:

- `bun decomp:state`: inspect or advance deterministic loop state.
- `bun decomp:loop`: compatibility alias for `bun decomp:state`.
- `bun decomp:verify-map`, `bun decomp:verify-unit`, and `bun decomp:rebuild-exe`: narrow
  verifiers used by the state helper.

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

Allowed next phase: define only after the manual boot/load/log gate passes.

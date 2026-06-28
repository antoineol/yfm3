# Forbidden Memories Decomp/Recomp Goal

## North Star

Rebuild the original Yu-Gi-Oh! Forbidden Memories PS1 executable from repo-controlled
sources so the rebuilt game behaves identically to the selected original disc, before
making any intentional gameplay changes.

## Current Target

The first target is one user-selected disc image (`.bin` or `.iso`). The loop must record
that target in `decomp/STATE.json` before any extraction, mapping, or recompilation work.

## Success Levels

1. Select one target disc and record its identity.
2. Extract the boot PS-X executable reproducibly.
3. Re-emit the executable byte-identically from a controlled rebuild pipeline.
4. Reinsert the byte-identical executable into an otherwise unchanged disc and boot it.
5. Map code/data/function boundaries needed by the rebuild.
6. Replace original assembly/raw ranges with matching C one unit at a time.

## Convergence Contract

The loop must increase evidence toward the north star, not just produce more artifacts.
Every phase must improve at least one of these north-star metrics:

- More executable bytes are generated from repo-controlled source logic rather than copied
  from the original executable.
- The rebuild pipeline becomes less dependent on opaque original bytes.
- The map/rebuild verifier catches a new class of defect that could affect recompilation.
- Runtime/manual testing covers a behavior that hash checks cannot already prove.

Evidence classes, from weakest to strongest:

1. `byte_identical_plumbing`: extraction, reinsertion, or manifest overlay produces a full
   disc SHA-256 identical to the original. This proves tooling did not corrupt the disc,
   but manual emulator tests add no extra evidence.
2. `byte_replay_unit`: a unit is represented by source-controlled copied bytes such as
   `bytesLe`. This improves structure and verification, but is not recompilation.
3. `source_generated_unit`: bytes are produced from assembly/C or another independent
   source representation in the repo, then matched against the original.
4. `linked_executable`: ranges are produced by a real build/link step with controlled
   addresses, relocations, and symbols.
5. `behavioral_equivalence`: non-byte-identical or only partially matching builds pass
   targeted automated/manual runtime checks.

The current loop target is to run a behavioral manual boot/load gate that also proves the
repo-controlled `runtime_init_once` code path executed by emitting a DuckStation-visible
TTY log message.

## Non-Goals

- Do not change gameplay, data, rewards, text, balance, or patches on this track.
- Do not grow a freeform backlog.
- Do not use chat history as project memory.
- Do not commit extracted executable bytes or generated disc images.
- Do not start C conversion before the raw executable rebuild pipeline is verified.
- Do not request manual emulator testing for a full-disc artifact whose SHA-256 equals
  the original target disc; that is already fully covered by hashing.

## Agent Loop Rule

Agents execute exactly one active task from `decomp/STATE.json`, verify it, update state
only through a legal transition from `decomp/ROADMAP.md`, then stop.

`decomp/scripts/decomp-state.ts` is a deterministic checkpoint helper, not the orchestrator.
Agents use it to inspect/record state and run phase verifiers; agents still choose the
single bounded milestone.

Every loop result must report:

- current evidence class,
- source-generated executable bytes,
- byte-replay executable bytes,
- whether manual testing adds evidence,
- next north-star checkpoint.

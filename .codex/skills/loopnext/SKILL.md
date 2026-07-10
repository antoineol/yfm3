---
name: loopnext
description: Continue a repository-owned state-machine agent loop one bounded, verified transition at a time. Use when the user says "loopnext", "$loopnext", "continue the loop", "continue the decomp loop", or asks Codex to act as an orchestrator for a serialized task loop stored in repo files such as GOAL, ROADMAP, STATE, LOG, or a loop runner script.
---

# Loopnext

## Purpose

Act as the loop orchestrator, not an open-ended planner. The repo owns state; chat history does not.

For YFM3 decomp/recomp work, the state files are:

- `decomp/GOAL.md`
- `decomp/ROADMAP.md`
- `decomp/STATE.json`
- `decomp/LOG.md`
- `decomp/scripts/decomp-state.ts`

## Operating Rules

1. Read the repo instructions first: `AGENTS.md`, then the loop files above when present.
2. Run the loop status command when available. For YFM3: `bun decomp:state status` (`bun decomp:loop status` is a compatibility alias).
3. Execute exactly one active task or the smallest verifiable sub-milestone needed to unblock that task.
4. Do not create a backlog, broaden scope, start speculative work, or advance multiple conceptual phases.
5. Prefer extending the loop runner/verifier over relying on prose.
6. Keep generated binaries and local artifacts out of git.
7. Classify the evidence produced by the step using `decomp/GOAL.md`.
8. Do not request manual emulator testing when the artifact is byte-identical to the original disc.
9. After a user confirms a real manual gate, record it through the loop runner and stop or proceed only to the next status check.

## Continuation Policy

Default `$loopnext` behavior for the YFM3 decomp/recomp loop is: continue through
bounded, deterministic, verified non-manual milestones until the next real manual-test
gate is produced. A real manual gate must add evidence that hashing cannot provide; being
non-byte-identical is necessary for many manual gates, but not sufficient on its own.

Do not stop for manual testing just because a semantic no-op instruction was re-encoded.
That is low-value bit churn unless it also produces an observable runtime signal or
covers a meaningful integration risk. Prefer more byte-identical linked-source coverage
or a real runtime probe such as a TTY/log signal.

For non-YFM3 loops, or when the repo does not define a clear continuation contract, fall
back to one bounded milestone per invocation.

Continue through multiple deterministic loop steps only while each next step is already
defined, verifiable, and non-manual. Stop when:

- a manual test is required,
- a verifier fails,
- a blocker appears,
- continuing would broaden scope beyond the current finite roadmap.

If the user confirms that a manual gate passed and invokes `$loopnext`, record the gate
through the loop runner first, then continue under the same default policy until the next
manual gate. If the user asks only to record or only for status, do not continue.

If the roadmap ends at an abstract placeholder, do not bounce the decision back to the user by default. First try to refine the roadmap to the next concrete, user-visible, testable milestone that moves toward `decomp/GOAL.md`. Stop for the user only when the remaining choice changes direction, risk, or scope rather than merely filling in the next obvious verification step.

Do not grow `byte_replay_unit` coverage as a substitute for recompilation progress. Once a byte-replay seed exists, the next loop target is `source_generated_unit`: bytes emitted from repo-controlled source logic rather than copied `bytesLe`.

Every final response must include one of:

- `Manual test: not required`
- `Manual test: required: <exact action/path>`

For every manual-test request, also include a concise `Change under test:` line.
This line should name the generated range and the behavioral/runtime reason manual testing
adds evidence. If no such line can be written honestly, keep advancing deterministic
automation instead of creating a manual gate.

## Workflow

1. Inspect state:

```bash
bun decomp:state status
```

2. Read `decomp/STATE.json` and `decomp/ROADMAP.md`.
3. Identify the active phase and its pass condition.
4. Implement one narrow change that makes the pass condition objectively checkable.
5. Run the phase verifier or add one if the phase has no verifier yet.
6. Run repo-required checks:

```bash
bun typecheck
bun lint
bun run test
```

7. If the verifier passes, update state only through the loop runner or a documented legal transition.
8. Report:

- current phase
- evidence class
- source-generated executable bytes
- byte-replay executable bytes
- changed files
- commands run
- verification result
- next gate or exact manual action
- manual test status

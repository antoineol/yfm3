# Speed 3: Targeted Refactoring — Operations Guide

How to run structured refactoring sessions that don't go out of control.

---

## Why structure matters

An unstructured "refactor this file" prompt produces unpredictable results: the agent may change too much, too little, break implicit contracts, or wander into adjacent files. Multiply that across dozens of sessions and you have chaos.

The structure below constrains each session to a **predictable scope, verifiable output, and documented trail** so that the next session starts from solid ground.

---

## The cycle

Every refactoring target goes through this cycle. No skipping steps.

```
AUDIT → PLAN → EXECUTE → VERIFY → DIGEST
  ↑                                    |
  └────────────────────────────────────┘
         (next target or re-audit)
```

Each step is a separate agent invocation (or sub-agent). Never combine them. The human reviews between PLAN→EXECUTE and between VERIFY→DIGEST.

---

## Step 1: AUDIT

**Goal:** Map the target file's actual responsibilities. Produce a structured assessment.

**Who runs it:** Sub-agent (read-only, cannot edit).

**Prompt template:**

```
Audit `[file path]` against the principles in `docs/refact/principles.md`.

For each function/component in the file:
1. Name it in ONE verb + ONE noun. Flag if you can't.
2. Classify: COMPUTE or ORCHESTRATE (functions) / RENDER or MANAGE (components). Flag if both.
3. Count lines. Flag if over 40.
4. Count args/props. Flag if over 3/5.
5. Count nesting depth. Flag if over 2.

Then list:
- How many distinct responsibilities does this file have? Name each one.
- Which functions are pure? Which have side effects?
- What is the file's relationship to its callers? (grep for imports of this file)

Output format: a markdown table per function, then a summary of responsibilities.
Do NOT suggest fixes. Only diagnose.
```

**Output:** An audit report saved to `docs/refact/audits/[file-name].audit.md`.

**Why a separate step:** The agent doing the audit must NOT be the same context that does the refactoring. Auditing with fresh eyes catches things the refactoring agent would rationalize away.

---

## Step 2: PLAN

**Goal:** Design the decomposition. Decide what splits into what, in what order.

**Who runs it:** Human + agent collaboration. The human reviews the audit and decides scope.

**Key decisions:**
1. Which responsibilities get extracted? (Not all — only what violates principles.)
2. What are the new files/functions? Name them now. Names reveal whether the split makes sense.
3. What is the extraction order? (Each extraction = one atomic commit. Order matters when extractions depend on each other.)
4. Are there missing tests? (If a function being extracted has no tests, add characterization tests FIRST, in a prior session.)

**Output:** A plan saved to `docs/refact/plans/[file-name].plan.md` with this structure:

```markdown
# Refactoring Plan: [file name]

## Source
- File: [path]
- Current LOC: [number]
- Responsibilities found: [from audit]

## Extractions (in order)

### 1. Extract [verb-noun] → [new-file-name.ts]
- Functions to move: [list]
- New file responsibility: [one sentence]
- Callers to update: [list of files that import the moved functions]
- Tests: [existing test file covers this? or new tests needed?]

### 2. Extract [verb-noun] → [new-file-name.ts]
...

## Pre-conditions
- [ ] All existing tests pass before starting
- [ ] Characterization tests added for [uncovered function X]

## Out of scope
- [Things the audit flagged but we deliberately skip this round]
```

**Human review gate:** The human approves the plan before execution starts. This is the main safeguard against scope creep.

---

## Step 3: EXECUTE

**Goal:** Perform the extractions, one commit per extraction.

**Who runs it:** Agent session (with edit permissions).

**Prompt template:**

```
Execute the refactoring plan in `docs/refact/plans/[file-name].plan.md`.

Rules:
- One extraction per commit. Commit message: "refactor: extract [verb-noun] from [source file]"
- Do NOT change behavior. All existing tests must pass after each commit.
- Do NOT refactor code that is not listed in the plan.
- Do NOT combine extractions into a single commit.
- After each extraction, run `bun typecheck && bun lint && bun run test`.
- If any check fails, stop and report. Do not attempt to fix unrelated failures.

After completing all extractions, report:
- Number of commits made
- New files created (with line counts)
- Original file's new line count
- Any issues encountered
```

**Scope containment rules:**
- The agent edits ONLY the files listed in the plan (source file + new files + callers that need import updates).
- If the agent discovers something unexpected (circular dependency, missing test, implicit contract), it STOPS and reports rather than improvising a fix.
- No "while I'm here" cleanups. Only what's in the plan.

---

## Step 4: VERIFY

**Goal:** Confirm the refactoring actually improved things. Catch regressions the test suite doesn't cover.

**Who runs it:** Sub-agent (read-only, fresh context — not the agent that did the refactoring).

**Prompt template:**

```
Verify the refactoring of `[original file]` against `docs/refact/principles.md`.

1. Re-audit the original file (same audit as Step 1). Is it now compliant?
2. Audit each new file created. Are they compliant?
3. Check: does every new file have co-located tests?
4. Check: do all imports resolve correctly? (run `bun typecheck`)
5. Check: is there any dead code left in the original file?
6. Check: did any file GROW (callers that absorbed complexity that should have stayed extracted)?

Compare the before-audit (`docs/refact/audits/[file-name].audit.md`) with current state.
List remaining violations, if any.
```

**Output:** Update the audit file with a "Post-refactoring" section.

---

## Step 5: DIGEST

**Goal:** Decide what's next. Update tracking. Capture learnings.

**Who runs it:** Human, assisted by agent.

**Actions:**
1. **Update the tracker** (`docs/refact/tracker.md`) — mark the target as done or note remaining work.
2. **Capture surprises** — If something unexpected happened (a hidden dependency, a test gap, a principle that didn't apply cleanly), note it in `docs/refact/principles-rationale.md` as an edge case or in `CLAUDE.md` as a gotcha.
3. **Pick the next target** — Based on the prioritization framework (size x coupling x change frequency). Don't pick it during the session — pick it fresh.
4. **Cool down** — Don't immediately start the next cycle. Let the refactored code live in the codebase for a day or two. If something breaks in normal feature work, you'll catch it before compounding with more refactoring.

---

## Tracker

Maintain `docs/refact/tracker.md` as the single source of truth for refactoring status.

```markdown
# Refactoring Tracker

## Scoring
Priority = (LOC / 150) × import_count × change_frequency_bucket
- change_frequency: 3 = weekly, 2 = monthly, 1 = quarterly, 0 = stable

## Targets

| File | LOC | Importers | Change freq | Priority | Status |
|------|-----|-----------|-------------|----------|--------|
| use-emulator-bridge.ts | 824 | 3 | 2 | 32.9 | not started |
| ... | ... | ... | ... | ... | ... |

## Completed

| File | Date | Before LOC | After LOC | New files | Notes |
|------|------|------------|-----------|-----------|-------|
```

---

## Session boundaries

**One cycle = one target file.** Never refactor two files in the same session.

**One session = one step.** Don't combine AUDIT + PLAN in one session. Don't combine EXECUTE + VERIFY. Each step has a different mindset and a different agent context. Combining them leads to the agent rationalizing its own work.

**Exception:** For very small targets (under 200 LOC, 2-3 extractions), AUDIT + PLAN can be one session. But EXECUTE and VERIFY are always separate.

---

## When to STOP a session

The agent must stop and report (not improvise) when:

- A test fails that isn't obviously caused by the current extraction.
- The extraction reveals a circular dependency.
- The extraction requires changing more than 5 caller files.
- The agent isn't sure whether a change preserves behavior.
- The agent discovers the function has no tests and behavior is unclear.
- The extraction would create a file over 150 LOC (the split isn't fine-grained enough).

Each of these is a signal that the PLAN was incomplete. Go back to PLAN, adjust, then resume EXECUTE.

---

## Anti-patterns to watch for

**"While I'm here" syndrome.** The agent refactors file A, notices file B also violates principles, and starts changing file B. This is how scope explodes. File B gets its own cycle.

**"Just one more extraction."** The plan said 3 extractions. The agent finished 3 but sees a 4th opportunity. Stop. The 4th goes in the next cycle, with its own audit.

**Refactoring without tests.** If the code being extracted has no tests, the agent CANNOT verify behavior preservation. Add characterization tests first. This is a separate session with its own commit.

**Mega-commits.** A commit that extracts 5 functions, renames 3 files, and updates 12 imports is unreviewable and unrevertable. One extraction per commit. Always.

**Skipping VERIFY.** "The tests pass, so it's fine." Tests don't catch all regressions. The verify step catches structural problems: files that grew instead of shrinking, dead code, missing test co-location.

---

## Prompt engineering notes for Opus 4.6

Based on observed agent behavior:

- **Be explicit about what NOT to do.** The agent defaults to being helpful, which means it will "improve" things you didn't ask it to improve. The EXECUTE prompt must explicitly constrain scope.
- **Separate diagnosis from treatment.** The agent is better at finding problems when it's not simultaneously trying to fix them. This is why AUDIT and EXECUTE are separate steps.
- **Give it a checklist, not a goal.** "Refactor this file" produces inconsistent results. "Extract functions X, Y, Z into files A, B, C, update imports in D, E, F" produces predictable results.
- **Fresh context for verification.** The agent that wrote the code will rationalize its own decisions during review. A fresh sub-agent with no memory of the refactoring catches things the author missed.
- **Stop conditions must be explicit.** Without them, the agent will work around problems rather than reporting them. List the exact conditions under which it must stop.

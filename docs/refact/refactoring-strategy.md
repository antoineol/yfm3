# Progressive Refactoring Strategy

How to refactor a large codebase (think 1M LOC, 80% bad code) progressively, without stopping feature work, using AI agents as the primary workforce.

---

## The fundamental constraint

You cannot refactor everything at once. You cannot stop shipping features. And AI agents work best on small, well-scoped tasks — not sweeping rewrites.

The strategy operates at three speeds simultaneously.

---

## Speed 1: Containment (starts day 1, never stops)

**Goal:** Stop writing new bad code.

**How:**
- Add the principles document to agent instructions (CLAUDE.md).
- All new files and functions follow the principles. No exceptions.
- Lint rules enforce what can be automated (file/function LOC limits, naming, unused code).
- Pre-commit hooks catch violations before they land.
- Agent instructions include a post-change compliance checklist.

**Enforcement:**
- The agent runs `typecheck + lint + test` before completing any task. This is non-negotiable.
- New code that violates principles does not merge. Period.

**Why this is non-negotiable:** Without containment, bad code grows faster than you clean it. You're mopping the floor with the faucet running.

---

## Speed 2: Refactor on touch (continuous, zero dedicated time)

**Goal:** Improve code you're already modifying for feature work.

**Rule:** When a task requires modifying a file, bring the **touched functions** to compliance. Not the whole file. Not adjacent untouched functions. Just what you touch.

**Scoping examples:**
- Modifying a function? Bring it under LOC limit, fix naming, extract sub-responsibilities.
- Adding code to a file that's over the LOC limit? Put the new code in a new file instead.
- Calling a function with too many parameters? Restructure the call interface.
- Never combine refactoring with behavior changes in the same commit. Refactor first, commit. Add behavior, commit.

**Why this works:**
- High-traffic code gets cleaned first automatically — because it's touched most often.
- Zero dedicated refactoring time required.
- Each individual touch is small and safe.
- The codebase prioritizes itself: important code improves, dead code stays dead.

---

## Speed 3: Targeted cleanup (scheduled, deliberate)

**Goal:** Eliminate the worst offenders that Speed 2 can't reach.

**Frequency:** 1-2 dedicated sessions per week.

### How to pick targets

Rank candidates by two signals:

1. **Size x coupling:** `LOC x import_count`. Big files that many things depend on = highest blast radius.
2. **Change frequency:** Files modified in many recent PRs = highest traffic.

The file that is both large AND frequently changed is your #1 target. A large file that nobody touches is P2 at best — leave it alone.

### Agent task template

Each targeted cleanup task follows this structure:

```
Refactor [file path] to follow the principles in docs/refact/principles.md.

Current state: [one sentence describing the violation — e.g. "824-line file mixing WebSocket I/O with game state parsing"]

Constraints:
- Do not change external behavior. All existing tests must pass unchanged.
- Split into multiple files if the file exceeds 150 LOC.
- Each new function must be under 40 LOC.
- Each unit must pass the SRP naming test (one verb + one noun).
- Add tests for any extracted function that lacks coverage.
- Run typecheck + lint + test before completing.
- Separate commits: one per extraction/move.
```

### Safety protocol

1. **Test coverage first.** Before refactoring ANY code, ensure it has tests. If tests are missing, add characterization tests first — in a separate commit. These tests capture current behavior (even if buggy). They prevent regressions during refactoring.
2. **Small steps.** One extraction per commit. One rename per commit. One file split per commit.
3. **Verify after each step.** Full test suite. If it breaks, revert and investigate before continuing.
4. **Never refactor what you don't understand.** If the agent can't describe what a function does, it shouldn't touch it. Flag it for human review.

---

## Prioritization framework

Not all bad code needs fixing. Wasted refactoring effort is worse than no refactoring.

| Priority | Profile | Action |
|----------|---------|--------|
| **P0** | Bad + touched weekly + many dependents | Speed 2 + Speed 3 |
| **P1** | Bad + touched monthly | Speed 2 only |
| **P2** | Bad + stable + rarely touched | Leave it. It's not hurting anyone. |
| **P3** | Bad + isolated (no importers) | Delete it if unused. Otherwise leave it. |

**The P2 rule is critical.** Refactoring stable, working, rarely-touched code is vanity work. It creates risk (regression) without payoff (nobody reads it). Save your energy for code that agents actually need to work in.

---

## The module boundary strategy

For the absolute worst modules — the ones that are both large (500+ LOC) and deeply tangled:

1. **Define the target interface.** Before touching implementation, write the clean API as a TypeScript type/interface. This is the contract.
2. **Build the clean version alongside the old.** New files, new functions, following all principles. The new code can call the old code internally during transition.
3. **Migrate callers one by one.** Each caller gets its own PR. Update the import, verify tests pass.
4. **Delete the old code.** When zero callers remain, delete the old files.

This is the **Strangler Fig** pattern. It's the safest approach for replacing tangled code because at every step, both the old and new versions work. There's no "halfway through the rewrite and nothing compiles" state.

---

## Agent-specific considerations

### Task sizing

One agent session = one of these atomic tasks:
- Extract one function from a god function into its own file.
- Split one 300-LOC file into 2-3 focused files.
- Add characterization tests for one untested exported function.
- Rename + move one concept to its correct file.
- Replace one boolean-flag state machine with a discriminated union.
- Separate one mixed-concern hook into a pure function + a thin hook wrapper.

**Never:** "Refactor the entire scoring module."
**Always:** "Extract the delta computation from `optimizeDeckParallel()` into `compute-delta.ts`."

### What the agent needs per task

1. The principles document (in its system instructions).
2. The target file.
3. The target file's tests.
4. A one-sentence description of what to extract or fix.
5. Explicit permission to create new files.

Keep the scope tight. The agent's strength is local, focused work. Its weakness is large-scale judgment.

### SRP review pass

Since the agent is weak at self-enforcing SRP, add a dedicated review step after each refactoring task:

```
Review the following diff for Single Responsibility violations.

For each file: describe what it does in ONE sentence. If you need "and", flag it.
For each function: does it COMPUTE or ORCHESTRATE? If both, flag it.
For each component: does it RENDER or MANAGE STATE? If both, flag it.

List violations only. Do not fix them.
```

This is cheap (read-only, small context) and catches what the first pass missed. The human reviews the flagged items and decides which to fix.

---

## Measuring progress

Track monthly. The trend matters, not the absolute number.

| Metric | What it measures | Target direction |
|--------|-----------------|-----------------|
| Files over 150 LOC | Remaining god files | Down |
| Functions over 40 LOC | Remaining god functions | Down |
| Average file LOC (non-test) | Overall code density | Down toward 80-100 |
| Clean file % | Files passing all principle checks | Up |
| Test-to-source ratio | Test coverage density | Up toward 1:1 |

Don't track daily. Monthly is enough. If the trend is wrong, investigate why — usually containment is leaking (new bad code landing) or Speed 2 isn't happening (agents not refactoring on touch).

---

## What NOT to do

- **Don't big-bang rewrite.** It always takes 3x longer than estimated, ships 0 features during, and introduces as many bugs as it fixes.
- **Don't refactor without tests.** You'll "refactor" behavior changes into the code without knowing.
- **Don't refactor code you don't understand.** You'll break implicit contracts.
- **Don't combine refactoring with feature work in the same commit.** Makes it impossible to revert one without the other.
- **Don't track "refactoring debt" in a backlog.** It grows forever and nobody works on it. The three-speed approach replaces the backlog with a living process.
- **Don't aim for 100% compliance.** The P2 code exists and that's OK. Aim for "every agent interaction leaves the code better than it found it."

---

## Timeline expectations

**Month 1:** Containment holds. All new code follows principles. Agents work faster in new code.

**Month 3:** Speed 2 shows results. High-traffic files are noticeably cleaner. Agent error rate on frequently-modified files decreases.

**Month 6:** Speed 3 has addressed the top 20 worst files. Module boundaries are clean. Some legacy internals remain messy but contained behind clean interfaces.

**Month 12:** 50-60% of actively-maintained code follows principles. The clean code is easy to work in. The remaining bad code is either stable (P2, leave it) or on the cleanup schedule.

**The goal is not a clean codebase. The goal is a codebase where every agent interaction is efficient and correct.**

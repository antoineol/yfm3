# Refactoring Strategy

## Three speeds

### Speed 1 & 2: Automatic

Baked into CLAUDE.md. Every agent session gets the principles and refactor-on-touch rule. New code follows principles (Speed 1). Touched code gets cleaned (Speed 2). Nothing to run.

### Speed 3: Targeted refactoring

A simple loop, run as often as desired:

```
FIND ONE THING TO IMPROVE → PROPOSE → HUMAN APPROVES → IMPLEMENT
```

The agent reads the principles, explores the code, identifies one high-impact improvement, and proposes it. After approval, it implements. Each iteration is independent — fresh eyes, no backlog, no pre-computed list.

---

## Running Speed 3

### Manual

Start a conversation and paste:

> Read `docs/refact/principles.md` and check `docs/refact/log.md` for recent work. Explore the codebase and find one high-impact principle violation — prefer structural issues (mixed responsibilities, god files, tangled dependencies) over cosmetic ones. Propose a concrete fix: what to change, why, and expected scope. Wait for my approval. After implementing, append one entry to `docs/refact/log.md`.

After the agent proposes, review it and approve or redirect. The agent implements, runs checks (per CLAUDE.md), and logs the result.

### Orchestrated (sub-agents)

> Read `docs/refact/principles.md` and check `docs/refact/log.md` for recent work. Run one refactoring iteration: launch a sub-agent to find one high-impact principle violation — prefer structural over cosmetic. Present the proposal to me. After I approve, launch a fresh sub-agent to implement it. After implementation, append one entry to `docs/refact/log.md` and report what was done.

A fresh sub-agent for implementation gives it a clean perspective — the same agent that diagnosed the problem may have blind spots about the fix.

---

## Evaluating proposals

These criteria help you judge whether a proposal is worth approving.

**Structural impact over cosmetics.** A good iteration tackles something that makes the codebase meaningfully easier to work in. Renaming a variable is not a meaningful iteration. Adding a comment is not. There is no upper bound on what "one improvement" can look like — it could be rewriting a function, decomposing a god file into focused modules, restructuring a directory, or rearchitecting an entire workflow across multiple files. The right scope is whatever it takes to make one area of the code properly match the principles.

**Right target.** A 400-LOC file with mixed responsibilities imported by 10 others matters more than a slightly-too-long function in a leaf file. Code that agents modify frequently benefits most from cleanup.

**Scope coherence.** If the proposed change spans ~8+ files, check: are these all part of one concern, or has the agent drifted into two? Decomposing one god file into 6 focused files is fine (one concern). Fixing module A and also restructuring module B is two iterations.

**Correctness.** The goal is improving structure, not changing behavior. But "preserving correctness" doesn't mean timid changes — rewriting and restructuring are fine as long as behavior is covered by tests. Tests may need updating to reflect new structure while covering the same behavior.

---

## The one hard constraint

**The agent proposes, the human approves.** No auto-approving refactoring plans. The agent is strong at local judgment (this function is doing too much, here's how to split it) but weak at large-scale judgment (is this the right thing to fix right now? does this decomposition miss a cross-cutting concern?). The human review catches what the agent can't see.

---

## Log

After each iteration, append one line to `docs/refact/log.md`:

```
YYYY-MM-DD | file(s) touched | what was done (< 80 chars)
```

This lets the next agent avoid re-proposing recent work. If the log exceeds 100 lines, archive older entries to `docs/refact/log-archive.md`.

---

## Cadence

One iteration at a time. Let each change live in the codebase during normal work before starting the next — if something breaks, catch it before compounding.

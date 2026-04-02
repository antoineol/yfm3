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

Start a conversation and say something like:

> Read `docs/refact/principles.md`. Explore the codebase and find one significant violation that would meaningfully improve code quality if fixed. Propose a concrete fix — what to change and why. Wait for my approval before changing anything.

After approval, the agent implements using its judgment on the best approach.

### Orchestrated (sub-agents)

> Read `docs/refact/principles.md` and `docs/refact/refactoring-strategy.md`.
> Run one refactoring iteration: launch a sub-agent to find one significant principle violation and propose a fix. Present the proposal to me. After I approve, launch a fresh sub-agent to implement it. Report what was done.

A fresh sub-agent for implementation gives it a clean perspective — the same agent that diagnosed the problem may have blind spots about the fix.

---

## What makes a good iteration

**Picking the right target.** The agent should use judgment to find the highest-impact improvement — not just the first violation it spots. A 400-LOC file with mixed responsibilities imported by 10 others matters more than a slightly-too-long function in a leaf file. Code that agents modify frequently benefits most from cleanup.

**Scope.** One meaningful improvement per iteration. That might be extracting a responsibility from a god file, rewriting a confused function, or splitting a mixed-concern component. It could be small (rename + restructure one function) or large (decompose an entire file into focused modules). The right scope is whatever makes sense for the specific situation.

**Preserving correctness.** The goal is improving structure, not changing behavior. But "preserving correctness" doesn't mean "existing tests must pass byte-for-byte unchanged." If rewriting a section is the right approach, rewrite it — and update tests to reflect the new structure while covering the same behavior. Use judgment: the test suite is a safety net, not a straitjacket.

**Adapting during implementation.** The proposal is a starting point. If the agent discovers a better approach, a hidden dependency, or a reason to adjust scope during implementation, it should adapt and explain what changed. Rigid plan-following produces worse results than informed judgment.

---

## The one hard constraint

**The agent proposes, the human approves.** No auto-approving refactoring plans. The agent is strong at local judgment (this function is doing too much, here's how to split it) but weak at large-scale judgment (is this the right thing to fix right now? does this decomposition miss a cross-cutting concern?). The human review catches what the agent can't see.

---

## Cadence

One iteration at a time. Let each change live in the codebase during normal work before starting the next — if something breaks, catch it before compounding. Don't treat this as a sprint to clean everything. Steady, judgment-driven progress.

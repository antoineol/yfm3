# Refactoring — Usage Guide

## Speed 1 & 2: Automatic

Baked into CLAUDE.md. Every agent session gets principles + refactor-on-touch. Nothing to do.

## Speed 3: Targeted refactoring

### Pick a target

Open `tracker.md`. Start mid-priority (rank 5-10) for your first 2-3 iterations. Move to top after you trust the process. Skip files you're about to change for features (let Speed 2 handle it).

### Run one iteration

5 steps. Each is a fresh agent context. Prompts are in `speed3-operations.md`.

| Step | Who | Does what | Edits code? |
|------|-----|-----------|-------------|
| 1. AUDIT | Agent | Diagnoses violations, writes `audits/[name].audit.md` | No |
| 2. PLAN | Agent | Designs extractions, writes `plans/[name].plan.md` | No |
| **3. REVIEW** | **You** | **Read the plan. Approve, edit, or reject.** | — |
| 4. EXECUTE | Agent (fresh) | Follows plan, one commit per extraction, stops on failure | **Yes** |
| 5. VERIFY | Agent (fresh) | Re-audits, compares before/after, appends to audit file | No |
| 6. DIGEST | **You** | Update tracker, note surprises, wait 1-2 days before next | — |

**The one rule:** Never skip the REVIEW gate between PLAN and EXECUTE.

### Manual vs orchestrated

**Manual (first 2-3 iterations, priority #1-5):** You paste each prompt from `speed3-operations.md` into a separate conversation.

**Orchestrated (after calibration, priority #10+):** Ask the agent to run steps 1-5 as sub-agents. It must pause after PLAN for your approval. Prompt:

```
Run a refactoring iteration on `src/[TARGET FILE PATH]`
following `docs/refact/usage.md` and `docs/refact/speed3-operations.md`.
Pause after PLAN for my approval before proceeding to EXECUTE.
```

Don't orchestrate files with no test coverage, after a failed iteration, or targets you don't understand well.

### Cadence

1 iteration/week to start. Max 1/day at steady state. Always wait 1-2 days between iterations on different targets.

### When things go wrong

| Symptom | Fix |
|---------|-----|
| Agent changes code outside the plan | Revert, re-run EXECUTE with tighter constraints |
| Tests break after extraction | Revert the commit, check for moved side-effects |
| New files over 150 LOC | Plan wasn't granular enough — redo PLAN |
| Agent combines extractions in one commit | Revert, emphasize "one commit per extraction" |

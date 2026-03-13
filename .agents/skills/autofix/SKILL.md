---
name: autofix
description: Clean the current branch's pull request until it is review-clean. Use when the user wants unresolved review comments triaged, applicable fixes implemented, threads answered and resolved, checks waited on, and the loop repeated until no actionable review threads remain and required checks pass. Do not use for a one-off code fix with no PR follow-up loop.
---

# Autofix

Use this skill when the task is to drive a PR to a clean state, not just to fix one issue.

## Inputs

- Optional PR number
- Optional branch name
- Otherwise use the PR for the current branch

## Workflow

1. Detect the PR and current PR head SHA.
2. Inspect unresolved review threads.
3. For each unresolved thread:
   - decide whether it is still applicable to the current diff
   - reject outdated, out-of-scope, or over-engineered suggestions
   - if applicable, implement the smallest correct fix
   - run the narrowest relevant local verification
   - only after the fix is pushed, reply with the commit SHA and resolve the thread
   - if declining, reply factually and resolve only if appropriate
4. If code changed:
   - commit
   - push
5. Wait for checks on the latest PR head.
   - Prefer `gh pr checks <pr-number> --watch --required --interval 10`
   - After that returns, re-check the PR head SHA so you do not trust stale results
   - Then inspect status again for non-required review bots still running
6. Re-fetch unresolved review threads.
7. Repeat until:
   - no unresolved review threads remain that still need action
   - required checks pass on the latest PR head
   - non-required review bots have finished or have not produced new actionable threads

## Decision Rules

- Keep fixes aligned with the PR's actual goal.
- Prefer KISS over convenience.
- Do not widen the PR with unrelated cleanup.
- Prioritize correctness, regressions, portability, data loss, security, and CI failures.
- If the branch carries unrelated historical changes, call that out explicitly instead of pretending they belong to the current task.

## Replies

- Be factual.
- Mention the commit SHA when you fixed something.
- Do not claim a thread is fixed until the commit is pushed.
- If a comment is outdated, say that directly.

## Useful Commands

- `gh pr view <pr> --json headRefOid,statusCheckRollup,url`
- `gh pr diff <pr>`
- `gh pr checks <pr> --watch --required --interval 10`
- GraphQL review-thread reply and resolve mutations

Use repo helper scripts when they simplify the loop, but do not depend on tools that are specific to a different agent if the same result is easier to achieve directly.

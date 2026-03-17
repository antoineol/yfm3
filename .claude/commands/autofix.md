Drive the current branch's PR to a clean state: CI green + no actionable review threads.

## Autonomy

Run the full loop without stopping. Never ask — proceed with best judgment. On failure, fix and retry.

## Loop

Repeat until done (max 10 iterations):

### 1. Wait for CI

```bash
gh pr checks <pr> --watch --interval 10
```

If the command exits non-zero, CI failed — proceed to step 2 with that context.
If checks haven't appeared yet (empty output or error), sleep 15s and retry up to 20 times.
After `--watch` returns, verify the PR head SHA matches your local HEAD — if stale, `git push --force-with-lease` and restart the wait.

### 2. Gather state

- **CI failures** (if CI failed): `gh run list -b <branch> --limit 5 --json databaseId,name,conclusion` to find failed runs, then `gh run view <id> --log-failed` per failed job. Keep only actionable lines (strip ANSI, timestamps).
- **Unresolved threads**: `.claude/scripts/fetch-review-threads.sh <pr> --skip-autofix`
- **PR diff**: `GH_PAGER=cat gh pr diff <pr> | head -2000`

### 3. Exit check

If CI passed AND no unresolved threads → done. Print the PR URL and stop.

### 4. Fix

**CI failures first** — fix whatever is broken (test, lint, schema drift). For schema drift: `RAILS_ENV=test bin/rails db:migrate`.

**Then review threads** — classify each:
- **Fix**: demonstrable bug, crash, data loss, clear CLAUDE.md violation → minimal surgical fix
- **Decline**: style preference, hypothetical edge case, over-engineering, refactor suggestion, reviewer misunderstanding the code

**Bot reviewers** (CodeRabbit, Cursor, `[bot]` suffix) are noisy — default to declining. Only fix clear, demonstrable bugs.
**Human reviewers** — lean toward fixing. Decline only when objectively wrong or out of scope.

### 5. Verify locally

Run `.claude/scripts/verify-changes.sh --base <base_branch>` and fix until green.

### 6. Commit & push

If files changed:
```
git add -A && git commit -m "[autofix] <description> (iteration N)"
```

Push: `git push --force-with-lease`

### 7. Reply to threads

For each thread, reply via `.claude/scripts/reply-and-resolve-thread.sh <thread_id> "<action> (<short_sha>)\n\n<!-- autofix-bot -->" <pr>`:
- Fixed: mention what was fixed + commit SHA
- Declined: short factual reason

Then loop back to step 1.

## Rules

- Keep fixes aligned with the PR's goal. Do not widen the PR.
- Never claim fixed until pushed.
- Do not reply to threads before pushing the fix commit.
- Prefer KISS. No defensive code, extra abstractions, or tests beyond what's needed.

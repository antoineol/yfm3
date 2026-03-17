---
name: Code review mindset
description: During autofix, never assume existing code is good. Challenge every pattern, consolidate aggressively, earn every line.
type: feedback
---

When doing autofix / code review, do NOT assume existing code patterns are intentional or good. The whole point of review is to fix bad patterns.

**Why:** User was frustrated when I declined review comments by rationalizing that existing code was "intentional design" when it was actually just how the code happened to be written. Defending bad patterns is the opposite of what code review should do.

**How to apply:**
- Default to "this can be improved" not "this was intentional"
- When a reviewer suggests consolidation/simplification, take it seriously — don't find excuses
- Apply AGENTS.md principle: "Earn every added line" — minimize PR LOC aggressively
- Don't be lazy to address bad patterns. Simplify, consolidate, deduplicate.

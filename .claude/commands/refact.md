---
name: refact
description: Find and fix one high-impact principle violation in the codebase. Fully autonomous — explore, plan, implement, verify.
allowed-tools: Agent, Read, Write, Edit, Glob, Grep, Bash, TodoWrite
---

Read `docs/refact/principles.md` and check `docs/refact/log.md` for recent work. Explore the codebase, find one high-impact principle violation — prefer structural issues (mixed responsibilities, god files, tangled dependencies) over cosmetic ones — then fix it. Append one entry to `docs/refact/log.md`.

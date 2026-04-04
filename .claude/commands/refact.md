---
name: refact
description: Find and fix one high-impact principle violation in the codebase. Autonomous exploration, human approval before implementation.
allowed-tools: Agent, Read, Write, Edit, Glob, Grep, Bash, TodoWrite
---

Read `docs/refact/principles.md` and check `docs/refact/log.md` for recent work. Explore the codebase and find one high-impact principle violation — prefer structural issues (mixed responsibilities, god files, tangled dependencies) over cosmetic ones. Propose a concrete fix: what to change, why, and expected scope. Wait for my approval. After implementing, append one entry to `docs/refact/log.md`.

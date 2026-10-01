---
name: build-context
description: Build and validate an exact-reference Slice Manifest and bounded role-specific Context Pack.
---

# Build Context

- Inputs: task, affected IDs, relation policy, code map, profile budget.
- Include required artifacts/paths with reasons; optional material stays on-demand.
- Exclude archived, superseded, unrelated, and prohibited scope.
- Record baseline/hash; fail on unresolved required ID or overflow.
- Use `bin/sdlc.js context`; never silently truncate required facts.


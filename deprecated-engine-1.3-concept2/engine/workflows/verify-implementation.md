---
schema: royascaff/workflow-definition/v1
name: verify-implementation
version: 1
purpose: Prove implemented tasks conform to approved deltas using deterministic evidence and focused semantic review.
steps:
  - id: deterministic
    skill: verify-change
  - id: semantic
    skill: verify-change
    requires: [deterministic]
---

# Verify Implementation

Validate metadata/baseline/context, compare changed files to task ownership/code map, run build/type/lint/test/contract/architecture checks, then compile a bounded semantic-review context. Deterministic failure blocks verification. Blocking/high semantic findings require disposition.

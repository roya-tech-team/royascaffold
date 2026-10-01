---
document_id: DOC-ENG-TESTS
title: Tests
layer: implementation
schema_version: 2
document_status: approved
owners: [roya-team]
---

# Tests

> **What:** which test proves which requirement, and how it runs
> **Read when:** adding tests, or when a requirement has no evidence

A test with `- **Check:** runner:test` is proven by a passing `royascaff check`. Use `manual` for checks a person does.

### TEST-ENG-001 · The guard warns for the working copy and not for the pinned copy

- **Owner:** roya-team
- **Check:** runner:test
- **Verifies:** REQ-ENG-001

### TEST-ENG-002 · The pinned tool script runs the pinned copy and never the working copy

- **Owner:** roya-team
- **Check:** runner:test
- **Verifies:** REQ-ENG-002

## Record format (example)

```md
### TEST-ENG-001 · Results list tests

- **Owner:** roya-team
- **Check:** runner:test
- **Verifies:** REQ-ENG-001
```

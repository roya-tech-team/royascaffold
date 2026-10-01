---
document_id: DOC-{{CODE}}-TESTS
title: Tests
layer: implementation
schema_version: 2
document_status: approved
owners: [{{OWNER}}]
---

# Tests

> **What:** which test proves which requirement, and how it runs
> **Read when:** adding tests, or when a requirement has no evidence

A test with `- **Check:** runner:test` is proven by a passing `royascaff check`. Use `manual` for checks a person does.

## Record format (example)

```md
### TEST-{{CODE}}-001 · Results list tests

- **Owner:** {{OWNER}}
- **Check:** runner:test
- **Verifies:** REQ-{{CODE}}-001
```

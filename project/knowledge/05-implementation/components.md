---
document_id: DOC-ENG-COMPONENTS
title: Components
layer: implementation
schema_version: 2
document_status: approved
owners: [roya-team]
---

# Components

> **What:** the parts of the code that own each responsibility, and their `Code:` globs
> **Read when:** finding where a feature lives in the code, or deciding where new code goes

<!-- royascaff:summary:start -->
| ID | Title | Kind | State | Feature | Verified by |
|---|---|---|---|---|---|
| CMP-ENG-001 | Engine library | component | — | — | — |
| CMP-ENG-002 | Command line entry | component | — | — | — |
| CMP-ENG-003 | Adapters | component | — | — | — |
| CMP-ENG-004 | Tests | component | — | — | — |
| CMP-ENG-005 | Release scripts | component | — | — | — |
| CMP-ENG-006 | Reference runner | component | — | — | — |
<!-- royascaff:summary:end -->

Every source file of an app should belong to a component (`royascaff validate` reports the ones that do not).

### CMP-ENG-001 · Engine library

- **Owner:** roya-team
- **Code:** engine/lib/**
- **Realizes:**

### CMP-ENG-002 · Command line entry

- **Owner:** roya-team
- **Code:** engine/bin/**
- **Realizes:**

### CMP-ENG-003 · Adapters

- **Owner:** roya-team
- **Code:** engine/adapters/**
- **Realizes:**

### CMP-ENG-004 · Tests

- **Owner:** roya-team
- **Code:** engine/tests/**
- **Realizes:**

### CMP-ENG-005 · Release scripts

- **Owner:** roya-team
- **Code:** engine/scripts/**
- **Realizes:**

### CMP-ENG-006 · Reference runner

- **Owner:** roya-team
- **Code:** engine/runner-reference/**
- **Realizes:**

## Record format (example)

```md
### CMP-ENG-001 · Results page

- **Owner:** roya-team
- **Code:** apps/web/src/results/**
- **Realizes:** REQ-ENG-001
- **Implements:** CTR-ENG-001
```

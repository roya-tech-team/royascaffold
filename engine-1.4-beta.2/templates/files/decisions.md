---
document_id: DOC-{{CODE}}-DECISIONS
title: Decisions
layer: design
schema_version: 2
document_status: approved
owners: [{{OWNER}}]
---

# Decisions

> **What:** material technical choices (ADR-): the options, the choice, and why
> **Read when:** before choosing a pattern, library, data shape or UI approach

Add one with `royascaff new record decision "<the choice>"`. Check here before choosing something new: reuse beats reinvention.

## Record format (example)

```md
### ADR-{{CODE}}-001 · Use server-rendered pages for client results

- **Owner:** {{OWNER}}
- **Supports:** REQ-{{CODE}}-001

**Options:** single-page app · server-rendered pages · static export.
**Choice:** server-rendered pages.
**Why:** results must be fresh and indexable, and the team already runs the server.
**Consequences:** interactive charts need a small client script.
```

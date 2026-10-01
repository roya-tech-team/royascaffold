---
document_id: DOC-{{CODE}}-RULES
title: Project rules
layer: design
schema_version: 2
document_status: approved
owners: [{{OWNER}}]
---

# Project rules

> **What:** the rules specific to this project that every change must follow (RULE-)
> **Read when:** designing or building anything; rules are included in full in every Context Pack that links them

Add one with `royascaff new record rule "<the rule>"`. General technology rules live in the adapter cards; only this project's own rules belong here.

## Record format (example)

```md
### RULE-{{CODE}}-001 · Dates are shown in the client's time zone

- **Owner:** {{OWNER}}
- **Applies to:** CMP-{{CODE}}-001

Every date on screen uses the client's time zone from the campaign, never the browser's. Breaking it looks like a post landing on the wrong day.
```

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
### RULE-{{CODE}}-001 · The scene never branches on sample names

- **Owner:** {{OWNER}}
- **Applies to:** CMP-{{CODE}}-001

Rendering reads only generic fields (type, importance). Sample names live in the data module.
```

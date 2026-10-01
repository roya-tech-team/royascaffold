---
document_id: DOC-{{CODE}}-RELEASES
title: Releases
layer: release
schema_version: 2
document_status: approved
owners: [{{OWNER}}]
---

# Releases

> **What:** what was shipped, when, and which changes each release includes (REL-)
> **Read when:** releasing, or asking "is this feature live?"

Add one with `royascaff new record release "<version>" --includes CHG-…,CHG-…`. Features whose changes are all in a release show 🚀 Released.

## Record format (example)

```md
### REL-{{CODE}}-001 · 1.0.0 — first public demo

- **Owner:** {{OWNER}}
- **Includes:** CHG-{{CODE}}-001, CHG-{{CODE}}-002
- **Date:** 2026-10-15

Deployed to the demo host; smoke check by the product owner.
```

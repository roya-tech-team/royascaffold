---
document_id: DOC-{{CODE}}-ROADMAP
title: Features and roadmap
layer: roadmap
schema_version: 2
document_status: approved
owners: [{{OWNER}}]
---

# Features and roadmap

> **What:** every feature, its horizon (Now / Next / Later / Backlog) and its slices
> **Read when:** planning work, or asking "what is planned?"

Add features with `royascaff new feature "<title>" --horizon now|next|later|backlog` and slices with `royascaff new slice CAP-… "<title>" --delivers REQ-…`. States and progress are computed and shown in `STATUS.md`. Never type them here.

## Record format (example)

```md
## CAP-{{CODE}}-001 · Campaign results for clients

- **Owner:** {{OWNER}}
- **Priority:** must
- **Horizon:** now
- **Outcome:** OUT-{{CODE}}-001

Clients see how their campaigns perform without asking the agency.

| Slice | Title | Order | Depends on | Delivers | Planned at |
|---|---|---|---|---|---|
| SLC-{{CODE}}-001-A | Reach table | 1 | — | REQ-{{CODE}}-001 | a1b2c3d |
```

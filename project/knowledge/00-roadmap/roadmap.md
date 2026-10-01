---
document_id: DOC-ENG-ROADMAP
title: Features and roadmap
layer: roadmap
schema_version: 2
document_status: approved
owners: [roya-team]
---

# Features and roadmap

> **What:** every feature, its horizon (Now / Next / Later / Backlog) and its slices
> **Read when:** planning work, or asking "what is planned?"

Add features with `royascaff new feature "<title>" --horizon now|next|later|backlog` and slices with `royascaff new slice CAP-… "<title>" --delivers REQ-…`. States and progress are computed and shown in `STATUS.md`. Never type them here.

## CAP-ENG-001 · Develop the engine with itself

- **Owner:** roya-team
- **Priority:** should
- **Horizon:** now
- **Outcome:** OUT-ENG-001

The engine is changed through its own flow (changes, tasks, checks, evidence) by a pinned copy of itself.

_Describe the user value in one or two sentences._

| Slice | Title | Order | Depends on | Delivers | Planned at |
|---|---|---|---|---|---|

## Record format (example)

```md
## CAP-ENG-001 · Campaign results for clients

- **Owner:** roya-team
- **Priority:** must
- **Horizon:** now
- **Outcome:** OUT-ENG-001

Clients see how their campaigns perform without asking the agency.

| Slice | Title | Order | Depends on | Delivers | Planned at |
|---|---|---|---|---|---|
| SLC-ENG-001-A | Reach table | 1 | — | REQ-ENG-001 | a1b2c3d |
```

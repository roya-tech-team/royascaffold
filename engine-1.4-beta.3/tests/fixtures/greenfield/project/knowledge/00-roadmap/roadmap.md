---
document_id: DOC-CAMP-ROADMAP
title: Features and roadmap
layer: roadmap
schema_version: 2
document_status: approved
owners: [product-owner]
---

# Features and roadmap

> **What:** every feature, its horizon (Now / Next / Later / Backlog) and its slices
> **Read when:** planning work, or asking "what is planned?"

## CAP-CAMP-001 · Create campaigns

- **Owner:** product-owner
- **Priority:** must
- **Horizon:** now
- **Outcome:** OUT-CAMP-001

A planner creates a campaign for a client with a name, dates and channels.

| Slice | Title | Order | Depends on | Delivers | Planned at |
|---|---|---|---|---|---|
| SLC-CAMP-001-A | Campaign form and list | 1 | — | REQ-CAMP-001, REQ-CAMP-002 | a1b2c3d |

## CAP-CAMP-002 · Schedule posts

- **Owner:** product-owner
- **Priority:** must
- **Horizon:** now
- **Outcome:** OUT-CAMP-001

Planners add posts to a campaign calendar and move them between days.

| Slice | Title | Order | Depends on | Delivers | Planned at |
|---|---|---|---|---|---|
| SLC-CAMP-002-A | Calendar with posts | 1 | SLC-CAMP-001-A | REQ-CAMP-003 | a1b2c3d |
| SLC-CAMP-002-B | Drag posts between days | 2 | SLC-CAMP-002-A | REQ-CAMP-004 | a1b2c3d |

## CAP-CAMP-003 · Client approval

- **Owner:** product-owner
- **Priority:** should
- **Horizon:** next
- **Outcome:** OUT-CAMP-002

Clients review scheduled posts and approve or request changes.

| Slice | Title | Order | Depends on | Delivers | Planned at |
|---|---|---|---|---|---|
| SLC-CAMP-003-A | Approval link for clients | 1 | SLC-CAMP-002-A | REQ-CAMP-005 | a1b2c3d |

## CAP-CAMP-004 · Campaign analytics

- **Owner:** product-owner
- **Priority:** could
- **Horizon:** later

Show reach and engagement per campaign. Requirements outlined, not sliced yet.

## CAP-CAMP-005 · AI caption suggestions

- **Owner:** product-owner
- **Priority:** could
- **Horizon:** backlog

Idea: suggest captions from the campaign brief.

---
document_id: DOC-KUNI-TESTS
title: Knowledge Universe planned tests
layer: implementation
schema_version: 2
document_status: in-review
owners: [knowledge-universe-team]
---

# Planned tests

These are planned verification procedures, not executed evidence. PASS still requires later source-bound records.

### TEST-KUNI-001 · Launch and chrome

- **Kind:** test
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Method:** launch at 1440×900 and 1024×768; photograph first view and HUD regions
- **Covers:** `CRIT-KUNI-001`, `CRIT-KUNI-019`, `CRIT-KUNI-021`, `CRIT-KUNI-022`

### TEST-KUNI-002 · Graph structure

- **Kind:** test
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Method:** count nodes edges and types; visually confirm clusters and size hierarchy
- **Covers:** `CRIT-KUNI-002`, `CRIT-KUNI-003`, `CRIT-KUNI-004`, `CRIT-KUNI-018`

### TEST-KUNI-003 · Interaction

- **Kind:** test
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Method:** hover three types; select a hub and a peripheral; click empty canvas; observe panel fields
- **Covers:** `CRIT-KUNI-007`, `CRIT-KUNI-008`, `CRIT-KUNI-009`, `CRIT-KUNI-010`, `CRIT-KUNI-024`

### TEST-KUNI-004 · Controls and labels

- **Kind:** test
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Method:** Reset View, Toggle Labels, Toggle Auto Rotate, Randomize twice
- **Covers:** `CRIT-KUNI-011`, `CRIT-KUNI-012`, `CRIT-KUNI-013`, `CRIT-KUNI-014`, `CRIT-KUNI-015`

### TEST-KUNI-005 · Static quality and locality

- **Kind:** test
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Method:** `npm run typecheck`; review dependencies for no backend or identity; orbit 10 seconds
- **Covers:** `CRIT-KUNI-017`, `CRIT-KUNI-020`, `CRIT-KUNI-023`, `CRIT-KUNI-025`

### TEST-KUNI-006 · Visual polish versus reference

- **Kind:** test
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Method:** side-by-side 1440×900 review with `docs/reference/3d-network-reference.png` against unacceptable outcomes
- **Covers:** `CRIT-KUNI-005`, `CRIT-KUNI-006`, `CRIT-KUNI-016`
- **Authority class:** stakeholder-owner

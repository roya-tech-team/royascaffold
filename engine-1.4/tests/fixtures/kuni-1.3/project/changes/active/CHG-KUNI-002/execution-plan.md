---
document_id: DOC-KUNI-PLAN-002
title: Algorithms and timeline execution plan
layer: execution
schema_version: 1
document_status: approved
owners: [knowledge-universe-team]
---

# Execution plan

Change `CHG-KUNI-002`. Risk medium.

### TASK-KUNI-005 · Add years and local analysis

- **Kind:** task
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Goal:** generic year field, shortest path, and influence scores.
- **Input IDs:** `REQ-KUNI-019`, `REQ-KUNI-020`, `REQ-KUNI-023`, `CMP-KUNI-ALGO`, `INV-KUNI-006`, `ADR-KUNI-005`
- **Allowed paths:** `src/features/graph/types/`, `src/features/graph/data/`, `src/features/graph/analysis/`, `src/features/graph/state/`, `src/features/graph/config/`
- **Forbidden:** remote graph engines, dummy-name renderer branches
- **Done:** every node has a year; path and influence compute on arbitrary graphs
- **Handoff:** `TASK-KUNI-006`

### TASK-KUNI-006 · Surface path, semantics, and timeline

- **Kind:** task
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Goal:** Path and Influence modes, typed links, filters, and the year playhead.
- **Preconditions:** `TASK-KUNI-005`
- **Input IDs:** `REQ-KUNI-021`, `REQ-KUNI-022`, `REQ-KUNI-024`, `CMP-KUNI-TIMELINE`, `CMP-KUNI-SEMANTIC`, `WF-KUNI-PATH`, `WF-KUNI-TIMELINE`
- **Allowed paths:** `src/features/graph/`, `src/components/layout/`, `src/app/App.tsx`
- **Forbidden:** admin dashboards, real search
- **Done:** explorer can trace a path, read types, filter links, and scrub time
- **Handoff:** verify-change

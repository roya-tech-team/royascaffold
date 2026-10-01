---
document_id: DOC-KUNI-QUALITY
title: Knowledge Universe quality strategy
layer: quality
schema_version: 1
document_status: approved
owners: [knowledge-universe-team]
---

# Quality strategy

## Objectives

Prove that the first milestone looks and feels like a product-grade 3D network while remaining typed, local, and structurally ready to grow.

## Levels

| Level | Use |
|-------|-----|
| Static | Typecheck and dependency review |
| Observation | Launch, graph shape, hover, selection, controls, desktop layout |
| Visual | Compare polish to the reference image without copying it |

## Commands

- `npm run typecheck`
- `npm run dev`
- `npm run build` when a production bundle check is useful

## Evidence

PASS needs a command or observation record with time, environment, scope, and result. A checklist tick is not evidence.

## Release

This slice is a local prototype. There is no production release gate.

## Accepted risks

- No automated visual regression suite.
- Frame-rate floor is an assumption from `FND-KUNI-001`.
- Mobile is not an acceptance target.

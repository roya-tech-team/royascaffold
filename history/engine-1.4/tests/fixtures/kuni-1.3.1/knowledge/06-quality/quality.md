---
document_id: DOC-KUNI-QUALITY
title: Knowledge Universe quality strategy
layer: quality
schema_version: 2
document_status: in-review
owners: [product-owner]
---

# Quality strategy

## Objectives

Prove that the first visual universe meets the QDC without building the future platform. First-pass target B+. Final target A. See `ASM-KUNI-005`.

Designed quality lives in the QDC, RDRs, and patterns. Verification closes residual visual and interaction gaps with fresh evidence. It does not invent the product.

## Commands and environment

- `npm run dev` — local explorer runtime
- `npm run typecheck` — `CRIT-KUNI-023`
- `npm run build` / `npm run preview` — production bundle check
- Desktop browser at 1440×900; tablet check at 1024×768

`validate` does not execute these commands.

## Test levels

| Level | Owner | Use |
|-------|-------|-----|
| Typecheck | deterministic-runner | `TEST-KUNI-005` |
| Launch and HUD | implementer-self-check | `TEST-KUNI-001` |
| Graph structure | implementer-self-check | `TEST-KUNI-002` |
| Interaction and controls | implementer-self-check | `TEST-KUNI-003`, `TEST-KUNI-004` |
| Visual polish | stakeholder-owner | `TEST-KUNI-006` |

Implementer-self-check may collect evidence. It cannot be the sole closer for `CRIT-KUNI-016`.

## Evidence policy

PASS requires a source-bound evidence record: criterion, source revision or fingerprint, replay procedure, expected and actual result, scope, time, environment, executor, adjudicator, limitations, and freshness.

A relevant source, configuration, criterion, or implementation change makes evidence stale.

Unavailable runners yield `manual-required`, never PASS.

Visual evidence must record viewport, graph state, the reference file, and reviewer limits.

## Accepted risks

- No WCAG AA claim (`ASM-KUNI-004`).
- 30 fps floor is an approved assumption (`ASM-KUNI-001`).
- Mobile is basic.
- No automated visual-diff runner is bound.

## Release

No production release in this slice. Local preview is sufficient.

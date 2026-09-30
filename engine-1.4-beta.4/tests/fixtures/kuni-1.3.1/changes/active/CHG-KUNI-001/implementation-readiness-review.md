---
document_id: DOC-CHG-KUNI-001-IRR
title: Implementation readiness review — first visual universe
layer: change-quality
schema_version: 2
document_status: in-review
owners: [product-owner]
change_id: CHG-KUNI-001
review_id: REV-KUNI-IRR-001
review_type: implementation-readiness
disposition: pass-with-conditions
reviewer: fresh-context-reviewer
authority_class: fresh-context-reviewer
timestamp: 2026-08-20T18:25:00+03:00
---

# Implementation readiness review

### REV-KUNI-IRR-001 · Implementation readiness review

- **Kind:** review
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Review type:** implementation-readiness
- **Disposition:** pass-with-conditions
- **Authority class:** fresh-context-reviewer
- **Reviewer:** fresh-context-reviewer
- **Timestamp:** 2026-08-20T18:25:00+03:00
- **Change:** `CHG-KUNI-001`
- **Current SQR:** `REV-KUNI-SQR-001` pass-with-conditions, fingerprint `8fc2fb9fe970631b5a5e3de9f24d52d19a01d8ea37113a1c7905ff0a906de4d6`
- **Reviewed inputs:** `TASK-KUNI-001`, `TASK-KUNI-002`, `TASK-KUNI-003`, `TASK-KUNI-004`, `TASK-KUNI-005`, `TASK-KUNI-006`, `TASK-KUNI-007`, `REV-KUNI-SQR-001`
- **Input fingerprint:** `52ad0e7e3ff4ec8155720a0e688bb4c84587a3882086113b558c16240cfdfb35`
- **Limitation:** this review tests whether another implementer can execute without material invention. It does not award `CRIT-KUNI-016` and does not judge a running product.

## Verdict

An implementer absent from discovery can execute the seven Context Packs without choosing a material product, visual, content, architecture, or quality decision. Foundation tasks are ordered. Optional work cannot start first. SQR remains fresh.

Disposition is **pass-with-conditions**, not pass, because the SQR evidence conditions still travel with the plan.

## Consumer test

| Task | Material invention required? |
|------|------------------------------|
| `TASK-KUNI-001` | No. Stack, host, tokens, and non-goals are named. |
| `TASK-KUNI-002` | No. Types, default 180/420 graph, five named clusters, closed name lists, description template, importance and degree bands, and the edge-type table are named. |
| `TASK-KUNI-003` | No. Hues, radii, bloom, fog, stars, and edge treatment are numeric. `CRIT-KUNI-016` is not self-closed. |
| `TASK-KUNI-004` | No. Home pose, distances, damping, and `autoRotateSpeed` 0.4 are named. |
| `TASK-KUNI-005` | No. Hover/select scale, dim factor, hit area, neighborhood, and panel geometry are named. |
| `TASK-KUNI-006` | No. Label rule, HUD copy, chrome placement, and control semantics are named. |
| `TASK-KUNI-007` | No. Optional polish only; real search and a new product layer are forbidden. |

No pack silently truncates a required `CRIT`, `DEC`, `RDR`, or `PAT`. Estimated tokens sit well under each manifest budget.

## Trace and boundaries

- Every must `CRIT` is owned by a task. Should criteria sit on `TASK-KUNI-007` or are explicitly deferrable.
- Material `RDR-*` and `PAT-*` used by a task appear in that task’s implementer manifest.
- Allowed paths stay inside the client. Forbidden inventions repeat the change non-goals: Angular, Vue, backend, auth, live search, reference entities, meshes in Zustand.
- Adapters remain `generic` and `web-ui`. `web-api` stays rejected.

## Ordering

```text
TASK-KUNI-001 → TASK-KUNI-002 → TASK-KUNI-003 → TASK-KUNI-004 → TASK-KUNI-005 → TASK-KUNI-006
                                                                                 ↓
                                                                          TASK-KUNI-007 (optional)
```

Optional `TASK-KUNI-007` depends on foundation `TASK-KUNI-006`. Escalation on every task is: stop and return to design when a material decision is missing.

## Closed in owning sources before this fingerprint

These were consumer-test gaps. They were written into experience, data design, and task steps, then packs were regenerated. They are not closed only in this report.

1. Type hues, base radii, and the importance radius formula
2. Hover scale 1.12, select scale 1.18, ring 1.35x, dim 0.28, hit area 1.8x
3. Bloom 0.22 / threshold 0.82, fog, 280 stars, vignette 0.18
4. Five named clusters on a radius-22 ring, 180/420 default, importance and degree bands
5. Hub seed list, closed satellite lexicons, description template, prohibited reference names
6. Edge-type assignment table
7. Default label rule, label size 13px, panel 300×24×24, `autoRotateSpeed` 0.4, title/subtitle tokens

## Conditions

Conditions are residual evidence from `REV-KUNI-SQR-001`, not hidden redesign.

1. **Owner visual adjudication**
   - Owner: product-owner
   - Destination: `TEST-KUNI-006` / `CRIT-KUNI-016`
   - Closure: fresh visual evidence against the reference and the unacceptable-outcome list
2. **Performance assumption review**
   - Owner: knowledge-universe-team
   - Destination: `TEST-KUNI-005` / `ASM-KUNI-001`
   - Closure: 10-second orbit evidence; if the floor is wrong, update the assumption rather than silently lowering it

## Authority

High-judgment visual polish stays `stakeholder-owner`. This review uses `fresh-context-reviewer`, not implementer-self-check.

## Not in this review

Implementation, verification evidence, and owner taste. A material edit to a reviewed task or to `REV-KUNI-SQR-001` makes this review stale. Experience and data documents are required reading through the regenerated packs; if those documents change, regenerate the packs before implementing.

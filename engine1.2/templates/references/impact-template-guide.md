# Impact Analysis Template — Detailed Guide

> This is the verbose reference for `../impact-template.md`. Consult for the done-when checklist, detailed ripple-map format, and reuse-opportunity guidance.

## How to Use

1. Resolve the scope and target app from `change-request.md`.
2. Search the **actual code** in the repos listed in `project/profile.md` — every layer.
3. Fill each section with file paths and concrete findings. Prefer evidence (paths, symbols) over prose.
4. End with a clear recommendation that Step 5.1 (Impact Analysis) can act on directly.

## Why This Exists

A feature may already be implemented (fully or partially), and a change in one place may ripple into other endpoints, services, or pages. Decisions must be based on what the code *actually* contains — not on assumptions or plan docs alone.

## Ripple / Impact Map (extended format)

When the change has broad impact, expand the Affected Modules section:

```md
## Ripple Map

| Affected item | Type | Relationship | Breaks if changed? | Action needed |
|---------------|------|--------------|:------------------:|---------------|
| endpoint/service/page | caller/callee/shares-model | yes/no | modify/add test/leave |

- Shared DTOs / schemas touched: ...
- Auth / role implications: ...
- Async jobs / queues / webhooks involved: ...
- Data migration required? yes/no — describe.
```

## Reuse Opportunities

Document existing services, endpoints, or components to reuse instead of creating new ones.

## Plan vs Code Drift

- Code that exists but is **not** in the plan docs: schedule reconciliation via this pack's blueprint (merge later) — do not edit main early
- Plan entries with **no** code yet: expected if feature is new; flagged if it should exist
- Pack blueprint files to create: list under impact (not main `project/plan` / `project/actions`)

Both must be reconciled by the end of the change.

## Done-When Checklist (AI uses this)

- [ ] All layers were checked in the **actual code**, not just the plan docs
- [ ] Feature state verdict chosen: none / partial / complete
- [ ] For `partial`, the implemented-vs-missing split is explicit
- [ ] Plan-vs-code drift recorded
- [ ] Ripple map lists every caller/callee a change could affect, each with an action
- [ ] Reuse opportunities identified
- [ ] Recommendation gives Step 5.1 a clear create / complete / modify list

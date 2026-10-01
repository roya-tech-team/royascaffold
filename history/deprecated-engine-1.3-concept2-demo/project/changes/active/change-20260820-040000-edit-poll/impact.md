---
schema: royascaff/impact/v1
change: CHG-20260820-040000
state: approved
baseline: v1.3-concept2-demo-initial
---

# Impact Analysis — Edit an open poll

| Concern | Assessment |
|---|---|
| Requirements | Moves poll editing from out-of-scope to a constrained owner capability. |
| Domain | Adds an edit invariant to `DOM-POLL`: open, owner, zero votes. |
| Workflow | Adds `WF-EDIT-POLL`, including the concurrent-first-vote failure branch. |
| HTTP/DTO | Adds an authenticated update route and `CTR-EDIT-POLL`; existing response remains compatible. |
| Service/repository | Extends both interfaces and implementations; persistence update must be atomic. |
| Data/migration | No schema migration if option identities remain stable and only labels change. |
| Security | Principal comes from JWT; creator ownership is checked by the API. |
| Web | Poll detail gains an owner-only edit affordance and form. |
| Tests | Adds authorization, state, validation, concurrency, and regression cases. |
| Rollout | Backward-compatible additive endpoint; remove UI affordance and route to roll back. |

Risk is medium because the change crosses web, HTTP, domain invariants, services, and persistence, but does not alter the database schema or existing public response shapes.

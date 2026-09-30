# RoyaScaff v1.3 Conventions

## Artifact metadata

Every canonical artifact declares: `id`, `type`, `title`, `module`, `owner`, `knowledge_status`, and `implementation_status` in a `yaml artifact` block.

Knowledge status: `draft`, `approved`, `deprecated`, `superseded`.

Implementation status: `planned`, `partial`, `implemented`, `verified`, `not-applicable`.

## IDs

| Prefix | Meaning |
|--------|---------|
| `REQ`, `NFR`, `SEC` | requirements/constraints |
| `ARCH`, `ADR` | architecture rule/decision |
| `DOM`, `WF` | domain/workflow |
| `CTR`, `DATA` | contract/data |
| `CMP`, `TEST` | component/test intent |
| `CHG`, `TASK` | change/execution task |

IDs are stable, unique, and never reused. Artifact IDs use a scoped uppercase token and stable suffix. Change IDs use local datetime `CHG-YYYYMMDD-HHMMSS`, with four lowercase hex characters on collision.

## Typed relations

Use: `satisfies`, `constrained_by`, `realized_by`, `uses`, `maps_to`, `implemented_by`, `implements`, `depends_on`, `verified_by`, `verifies`, `supersedes`, `superseded_by`, `affects`, and `owned_by`.

Every ID relation must resolve. Do not hide dependencies only in prose.

## Change states

```text
draft → analyzed → approved → planned → in-progress → implemented → verified → reconciled
```

`blocked` may return to its prior actionable stage. `abandoned` is terminal. Only verified changes reconcile.

## Evidence

Verification evidence records command/method, working directory/source, revision, time, outcome, and redacted output path. PASS without evidence is invalid. Semantic findings use severity and explicit disposition.

## Code map

Relations: `implements`, `defines`, `supports`, `configures`, `verifies`, `migrates`, `generates`.

Blueprint-worthy components contain business/security/persistence/I/O/public boundary/runtime entry/cross-module responsibility. Small private helpers use `supports` and name an owner.

## Generated files

Files under `project/indexes/` are generated views. Regenerate rather than edit them. Stale source hashes fail validation.

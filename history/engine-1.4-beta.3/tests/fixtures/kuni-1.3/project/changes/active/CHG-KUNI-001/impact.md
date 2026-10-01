# Impact

Greenfield slice. No existing product knowledge or code to preserve.

| Layer | State | Affected IDs | Reason |
|-------|-------|--------------|--------|
| Business/requirements | referenced | `OUT-KUNI-001`, `REQ-KUNI-001` | new product meaning |
| Domain/workflows | referenced | `WF-KUNI-EXPLORE`, `WF-KUNI-INSPECT` | new explorer flows |
| Architecture | changed | `ADR-KUNI-001` | new client stack |
| Data | changed | `CON-KUNI-NODE` | in-memory dummy graph |
| Experience | changed | `REQ-KUNI-016` | first HUD |
| Components/actions | changed | `CMP-KUNI-CANVAS`, `ACT-KUNI-SELECT` | first implementation |
| Quality | referenced | `TEST-KUNI-001` | observation plus typecheck |

Rollback: delete the client or revert the change. No migration and no production data.

Unknowns remain `FND-KUNI-001`, `FND-KUNI-002`, and `FND-KUNI-003` with recorded working interpretations.

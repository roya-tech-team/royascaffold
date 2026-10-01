---
document_id: DOC-POLLPULSE-ADR-002
title: Use SQLite for the demo
layer: design
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# ADR — SQLite Persistence

### ADR-POLLPULSE-002 · Use built-in SQLite for self-contained persistence

- **Kind:** architecture-decision
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `SVC-FOUND-01`, `DATA-USERS-001`, `DATA-POLLS-001`, `DATA-OPTIONS-001`, `DATA-VOTES-001`

Decision: use Node `node:sqlite` and a local file so the example runs without an external service. Consequences: simple setup and database constraints; no production scaling/HA plan; inline startup DDL rather than a migration history.


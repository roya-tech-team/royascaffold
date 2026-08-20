---
document_id: DOC-POLLPULSE-DEPLOYMENT
title: PollPulse deployment and runtime operations
layer: operations
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# Deployment and Runtime Operations

### OPS-DEPLOY-001 · Local demonstration deployment

- **Kind:** deployment-design
- **Knowledge status:** approved
- **Implementation status:** partial
- **Owner:** pollpulse-demo
- **Depends on:** `CMP-API-BOOT-001`, `CMP-WEB-BOOT-001`, `SVC-FOUND-01`
- **Constrained by:** `RISK-OPS-001`

Supported evidence is local: install dependencies, configure `.env`, start API on 3001, start/build web on 5173/static output. API creates SQLite file/schema on first start. No production packaging/topology/migration/rollback is present.

### OPS-OBS-001 · Health and error observation

- **Kind:** observability-design
- **Knowledge status:** approved
- **Implementation status:** partial
- **Owner:** pollpulse-demo
- **Realized by:** `EP-FOUND-01`, `CMP-API-ERROR-001`
- **Constrained by:** `RISK-OPS-001`

Health route and console logging of server errors are implemented. Structured logs, correlation IDs, metrics, traces, readiness/database check, alerts, SLOs, and dashboards are absent.

## Recovery

Local recovery is stop processes and restore/delete the SQLite file as appropriate. There is no backup/restore automation or data migration rollback. Never use destructive database recovery without an explicit backup/owner decision.


---
document_id: DOC-POLLPULSE-RUNBOOK-LOCAL
title: PollPulse local start runbook
layer: operations
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# Local Start Runbook

### RUN-LOCAL-001 · Start and validate PollPulse locally

- **Kind:** runbook
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Depends on:** `OPS-DEPLOY-001`, `EP-FOUND-01`, `TEST-WEB-BUILD-001`

1. Require Node ≥22.5 and npm.
2. In `example-v1.2/apps/api`, copy `.env.example` to `.env`, choose a non-default JWT secret, run `npm ci`, then `npm start`.
3. Confirm `GET http://localhost:3001/health` returns health contract.
4. In `example-v1.2/apps/web`, copy `.env.example` to `.env`, run `npm ci`, then `npm run dev`.
5. Register two members; create/vote/result/close as an exploratory check. Do not record this as verified unless scenario evidence is captured.
6. Stop both processes. The SQLite file remains under API data directory.

Troubleshoot: port/CORS/API URL mismatch, missing/weak secret, Node version, stale/invalid token, or corrupted/local database. No production escalation path exists.


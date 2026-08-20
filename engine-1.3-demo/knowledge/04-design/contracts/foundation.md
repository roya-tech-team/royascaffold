---
document_id: DOC-POLLPULSE-CTR-FOUNDATION
title: Foundation contracts
layer: design
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# Foundation Contracts

### CTR-HEALTH-001 · Health response

- **Kind:** response-contract
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Exposes:** `EP-FOUND-01`
- **Verified by:** `TEST-FOUND-001`

HTTP 200 JSON: `{ "status": "ok" }`. It proves process routing is alive but does not check database connectivity or dependency readiness.

### CTR-ERROR-001 · API error response

- **Kind:** response-contract
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `CMP-API-ERROR-001`

Non-success JSON: `{ "error": string }` with status chosen by `AppError` or 500. No stable machine error code/field-error structure is defined.


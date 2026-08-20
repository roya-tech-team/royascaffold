---
document_id: DOC-POLLPULSE-ACT-API
title: PollPulse API actions
layer: implementation
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# API Actions

### EP-FOUND-01 · GET /health

- **Kind:** http-action
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-FOUND-001`
- **Returns:** `CTR-HEALTH-001`
- **Realized by:** `CMP-API-BOOT-001`
- **Verified by:** `TEST-FOUND-001`

Public; no input; HTTP 200.

### EP-AUTH-01 · POST /auth/register

- **Kind:** http-action
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-AUTH-001`
- **Accepts:** `CTR-AUTH-REGISTER-001`
- **Returns:** `CTR-AUTH-RESPONSE-001`, `CTR-ERROR-001`
- **Realized by:** `CMP-AUTH-ROUTES-001`, `CMP-AUTH-CTRL-001`, `SVC-AUTH-01`
- **Verified by:** `TEST-AUTH-001`

Public; success 201; validation 400; duplicate 409.

### EP-AUTH-02 · POST /auth/login

- **Kind:** http-action
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-AUTH-002`
- **Accepts:** `CTR-AUTH-LOGIN-001`
- **Returns:** `CTR-AUTH-RESPONSE-001`, `CTR-ERROR-001`
- **Realized by:** `CMP-AUTH-ROUTES-001`, `CMP-AUTH-CTRL-001`, `SVC-AUTH-01`
- **Verified by:** `TEST-AUTH-001`

Public; success 200; invalid/missing credentials 401.

### EP-AUTH-03 · GET /auth/me

- **Kind:** http-action
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-AUTH-003`
- **Returns:** `CTR-AUTH-USER-001`, `CTR-ERROR-001`
- **Realized by:** `CMP-AUTH-ROUTES-001`, `CMP-API-AUTH-MW-001`, `CMP-AUTH-CTRL-001`, `SVC-AUTH-01`
- **Verified by:** `TEST-AUTH-001`

Bearer-authenticated; success 200; invalid token/member 401.

### EP-POLLS-01 · POST /polls

- **Kind:** http-action
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-POLLS-001`
- **Accepts:** `CTR-POLLS-CREATE-001`
- **Returns:** `CTR-POLLS-DETAIL-001`, `CTR-ERROR-001`
- **Realized by:** `CMP-POLLS-ROUTES-001`, `CMP-POLLS-CTRL-001`, `SVC-POLLS-01`
- **Verified by:** `TEST-POLLS-001`

Authenticated; success 201.

### EP-POLLS-02 · GET /polls

- **Kind:** http-action
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-POLLS-002`, `NFR-PERF-001`
- **Returns:** `CTR-POLLS-LIST-001`, `CTR-ERROR-001`
- **Realized by:** `CMP-POLLS-ROUTES-001`, `CMP-POLLS-CTRL-001`, `SVC-POLLS-01`
- **Verified by:** `TEST-POLLS-001`, `TEST-PERF-001`

Authenticated; optional page/limit query.

### EP-POLLS-03 · GET /polls/:id

- **Kind:** http-action
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-POLLS-003`, `REQ-RESULTS-001`
- **Returns:** `CTR-POLLS-DETAIL-001`, `CTR-ERROR-001`
- **Realized by:** `CMP-POLLS-ROUTES-001`, `CMP-POLLS-CTRL-001`, `SVC-POLLS-01`
- **Verified by:** `TEST-POLLS-001`, `TEST-RESULTS-001`

Authenticated; missing poll 404.

### EP-POLLS-04 · POST /polls/:id/vote

- **Kind:** http-action
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-VOTE-001`, `REQ-VOTE-002`
- **Accepts:** `CTR-POLLS-VOTE-001`
- **Returns:** `CTR-POLLS-DETAIL-001`, `CTR-ERROR-001`
- **Realized by:** `CMP-POLLS-ROUTES-001`, `CMP-POLLS-CTRL-001`, `SVC-POLLS-01`, `SVC-POLLS-03`
- **Verified by:** `TEST-VOTE-001`

Authenticated; success 200; invalid state/option 400; duplicate 409.

### EP-POLLS-05 · POST /polls/:id/close

- **Kind:** http-action
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-POLLS-004`
- **Returns:** `CTR-POLLS-DETAIL-001`, `CTR-ERROR-001`
- **Realized by:** `CMP-POLLS-ROUTES-001`, `CMP-POLLS-CTRL-001`, `SVC-POLLS-01`, `SVC-POLLS-02`
- **Verified by:** `TEST-POLLS-002`

Authenticated; creator-only; idempotent; success 200.


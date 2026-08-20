---
document_id: DOC-POLLPULSE-WF-AUTH
title: Authentication workflow
layer: domain
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# Authentication Workflow

### WF-AUTH-001 · Register, authenticate, and restore session

- **Kind:** workflow
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-AUTH-001`, `REQ-AUTH-002`, `REQ-AUTH-003`
- **Constrained by:** `INV-AUTH-001`, `NFR-SEC-001`
- **Realized by:** `EP-AUTH-01`, `EP-AUTH-02`, `EP-AUTH-03`, `CMP-WEB-AUTH-001`
- **Verified by:** `TEST-AUTH-001`, `TEST-SEC-001`

```mermaid
sequenceDiagram
    actor Member
    participant Web
    participant API
    participant DB
    Member->>Web: register or login
    Web->>API: credentials
    API->>DB: normalize/find/create/verify
    DB-->>API: member
    API-->>Web: JWT + safe member
    Web->>Web: store token and member
    Web->>API: GET /auth/me with bearer token on restore
    API->>DB: load current member
    API-->>Web: safe member or 401
```

Failures: invalid registration returns validation/conflict; invalid credentials are generic; missing/invalid token returns 401 and the web clears it. Token expiry is fixed at 7 days; no refresh flow exists.


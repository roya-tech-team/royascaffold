---
document_id: DOC-POLLPULSE-CMP-AUTH
title: Authentication components
layer: implementation
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# Authentication Components

### SVC-AUTH-01 · Authentication behavior service

- **Kind:** application-service
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Implements:** `REQ-AUTH-001`, `REQ-AUTH-002`, `REQ-AUTH-003`, `INV-AUTH-001`, `CTR-AUTH-RESPONSE-001`
- **Depends on:** `SVC-AUTH-02`
- **Verified by:** `TEST-AUTH-001`, `TEST-SEC-001`

Validates registration/login, hashes/verifies password, signs JWT, maps safe user, and returns current user.

### SVC-AUTH-02 · User repository and mapper

- **Kind:** repository
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Implements:** `DATA-USERS-001`, `CTR-AUTH-USER-001`
- **Depends on:** `SVC-FOUND-01`
- **Verified by:** `TEST-AUTH-001`

Creates/finds members and maps database row to safe response.

### CMP-API-AUTH-MW-001 · Bearer authentication middleware

- **Kind:** security-middleware
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Implements:** `REQ-AUTH-003`, `NFR-SEC-001`, `ADR-POLLPULSE-003`
- **Depends on:** `SVC-AUTH-02`
- **Verified by:** `TEST-AUTH-001`, `TEST-SEC-001`

Verifies bearer JWT and current database member; attaches safe request user or rejects.

### CMP-AUTH-CTRL-001 · Auth HTTP controller

- **Kind:** transport-controller
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `EP-AUTH-01`, `EP-AUTH-02`, `EP-AUTH-03`
- **Depends on:** `SVC-AUTH-01`
- **Verified by:** `TEST-AUTH-001`

Maps Express requests/responses/errors to authentication behavior.

### CMP-AUTH-ROUTES-001 · Auth route registration

- **Kind:** transport-router
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Exposes:** `EP-AUTH-01`, `EP-AUTH-02`, `EP-AUTH-03`
- **Depends on:** `CMP-AUTH-CTRL-001`, `CMP-API-AUTH-MW-001`
- **Verified by:** `TEST-AUTH-001`

### CMP-WEB-AUTH-001 · Browser authentication state

- **Kind:** interface-state-service
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Implements:** `WF-AUTH-001`, `ADR-POLLPULSE-003`
- **Depends on:** `CMP-WEB-API-001`
- **Verified by:** `TEST-AUTH-001`, `TEST-UX-001`

Restores current member, logs in/registers/logs out, maintains loading/user/authenticated state.

### CMP-WEB-AUTH-LAYOUT-001 · Authentication layout

- **Kind:** interface-component
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `PG-AUTH-01`, `PG-AUTH-02`
- **Verified by:** `TEST-UX-001`

Shared public authentication branding/card/link layout.

### CMP-WEB-PROTECTED-001 · Protected route guard

- **Kind:** interface-guard
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Implements:** `REQ-AUTH-003`
- **Depends on:** `CMP-WEB-AUTH-001`
- **Verified by:** `TEST-AUTH-001`, `TEST-UX-001`

Shows restore loading, redirects unauthenticated members to login, otherwise renders children.


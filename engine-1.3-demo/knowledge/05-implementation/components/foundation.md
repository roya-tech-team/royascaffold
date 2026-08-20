---
document_id: DOC-POLLPULSE-CMP-FOUNDATION
title: Foundation components
layer: implementation
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# Foundation Components

### CMP-API-BOOT-001 · API bootstrap

- **Kind:** runtime-entry
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Exposes:** `EP-FOUND-01`
- **Configures:** `SVC-FOUND-01`, `CMP-API-ERROR-001`, `CMP-AUTH-ROUTES-001`, `CMP-POLLS-ROUTES-001`
- **Verified by:** `TEST-FOUND-001`, `TEST-ARCH-001`

Loads config, initializes database, configures CORS/JSON, mounts health/auth/polls routes, installs error handler, and listens.

### SVC-FOUND-01 · SQLite database service

- **Kind:** persistence-infrastructure
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Implements:** `ADR-POLLPULSE-002`
- **Maps to:** `DATA-USERS-001`, `DATA-POLLS-001`, `DATA-OPTIONS-001`, `DATA-VOTES-001`
- **Verified by:** `TEST-FOUND-001`

Creates data directory/connection/schema/indexes and returns the initialized shared database.

### CMP-API-ERROR-001 · API error boundary

- **Kind:** middleware
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Implements:** `CTR-ERROR-001`
- **Verified by:** `TEST-ARCH-001`

Maps `AppError` status/message to JSON and logs server failures.

### CMP-WEB-BOOT-001 · Web bootstrap

- **Kind:** runtime-entry
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Configures:** `CMP-WEB-ROUTER-001`, `CMP-WEB-AUTH-001`
- **Verified by:** `TEST-WEB-BUILD-001`

Mounts React strict mode, browser router, authentication provider, application, and global styles.

### CMP-WEB-ROUTER-001 · Application route table

- **Kind:** interface-router
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `PG-FOUND-01`, `PG-FOUND-02`, `PG-AUTH-01`, `PG-AUTH-02`, `PG-POLLS-01`, `PG-POLLS-02`, `PG-POLLS-03`
- **Verified by:** `TEST-UX-001`

Declares public auth routes, protected nested app routes, and redirects.

### CMP-WEB-API-001 · Browser API client

- **Kind:** integration-adapter
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Implements:** `CTR-AUTH-REGISTER-001`, `CTR-AUTH-LOGIN-001`, `CTR-AUTH-USER-001`, `CTR-POLLS-CREATE-001`, `CTR-POLLS-VOTE-001`, `CTR-POLLS-LIST-001`, `CTR-POLLS-DETAIL-001`
- **Constrained by:** `ADR-POLLPULSE-003`
- **Verified by:** `TEST-ARCH-001`, `TEST-UX-001`

Builds configured API requests, attaches stored bearer token, parses JSON/errors, and exposes auth/poll operations.

### CMP-WEB-LAYOUT-001 · Authenticated application shell

- **Kind:** interface-component
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `PG-FOUND-01`
- **Verified by:** `TEST-UX-001`

Header/navigation/current member/logout and nested route outlet.


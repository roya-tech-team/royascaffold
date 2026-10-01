---
document_id: DOC-POLLPULSE-NFR
title: PollPulse non-functional requirements
layer: requirements
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# Non-Functional Requirements

### NFR-SEC-001 · Protect credentials and authenticated routes

- **Kind:** security-requirement
- **Knowledge status:** approved
- **Implementation status:** partial
- **Owner:** pollpulse-demo
- **Realized by:** `SVC-AUTH-01`, `CMP-API-AUTH-MW-001`, `CMP-WEB-AUTH-001`
- **Verified by:** `TEST-SEC-001`

Passwords use bcrypt cost 10 and are never returned; protected API routes require a valid current member. Implementation is partial because localStorage bearer tokens and the development-secret fallback remain documented risks `RISK-SEC-001` and `RISK-SEC-002`.

### NFR-PERF-001 · Bound poll-list reads

- **Kind:** performance-requirement
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `EP-POLLS-02`, `SVC-POLLS-01`, `SVC-POLLS-02`
- **Verified by:** `TEST-PERF-001`

List queries are paginated, default 10, maximum 50. No response-time/capacity target exists; this is a known specification gap.

### NFR-UX-001 · Expose interface progress and failure states

- **Kind:** usability-requirement
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `PG-AUTH-01`, `PG-AUTH-02`, `PG-FOUND-02`, `PG-POLLS-01`, `PG-POLLS-02`, `PG-POLLS-03`
- **Verified by:** `TEST-UX-001`

Async screens/forms show loading/disabled and visible errors; lists/dashboard provide empty states. Accessibility criteria beyond native labels/controls were not defined or tested.

### NFR-OPS-001 · Provide a health signal and recoverable local data

- **Kind:** operability-requirement
- **Knowledge status:** approved
- **Implementation status:** partial
- **Owner:** pollpulse-demo
- **Realized by:** `EP-FOUND-01`, `CMP-API-BOOT-001`, `SVC-FOUND-01`
- **Verified by:** `TEST-FOUND-001`

API exposes health and initializes SQLite automatically. Production readiness, backup/restore, alerting, SLO, and deployment automation are not implemented.

### NFR-MAINT-001 · Keep browser, API behavior, and persistence separated

- **Kind:** maintainability-requirement
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `ADR-POLLPULSE-001`, `CMP-WEB-API-001`, `SVC-AUTH-01`, `SVC-POLLS-01`, `SVC-AUTH-02`, `SVC-POLLS-02`, `SVC-POLLS-03`
- **Verified by:** `TEST-ARCH-001`

Web calls the API client; API routes/controllers call behavior services; repositories own SQL. The authentication middleware directly reads the user repository as a deliberate small-example coupling.


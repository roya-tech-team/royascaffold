---
document_id: DOC-POLLPULSE-CMP-POLLS
title: Poll components
layer: implementation
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# Poll Components

### SVC-POLLS-01 · Poll behavior service

- **Kind:** application-service
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Implements:** `WF-POLLS-001`, `INV-POLLS-001`, `INV-POLLS-002`, `INV-POLLS-003`, `INV-VOTE-001`, `INV-VOTE-002`
- **Depends on:** `SVC-POLLS-02`, `SVC-POLLS-03`
- **Verified by:** `TEST-POLLS-001`, `TEST-POLLS-002`, `TEST-VOTE-001`

Creates/lists/loads polls, validates/casts vote, authorizes/idempotently closes, and assembles detail through repositories.

### SVC-POLLS-02 · Poll repository and detail mapper

- **Kind:** repository
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Implements:** `DATA-POLLS-001`, `DATA-OPTIONS-001`, `CTR-POLLS-SUMMARY-001`, `CTR-POLLS-LIST-001`, `CTR-POLLS-DETAIL-001`, `INV-RESULTS-001`
- **Depends on:** `SVC-FOUND-01`
- **Verified by:** `TEST-POLLS-001`, `TEST-RESULTS-001`, `TEST-PERF-001`

Owns transactional poll/options insert, paginated aggregate query, detail query/mapping, and status update.

### SVC-POLLS-03 · Vote repository

- **Kind:** repository
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Implements:** `DATA-VOTES-001`, `INV-VOTE-001`
- **Depends on:** `SVC-FOUND-01`
- **Verified by:** `TEST-VOTE-001`

Creates vote and finds prior member vote for a poll.

### CMP-POLLS-CTRL-001 · Poll HTTP controller

- **Kind:** transport-controller
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `EP-POLLS-01`, `EP-POLLS-02`, `EP-POLLS-03`, `EP-POLLS-04`, `EP-POLLS-05`
- **Depends on:** `SVC-POLLS-01`
- **Verified by:** `TEST-POLLS-001`, `TEST-POLLS-002`, `TEST-VOTE-001`

### CMP-POLLS-ROUTES-001 · Protected poll route registration

- **Kind:** transport-router
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Exposes:** `EP-POLLS-01`, `EP-POLLS-02`, `EP-POLLS-03`, `EP-POLLS-04`, `EP-POLLS-05`
- **Depends on:** `CMP-API-AUTH-MW-001`, `CMP-POLLS-CTRL-001`
- **Verified by:** `TEST-POLLS-001`, `TEST-POLLS-002`, `TEST-VOTE-001`

### CMP-WEB-POLL-CARD-001 · Poll summary card

- **Kind:** interface-component
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Implements:** `CTR-POLLS-SUMMARY-001`
- **Realized by:** `PG-FOUND-02`, `PG-POLLS-01`
- **Verified by:** `TEST-UX-001`

### CMP-WEB-POLL-RESULTS-001 · Poll result bars

- **Kind:** interface-component
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Implements:** `REQ-RESULTS-001`, `CTR-POLLS-DETAIL-001`, `INV-RESULTS-001`
- **Realized by:** `PG-POLLS-04`
- **Verified by:** `TEST-RESULTS-001`, `TEST-UX-001`


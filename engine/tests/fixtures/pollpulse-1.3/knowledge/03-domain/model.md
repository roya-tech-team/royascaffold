---
document_id: DOC-POLLPULSE-DOMAIN
title: PollPulse domain model
layer: domain
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# Domain Model

### CON-USER-001 · Member

- **Kind:** domain-concept
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Maps to:** `DATA-USERS-001`, `CTR-AUTH-USER-001`

Authenticated person with identity/name/email. There is one role; resource ownership is derived from creator/member IDs.

### CON-POLL-001 · Poll

- **Kind:** domain-concept
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Maps to:** `DATA-POLLS-001`, `CTR-POLLS-DETAIL-001`
- **Described by:** `WF-POLLS-001`

Question owned by a creator, with options and an open/closed lifecycle.

### CON-OPTION-001 · Poll option

- **Kind:** domain-concept
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Maps to:** `DATA-OPTIONS-001`, `CTR-POLLS-DETAIL-001`

Ordered selectable answer belonging to exactly one poll.

### CON-VOTE-001 · Vote

- **Kind:** domain-concept
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Maps to:** `DATA-VOTES-001`, `CTR-POLLS-VOTE-001`
- **Described by:** `WF-POLLS-001`

Permanent member selection of one option for one poll.

### INV-AUTH-001 · Credential boundary

- **Kind:** invariant
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Constrained by:** `NFR-SEC-001`
- **Realized by:** `SVC-AUTH-01`, `SVC-AUTH-02`
- **Verified by:** `TEST-AUTH-001`, `TEST-SEC-001`

Stored passwords are hashes, password hashes never cross the API boundary, and bad login does not reveal whether an email exists.

### INV-POLLS-001 · Poll option cardinality and text limits

- **Kind:** invariant
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `SVC-POLLS-01`
- **Verified by:** `TEST-POLLS-001`

Poll has 2–5 non-empty options; title is 1–200 characters; optional description is ≤1000.

### INV-POLLS-002 · Creator-only close

- **Kind:** invariant
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `SVC-POLLS-01`
- **Verified by:** `TEST-POLLS-002`

Only `createdBy` member may transition a poll from open to closed.

### INV-POLLS-003 · Closing is idempotent

- **Kind:** invariant
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `SVC-POLLS-01`, `SVC-POLLS-02`
- **Verified by:** `TEST-POLLS-002`

Closing an already-closed poll by its creator returns current detail without another mutation.

### INV-VOTE-001 · One permanent vote per member and poll

- **Kind:** invariant
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `SVC-POLLS-01`, `SVC-POLLS-03`, `DATA-VOTES-001`
- **Verified by:** `TEST-VOTE-001`

At most one vote exists for `(poll, member)` and the system exposes no vote-change operation.

### INV-VOTE-002 · Vote targets a valid option of an open poll

- **Kind:** invariant
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `SVC-POLLS-01`
- **Verified by:** `TEST-VOTE-001`

Vote option belongs to the target poll and poll status is open when insertion occurs.

### INV-RESULTS-001 · Result calculation

- **Kind:** invariant
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `SVC-POLLS-02`, `PG-POLLS-04`
- **Verified by:** `TEST-RESULTS-001`

Each percentage is option votes / total ×100 rounded to one decimal; zero total yields zero for every option.


---
document_id: DOC-POLLPULSE-FUNCTIONAL
title: PollPulse functional requirements
layer: requirements
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# Functional Requirements

### REQ-FOUND-001 · Expose service health

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `EP-FOUND-01`, `CMP-API-BOOT-001`
- **Verified by:** `TEST-FOUND-001`

Acceptance: an unauthenticated `GET /health` returns HTTP 200 with `{ "status": "ok" }`.

### REQ-AUTH-001 · Register a member

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `CAP-IDENTITY-001`
- **Constrained by:** `INV-AUTH-001`
- **Realized by:** `EP-AUTH-01`, `PG-AUTH-02`, `SVC-AUTH-01`
- **Verified by:** `TEST-AUTH-001`

Acceptance: valid name/email/password (minimum 8 characters) creates a unique normalized-email member and returns the member plus a JWT; duplicate email returns conflict; password hash is never returned.

### REQ-AUTH-002 · Log in a member

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `CAP-IDENTITY-001`
- **Constrained by:** `INV-AUTH-001`
- **Realized by:** `EP-AUTH-02`, `PG-AUTH-01`, `SVC-AUTH-01`
- **Verified by:** `TEST-AUTH-001`

Acceptance: correct credentials return the same auth response shape; missing/wrong credentials return a generic unauthorized error.

### REQ-AUTH-003 · Restore and expose the authenticated member

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `CAP-IDENTITY-001`
- **Realized by:** `EP-AUTH-03`, `CMP-API-AUTH-MW-001`, `CMP-WEB-AUTH-001`
- **Verified by:** `TEST-AUTH-001`

Acceptance: a valid bearer token resolves a current member; missing/invalid tokens are rejected; the web restores the member or clears an invalid stored token.

### REQ-POLLS-001 · Create a poll

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `CAP-POLLS-001`
- **Constrained by:** `INV-POLLS-001`
- **Realized by:** `EP-POLLS-01`, `PG-POLLS-02`, `SVC-POLLS-01`
- **Verified by:** `TEST-POLLS-001`

Acceptance: authenticated creator supplies a 1–200 character title, optional ≤1000 description, and 2–5 non-empty options; API persists poll/options transactionally as open and returns detail.

### REQ-POLLS-002 · Browse paginated polls

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `CAP-POLLS-001`
- **Realized by:** `EP-POLLS-02`, `PG-POLLS-01`, `PG-FOUND-02`, `SVC-POLLS-01`
- **Verified by:** `TEST-POLLS-001`

Acceptance: authenticated members receive newest-first poll summaries with total/page/limit and total vote count; page is ≥1 and limit is 1–50.

### REQ-POLLS-003 · View poll detail

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `CAP-POLLS-001`
- **Realized by:** `EP-POLLS-03`, `PG-POLLS-03`, `SVC-POLLS-01`
- **Verified by:** `TEST-POLLS-001`

Acceptance: authenticated members receive poll/options, creator identity, status/timestamps, counts/percentages, current member vote, and ownership flag; missing poll returns not found.

### REQ-POLLS-004 · Close an owned poll

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `CAP-POLLS-001`
- **Constrained by:** `INV-POLLS-002`, `INV-POLLS-003`
- **Described by:** `WF-POLLS-001`
- **Realized by:** `EP-POLLS-05`, `PG-POLLS-03`, `SVC-POLLS-01`
- **Verified by:** `TEST-POLLS-002`

Acceptance: only creator closes; first close sets closed status/time; repeated creator close succeeds without another state transition; closed poll rejects votes.

### REQ-VOTE-001 · Cast at most one vote

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `CAP-VOTING-001`
- **Constrained by:** `INV-VOTE-001`
- **Described by:** `WF-POLLS-001`
- **Realized by:** `EP-POLLS-04`, `PG-POLLS-03`, `SVC-POLLS-01`, `SVC-POLLS-03`
- **Verified by:** `TEST-VOTE-001`

Acceptance: first valid choice persists; another vote by the same member/poll is rejected and the original cannot be changed.

### REQ-VOTE-002 · Accept only an option of an open target poll

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `CAP-VOTING-001`
- **Constrained by:** `INV-VOTE-002`
- **Realized by:** `EP-POLLS-04`, `SVC-POLLS-01`
- **Verified by:** `TEST-VOTE-001`

Acceptance: closed/missing poll, missing option, or option from a different poll is rejected without a vote.

### REQ-RESULTS-001 · Show counts and percentages

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `CAP-RESULTS-001`
- **Constrained by:** `INV-RESULTS-001`
- **Realized by:** `EP-POLLS-03`, `PG-POLLS-04`, `SVC-POLLS-02`
- **Verified by:** `TEST-RESULTS-001`

Acceptance: authenticated detail response/UI shows each option count and percentage rounded to one decimal; all percentages are 0 when total is zero.


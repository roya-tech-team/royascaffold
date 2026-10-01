---
document_id: DOC-POLLPULSE-ACT-WEB
title: PollPulse web actions
layer: implementation
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# Web Interface Actions

### PG-FOUND-01 · Authenticated app shell

- **Kind:** interface-action
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `CMP-WEB-ROUTER-001`, `CMP-WEB-PROTECTED-001`, `CMP-WEB-LAYOUT-001`
- **Verified by:** `TEST-UX-001`

Route `/app/*`; protected nested shell with dashboard/polls/create/logout navigation.

### PG-FOUND-02 · Dashboard

- **Kind:** interface-action
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-POLLS-002`
- **Depends on:** `EP-POLLS-02`, `CMP-WEB-POLL-CARD-001`
- **Verified by:** `TEST-UX-001`

Route `/app/dashboard`; welcome, total/open counts, recent polls, loading/error/empty states.

### PG-AUTH-01 · Login page

- **Kind:** interface-action
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-AUTH-002`
- **Depends on:** `EP-AUTH-02`, `CMP-WEB-AUTH-001`, `CMP-WEB-AUTH-LAYOUT-001`
- **Verified by:** `TEST-AUTH-001`, `TEST-UX-001`

Route `/auth/login`; email/password, error/loading, register link, redirect authenticated member.

### PG-AUTH-02 · Registration page

- **Kind:** interface-action
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-AUTH-001`
- **Depends on:** `EP-AUTH-01`, `CMP-WEB-AUTH-001`, `CMP-WEB-AUTH-LAYOUT-001`
- **Verified by:** `TEST-AUTH-001`, `TEST-UX-001`

Route `/auth/register`; name/email/password/confirmation, client checks, login link.

### PG-POLLS-01 · Poll list page

- **Kind:** interface-action
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-POLLS-002`
- **Depends on:** `EP-POLLS-02`, `CMP-WEB-POLL-CARD-001`
- **Verified by:** `TEST-POLLS-001`, `TEST-UX-001`

Route `/app/polls`; paginated cards, create CTA, loading/error/empty states.

### PG-POLLS-02 · Create poll page

- **Kind:** interface-action
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-POLLS-001`
- **Depends on:** `EP-POLLS-01`
- **Verified by:** `TEST-POLLS-001`, `TEST-UX-001`

Route `/app/polls/new`; title/description and dynamic 2–5 option fields; redirects to detail.

### PG-POLLS-03 · Poll detail/vote/close page

- **Kind:** interface-action
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-POLLS-003`, `REQ-POLLS-004`, `REQ-VOTE-001`, `REQ-VOTE-002`
- **Depends on:** `EP-POLLS-03`, `EP-POLLS-04`, `EP-POLLS-05`, `PG-POLLS-04`
- **Verified by:** `TEST-POLLS-002`, `TEST-VOTE-001`, `TEST-UX-001`

Route `/app/polls/:id`; conditional vote/results/creator close and operation states.

### PG-POLLS-04 · Embedded results view

- **Kind:** interface-action
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-RESULTS-001`
- **Depends on:** `CMP-WEB-POLL-RESULTS-001`, `CTR-POLLS-DETAIL-001`
- **Verified by:** `TEST-RESULTS-001`, `TEST-UX-001`

Embedded in detail; result bar per option plus counts/percentage/total.


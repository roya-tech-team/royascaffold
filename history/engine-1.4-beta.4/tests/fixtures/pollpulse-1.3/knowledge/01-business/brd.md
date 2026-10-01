---
document_id: DOC-POLLPULSE-BRD
title: PollPulse business requirements
layer: business
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# PollPulse Business Requirements

## Problem and scope

Small teams need a low-friction way to ask a bounded question, collect one response per authenticated member, and see a clear result without an external integration or administration model.

In scope: account registration/login, poll creation/list/detail, one vote, results, creator close. Out of scope: anonymous voting, poll editing, OAuth, password recovery, admin/user management, email verification, and WebSocket updates.

### OUT-POLLPULSE-001 · Reach quick, visible team decisions

- **Kind:** business-outcome
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `CAP-IDENTITY-001`, `CAP-POLLS-001`, `CAP-VOTING-001`, `CAP-RESULTS-001`

Success means a new member can register, create a poll, another member can vote once, everyone authenticated can see the result, and the creator can stop future votes.

### CAP-IDENTITY-001 · Member identity and session

- **Kind:** capability
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `OUT-POLLPULSE-001`
- **Realized by:** `REQ-AUTH-001`, `REQ-AUTH-002`, `REQ-AUTH-003`, `WF-AUTH-001`

### CAP-POLLS-001 · Poll management

- **Kind:** capability
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `OUT-POLLPULSE-001`
- **Realized by:** `REQ-POLLS-001`, `REQ-POLLS-002`, `REQ-POLLS-003`, `REQ-POLLS-004`, `WF-POLLS-001`

### CAP-VOTING-001 · Single authenticated vote

- **Kind:** capability
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `OUT-POLLPULSE-001`
- **Realized by:** `REQ-VOTE-001`, `REQ-VOTE-002`, `WF-POLLS-001`

### CAP-RESULTS-001 · Visible poll outcome

- **Kind:** capability
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Satisfies:** `OUT-POLLPULSE-001`
- **Realized by:** `REQ-RESULTS-001`, `WF-POLLS-001`


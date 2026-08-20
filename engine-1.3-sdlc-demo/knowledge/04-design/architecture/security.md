---
document_id: DOC-POLLPULSE-SECURITY
title: PollPulse security and privacy design
layer: design
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# Security and Privacy

### SEC-POLLPULSE-001 · Authentication and resource authorization

- **Kind:** security-design
- **Knowledge status:** approved
- **Implementation status:** partial
- **Owner:** pollpulse-demo
- **Satisfies:** `NFR-SEC-001`
- **Realized by:** `SVC-AUTH-01`, `CMP-API-AUTH-MW-001`, `SVC-POLLS-01`, `CMP-WEB-AUTH-001`
- **Verified by:** `TEST-SEC-001`

- Public: register, login, health.
- Protected: current member and every poll action.
- Ownership: only `poll.created_by === req.user.id` may close.
- Credentials: bcrypt cost 10; generic invalid login; response mapper excludes hash.
- Personal data: name/email only; no retention/deletion policy is defined.

Trust boundary: browser token and input are untrusted; API verifies JWT, current user existence, validation, poll state, ownership, prior vote, and option membership.

Known risks are canonical in [accepted risks](../../06-quality/accepted-risks.md). No rate limit, CSRF concern for bearer header, CSP, dependency/security scan, secret rotation, or formal threat test is evidenced.


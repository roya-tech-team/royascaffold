# ADR-003: Bearer JWT session

## ADR-JWT — Bearer JWT session

```yaml artifact
id: ADR-JWT
type: decision
title: Bearer JWT session
module: auth
owner: pollpulse-team
knowledge_status: approved
implementation_status: not-applicable
affects: [SEC-JWT, CMP-AUTH-SERVICE, CMP-WEB-API]
```

**Decision:** Issue a seven-day signed bearer JWT and persist it in browser local storage for the teaching demo.

**Why:** The mechanism is compact and makes the authenticated request boundary easy to inspect.

**Consequences:** Revocation is not immediate and local storage increases XSS impact. A production design must reassess token storage, expiry, rotation, revocation, CSRF, rate limiting, and audit needs.

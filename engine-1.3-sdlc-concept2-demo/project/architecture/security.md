# Security Architecture

## SEC-JWT — Bearer JWT authentication

```yaml artifact
id: SEC-JWT
type: security-control
title: Bearer JWT authentication
module: auth
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
satisfies: [REQ-AUTH]
realized_by: [CMP-AUTH-SERVICE, CMP-AUTH-CONTROLLER, CMP-WEB-API, CMP-WEB-AUTH]
depends_on: [ADR-JWT]
```

The API signs seven-day JWTs whose payload contains `sub` and `email`. Protected routes require `Authorization: Bearer <token>`. The browser stores the token in local storage and the central API client attaches it. Invalid or expired tokens return 401.

Passwords are bcrypt hashes with cost 10. API responses are allow-listed DTOs that never include `password_hash`. Login failures use a generic response. The creator identity used to close a poll comes from the verified token, never the request body.

Known demo limitation: local-storage tokens are exposed to successful cross-site scripting. Production adoption should evaluate secure cookies, CSRF controls, rate limiting, secret rotation, and structured security logging.

---
document_id: DOC-POLLPULSE-CTR-AUTH
title: Authentication contracts
layer: design
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# Authentication Contracts

### CTR-AUTH-REGISTER-001 · Registration request

- **Kind:** request-contract
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Exposes:** `EP-AUTH-01`
- **Maps to:** `CON-USER-001`

Fields: required non-empty `name`; required non-empty `email` normalized lowercase; required `password` length ≥8. Unknown fields are ignored by destructuring; no formal schema library is used.

### CTR-AUTH-LOGIN-001 · Login request

- **Kind:** request-contract
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Exposes:** `EP-AUTH-02`

Required `email`, `password`; invalid/missing returns `CTR-ERROR-001`, 401.

### CTR-AUTH-USER-001 · Safe member response

- **Kind:** response-contract
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Exposes:** `EP-AUTH-03`, `CTR-AUTH-RESPONSE-001`
- **Maps to:** `CON-USER-001`, `DATA-USERS-001`

`id`, `name`, `email`, `createdAt`. `password_hash` is never included.

### CTR-AUTH-RESPONSE-001 · Authentication response

- **Kind:** response-contract
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Exposes:** `EP-AUTH-01`, `EP-AUTH-02`
- **Maps to:** `CTR-AUTH-USER-001`

`{ token: string, user: CTR-AUTH-USER-001 }`; bearer token carries `sub` and email, expires after 7 days.


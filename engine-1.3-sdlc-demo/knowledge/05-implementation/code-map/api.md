---
document_id: DOC-POLLPULSE-CODEMAP-API
title: PollPulse API code map
layer: implementation
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# API Code Map

| Path | Kind | Blueprint owner | Relationship | Runtime | Status | Notes |
|------|------|-----------------|--------------|---------|--------|-------|
| `../example-v1.2/apps/api/.env.example` | configuration example | `CMP-API-BOOT-001` | defines | no | implemented | PORT, JWT secret, CORS origin |
| `../example-v1.2/apps/api/package.json` | package config | `CMP-API-BOOT-001` | configures | no | implemented | runtime/scripts/dependencies |
| `../example-v1.2/apps/api/package-lock.json` | dependency lock | `CMP-API-BOOT-001` | generated | no | implemented | npm lock state |
| `../example-v1.2/apps/api/src/config.js` | runtime config | `CMP-API-BOOT-001` | supports | yes | implemented | env/defaults |
| `../example-v1.2/apps/api/src/database.js` | persistence/bootstrap | `SVC-FOUND-01` | implements | yes | implemented | connection + DDL |
| `../example-v1.2/apps/api/src/index.js` | runtime entry | `CMP-API-BOOT-001` | implements | yes | implemented | Express composition/listener |
| `../example-v1.2/apps/api/src/common/errors.js` | error boundary | `CMP-API-ERROR-001` | implements | yes | implemented | AppError + handler |
| `../example-v1.2/apps/api/src/common/middleware/auth.js` | auth middleware | `CMP-API-AUTH-MW-001` | implements | yes | implemented | token/member resolution |
| `../example-v1.2/apps/api/src/modules/auth/auth.controller.js` | controller | `CMP-AUTH-CTRL-001` | implements | yes | implemented | register/login/me |
| `../example-v1.2/apps/api/src/modules/auth/auth.repository.js` | repository/mapper | `SVC-AUTH-02` | implements | yes | implemented | user SQL + safe DTO |
| `../example-v1.2/apps/api/src/modules/auth/auth.routes.js` | router | `CMP-AUTH-ROUTES-001` | implements | yes | implemented | auth route table |
| `../example-v1.2/apps/api/src/modules/auth/auth.service.js` | application service | `SVC-AUTH-01` | implements | yes | implemented | credential/session rules |
| `../example-v1.2/apps/api/src/modules/polls/polls.controller.js` | controller | `CMP-POLLS-CTRL-001` | implements | yes | implemented | poll HTTP mapping |
| `../example-v1.2/apps/api/src/modules/polls/polls.repository.js` | repository/mapper | `SVC-POLLS-02` | implements | yes | implemented | poll SQL/results mapping |
| `../example-v1.2/apps/api/src/modules/polls/polls.routes.js` | router | `CMP-POLLS-ROUTES-001` | implements | yes | implemented | protected poll routes |
| `../example-v1.2/apps/api/src/modules/polls/polls.service.js` | application service | `SVC-POLLS-01` | implements | yes | implemented | poll/vote/close rules |
| `../example-v1.2/apps/api/src/modules/polls/votes.repository.js` | repository | `SVC-POLLS-03` | implements | yes | implemented | vote insert/lookup |

Coverage: 17/17 files under the API source root for configured extensions.


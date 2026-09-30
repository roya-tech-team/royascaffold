---
document_id: DOC-POLLPULSE-TESTS
title: PollPulse test and evaluation catalog
layer: implementation
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# Test and Evaluation Catalog

### TEST-FOUND-001 · API startup, schema, and health

- **Kind:** integration-test
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-FOUND-001`, `NFR-OPS-001`
- **Realized by:** `CMP-API-BOOT-001`, `SVC-FOUND-01`

Required: isolated temporary database, start API, assert DDL and health JSON/status. No test script/file exists.

### TEST-AUTH-001 · Registration, login, current member, failure behavior

- **Kind:** integration-test
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-AUTH-001`, `REQ-AUTH-002`, `REQ-AUTH-003`, `INV-AUTH-001`

Required: valid/invalid/duplicate registration, valid/invalid login, current member with valid/missing/invalid token, no password hash. No test script/file exists.

### TEST-POLLS-001 · Create, list, and detail

- **Kind:** integration-test
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-POLLS-001`, `REQ-POLLS-002`, `REQ-POLLS-003`, `INV-POLLS-001`

Required boundary/cardinality/text/pagination/not-found scenarios. No test script/file exists.

### TEST-POLLS-002 · Creator close and idempotency

- **Kind:** integration-test
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-POLLS-004`, `INV-POLLS-002`, `INV-POLLS-003`

Required creator/non-creator/repeated close and post-close vote rejection. No test script/file exists.

### TEST-VOTE-001 · Single valid vote under failures and concurrency

- **Kind:** integration-test
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-VOTE-001`, `REQ-VOTE-002`, `INV-VOTE-001`, `INV-VOTE-002`

Required first/duplicate/concurrent/closed/missing/wrong-option cases. No test script/file exists.

### TEST-RESULTS-001 · Result count and percentage mapping

- **Kind:** unit-integration-test
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** pollpulse-demo
- **Satisfies:** `REQ-RESULTS-001`, `INV-RESULTS-001`

Required zero/one/multiple/rounding cases and UI rendering. No test script/file exists.

### TEST-SEC-001 · Authentication and authorization security checks

- **Kind:** security-test
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** pollpulse-demo
- **Satisfies:** `NFR-SEC-001`, `SEC-POLLPULSE-001`

Required secret configuration, token tamper/expiry, password/hash boundary, creator authorization, input abuse/dependency review. No security command exists.

### TEST-PERF-001 · Pagination bounds

- **Kind:** performance-check
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** pollpulse-demo
- **Satisfies:** `NFR-PERF-001`

Required page/limit normalization and a future response-time/data-volume target. No performance command exists.

### TEST-UX-001 · Core responsive/accessibility journey

- **Kind:** interface-evaluation
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** pollpulse-demo
- **Satisfies:** `NFR-UX-001`, `JRN-POLLPULSE-001`

Required keyboard/labels/focus/contrast/responsive states plus end-to-end journey evidence. No E2E/accessibility/visual command exists.

### TEST-ARCH-001 · Dependency and code-map conformance

- **Kind:** architecture-check
- **Knowledge status:** approved
- **Implementation status:** partial
- **Owner:** pollpulse-demo
- **Satisfies:** `NFR-MAINT-001`, `ARCH-POLLPULSE-001`
- **Verified by:** `EVD-MIGRATION-001`

Source was manually inspected and code-map coverage is deterministic; no import/layer checker exists.

### TEST-WEB-BUILD-001 · Web production build

- **Kind:** build-check
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `CMP-WEB-BOOT-001`
- **Verified by:** `EVD-WEB-BUILD-001`

Command: `npm run build` in the v1.2 web app after dependency install.

### TEST-API-SYNTAX-001 · API JavaScript syntax

- **Kind:** syntax-check
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `CMP-API-BOOT-001`, `SVC-AUTH-01`, `SVC-AUTH-02`, `SVC-POLLS-01`, `SVC-POLLS-02`, `SVC-POLLS-03`
- **Verified by:** `EVD-API-SYNTAX-001`

Command: run `node --check` against every JavaScript file under the API source root. This proves parsing only, not runtime imports/behavior.

### TEST-BLUEPRINT-001 · v1.3 blueprint deterministic validation

- **Kind:** blueprint-check
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `CHG-MIGRATION-001`
- **Verified by:** `EVD-BLUEPRINT-001`

Command: `node engine-1.3-sdlc/bin/sdlc.js validate engine-1.3-sdlc-demo`.

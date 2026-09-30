---
document_id: DOC-POLLPULSE-RISKS
title: PollPulse accepted risks and quality debt
layer: quality
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# Accepted Risks and Quality Debt

### RISK-SEC-001 · Bearer token stored in localStorage

- **Kind:** accepted-risk
- **Knowledge status:** approved
- **Implementation status:** not-applicable
- **Owner:** pollpulse-demo
- **Affects:** `ADR-POLLPULSE-003`, `NFR-SEC-001`, `CMP-WEB-AUTH-001`, `CMP-WEB-API-001`

Risk: successful XSS can read the 7-day bearer token. Accepted only for the educational demo. Production remediation: hardened threat model/CSP and preferably a secure httpOnly cookie/session design with CSRF controls where applicable.

### RISK-SEC-002 · Development JWT secret fallback

- **Kind:** accepted-risk
- **Knowledge status:** approved
- **Implementation status:** not-applicable
- **Owner:** pollpulse-demo
- **Affects:** `ADR-POLLPULSE-003`, `NFR-SEC-001`, `CMP-API-BOOT-001`, `CMP-API-AUTH-MW-001`

Risk: absent `JWT_SECRET` uses `dev-secret`. Accepted for local example only. Production must fail closed when a strong secret is absent and define rotation.

### RISK-TEST-001 · v1.2 verification lacks executable evidence

- **Kind:** quality-debt
- **Knowledge status:** approved
- **Implementation status:** not-applicable
- **Owner:** pollpulse-demo
- **Affects:** `QUAL-POLLPULSE-001`, `TEST-FOUND-001`, `TEST-AUTH-001`, `TEST-POLLS-001`, `TEST-POLLS-002`, `TEST-VOTE-001`, `TEST-RESULTS-001`, `TEST-SEC-001`, `TEST-PERF-001`, `TEST-UX-001`

Risk: regressions or misunderstood behavior can pass a prose checklist. v1.3 maps behavior to implemented, not verified. Remediation: add isolated API unit/integration tests, web component/E2E/accessibility tests, and evidence capture.

### RISK-OPS-001 · No production deployment/recovery design

- **Kind:** operational-debt
- **Knowledge status:** approved
- **Implementation status:** not-applicable
- **Owner:** pollpulse-demo
- **Affects:** `NFR-OPS-001`, `OPS-DEPLOY-001`, `OPS-OBS-001`

Risk: no production manifest, backup/restore, SLO/alerts, migration strategy, or rollback automation. Accepted because the example is local/educational; production use requires a new high-risk change.

### RISK-DEP-001 · Installed web dependency vulnerabilities

- **Kind:** security-debt
- **Knowledge status:** approved
- **Implementation status:** not-applicable
- **Owner:** pollpulse-demo
- **Affects:** `NFR-SEC-001`, `TEST-SEC-001`, `CMP-WEB-BOOT-001`

On 2026-08-20, `npm ci` reported 5 vulnerabilities (3 moderate, 2 high) in the locked web dependency tree. No audit remediation was authorized in this migration because application/dependency changes are out of scope. Production/release use is blocked pending assessment and a separate change; do not run an automatic breaking `audit fix --force`.

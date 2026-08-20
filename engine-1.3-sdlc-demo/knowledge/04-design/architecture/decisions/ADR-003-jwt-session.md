---
document_id: DOC-POLLPULSE-ADR-003
title: Use browser-stored bearer JWT for the demo
layer: design
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# ADR — Demo JWT Session

### ADR-POLLPULSE-003 · Seven-day bearer JWT stored by the browser

- **Kind:** architecture-decision
- **Knowledge status:** approved
- **Implementation status:** partial
- **Owner:** pollpulse-demo
- **Realized by:** `CTR-AUTH-RESPONSE-001`, `CMP-API-AUTH-MW-001`, `CMP-WEB-AUTH-001`
- **Constrained by:** `RISK-SEC-001`, `RISK-SEC-002`

Observed decision: API returns a 7-day JWT; browser stores it in localStorage and sends an Authorization bearer header. This is adequate for the original demonstration but is not the engine's recommended production default. XSS exposure and development-secret fallback require remediation before production use.


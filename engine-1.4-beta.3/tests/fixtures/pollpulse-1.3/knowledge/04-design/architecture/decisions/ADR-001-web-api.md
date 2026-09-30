---
document_id: DOC-POLLPULSE-ADR-001
title: Separate browser and API applications
layer: design
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# ADR — Separate Browser and API

### ADR-POLLPULSE-001 · React web consumes an Express API

- **Kind:** architecture-decision
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Realized by:** `ARCH-POLLPULSE-001`, `CMP-WEB-API-001`, `CMP-API-BOOT-001`

Decision: keep browser presentation/session client separate from API behavior/persistence. Consequence: explicit HTTP contracts and CORS configuration are required; business rules remain server-side. This records the implemented v1.2 choice, not a universal engine default.


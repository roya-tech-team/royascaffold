# ADR-001: Layered modular monolith

## ADR-LAYERED — Layered modular monolith

```yaml artifact
id: ADR-LAYERED
type: decision
title: Layered modular monolith
module: system
owner: pollpulse-team
knowledge_status: approved
implementation_status: not-applicable
affects: [ARCH-SYSTEM, ARCH-API-LAYERS, ARCH-WEB-LAYERS]
```

**Decision:** Keep one deployable Express API organized into auth and polls modules, with controller → service → repository dependencies, plus one React client.

**Why:** The reference product is small and benefits from explicit boundaries without distributed-system overhead. Services remain visible contracts rather than undocumented implementation files.

**Consequences:** Deployment and local learning are simple. Modules still share a process and database, so future independent scaling would require another architecture decision and migration.

# ADR-002: Built-in SQLite persistence

## ADR-SQLITE — Built-in SQLite persistence

```yaml artifact
id: ADR-SQLITE
type: decision
title: Built-in SQLite persistence
module: data
owner: pollpulse-team
knowledge_status: approved
implementation_status: not-applicable
affects: [ARCH-DATA-ACCESS, DATA-SQLITE]
```

**Decision:** Use Node.js `node:sqlite` and a local file database.

**Why:** It avoids a separate database service and native dependency build while preserving transactions, foreign keys, and indexes.

**Consequences:** Node.js 22.5+ is required. This demo is not designed for multi-node writes, operational replication, or large-scale analytics.

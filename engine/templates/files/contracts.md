---
document_id: DOC-{{CODE}}-CONTRACTS
title: Contracts
layer: design
schema_version: 2
document_status: approved
owners: [{{OWNER}}]
---

# Contracts

> **What:** the promises between parts of the system: APIs, events, props, file formats
> **Read when:** code calls another part, or another part calls it

## Record format (example)

```md
### CTR-{{CODE}}-001 · GET /api/clients/{id}/results

- **Owner:** {{OWNER}}
- **Supports:** REQ-{{CODE}}-001

**Returns** `200` with `[{ campaignId, name, reach }]` newest first · `403` when the client is not the caller.
```

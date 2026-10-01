---
document_id: DOC-{{CODE}}-COVERAGE
title: Brief coverage
layer: discovery
schema_version: 2
document_status: approved
owners: [{{OWNER}}]
---

# Brief coverage

> **What:** every concrete demand of the original request (SRC-), and the requirement that covers it or why it is out of scope
> **Read when:** planning features, approving the roadmap, or checking nothing asked for was dropped

Add one per demand with `royascaff new record source "<the demand>" --quote "<exact words from request.md>"`: each numbered acceptance criterion, each screen or control, each quality demand, each "do not". Each demand is one row. While planning, fill **Covered by** with the REQ-/NFR-/CAP- that delivers it, or write **Out of scope** with the reason. `royascaff approve roadmap` refuses while a demand is neither.

## Demands

| SRC | Demand | Quote | Covered by | Out of scope |
|---|---|---|---|---|

## Record format (example)

```md
| SRC | Demand | Quote | Covered by | Out of scope |
|---|---|---|---|---|
| SRC-{{CODE}}-004 | Planners drag posts between days | planners drag posts … between days | REQ-{{CODE}}-004 | |
| SRC-{{CODE}}-009 | No client accounts in the first release | Clients approve through a link; no accounts yet. | | the request defers accounts; approval by link is REQ-{{CODE}}-005 |
```

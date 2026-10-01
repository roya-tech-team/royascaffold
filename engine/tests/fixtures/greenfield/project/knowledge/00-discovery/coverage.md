---
document_id: DOC-CAMP-COVERAGE
title: Brief coverage
layer: discovery
schema_version: 2
document_status: approved
owners: [product-owner]
---

# Brief coverage

> **What:** every concrete demand of the original request (SRC-), and the requirement that covers it or why it is out of scope
> **Read when:** planning features, approving the roadmap, or checking nothing asked for was dropped

Add one per demand with `royascaff new record source "<the demand>" --quote "<exact words from request.md>"`: each numbered acceptance criterion, each visual effect, each control, each "do not". While planning, fill **Covered by** with the REQ-/NFR-/CAP- that delivers it, or write **Out of scope** with the reason. `royascaff approve roadmap` refuses while a demand is neither.

## Record format (example)

```md
### SRC-CAMP-012 · Subtle bloom that keeps the graph readable

- **Quote:** Bloom … Do NOT overdo bloom.
- **Covered by:** NFR-CAMP-002

### SRC-CAMP-020 · Real search is not built yet

- **Quote:** It does not need real search functionality yet.
- **Out of scope:** only the visual placeholder is asked for
```

### SRC-CAMP-001 · Create a campaign with name, dates and channels

- **Quote:** Planners create a campaign for a client with a name, dates and channels.
- **Covered by:** REQ-CAMP-001

### SRC-CAMP-002 · Campaigns per client, newest first

- **Quote:** Planners see all campaigns of a client, newest first.
- **Covered by:** REQ-CAMP-002

### SRC-CAMP-003 · Calendar with drag between days

- **Quote:** A calendar shows every scheduled post; planners drag posts between days.
- **Covered by:** REQ-CAMP-003, REQ-CAMP-004

### SRC-CAMP-004 · Client approval by link

- **Quote:** Clients approve posts through a link.
- **Covered by:** REQ-CAMP-005

### SRC-CAMP-005 · No AI features yet

- **Quote:** No AI features yet.
- **Out of scope:** the request defers AI; CAP-CAMP-005 stays an idea in the backlog

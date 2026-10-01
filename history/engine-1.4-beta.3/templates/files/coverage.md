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

Add one per demand with `royascaff new record source "<the demand>" --quote "<exact words from request.md>"`: each numbered acceptance criterion, each visual effect, each control, each "do not". While planning, fill **Covered by** with the REQ-/NFR-/CAP- that delivers it, or write **Out of scope** with the reason. `royascaff approve roadmap` refuses while a demand is neither.

## Record format (example)

```md
### SRC-{{CODE}}-012 · Subtle bloom that keeps the graph readable

- **Quote:** Bloom … Do NOT overdo bloom.
- **Covered by:** NFR-{{CODE}}-002

### SRC-{{CODE}}-020 · Real search is not built yet

- **Quote:** It does not need real search functionality yet.
- **Out of scope:** only the visual placeholder is asked for
```

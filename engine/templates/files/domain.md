---
document_id: DOC-{{CODE}}-DOMAIN
title: Domain
layer: domain
schema_version: 2
document_status: approved
owners: [{{OWNER}}]
---

# Domain

> **What:** the concepts of the business, the rules that must always hold, and important workflows
> **Read when:** a requirement uses a business word you are not sure about, or a rule must never break

## Record format (examples)

```md
### CON-{{CODE}}-001 · Campaign

- **Owner:** {{OWNER}}

A planned set of posts for one client, with a start and an end date.

### INV-{{CODE}}-001 · A client only sees their own campaigns

- **Owner:** {{OWNER}}
- **Constrained by:** REQ-{{CODE}}-001
```

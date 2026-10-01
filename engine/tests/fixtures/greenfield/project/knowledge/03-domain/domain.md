---
document_id: DOC-CAMP-DOMAIN
title: Domain
layer: domain
schema_version: 2
document_status: approved
owners: [roya-team]
---

# Domain

> **What:** the concepts of the business, the rules that must always hold, and important workflows
> **Read when:** a requirement uses a business word you are not sure about, or a rule must never break

### CON-CAMP-001 · Campaign

- **Owner:** roya-team

A planned set of posts for one client, with a start and an end date.

### INV-CAMP-001 · A post is scheduled inside its campaign dates

- **Owner:** roya-team
- **Constrained by:** REQ-CAMP-003

A post's day lies between its campaign's start and end dates; moving it outside is refused with a message.

## Record format (examples)

```md
### CON-CAMP-001 · Campaign

- **Owner:** roya-team

A planned set of posts for one client, with a start and an end date.

### INV-CAMP-001 · A client only sees their own campaigns

- **Owner:** roya-team
- **Constrained by:** REQ-CAMP-001
```

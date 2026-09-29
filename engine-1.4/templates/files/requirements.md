---
document_id: DOC-{{CODE}}-REQUIREMENTS
title: Functional requirements
layer: requirements
schema_version: 2
document_status: approved
owners: [{{OWNER}}]
---

# Functional requirements

> **What:** what each feature must do, and how we know it works
> **Read when:** designing, building or checking a slice

<!-- royascaff:summary:start -->
<!-- royascaff:summary:end -->

Add requirements with `royascaff new record requirement "<observable behavior>" --feature CAP-…`. Describe what and why, never how.

## Record format (example)

```md
### REQ-{{CODE}}-001 · Client sees reach per campaign

- **Priority:** must
- **Owner:** {{OWNER}}
- **Feature:** CAP-{{CODE}}-001
- **Verified by:** TEST-{{CODE}}-001

A signed-in client opens Results and sees each campaign with its reach.

**Acceptance**
- Campaigns are listed newest first, with reach as a whole number.
- A campaign without data shows "No data yet", not zero.
```

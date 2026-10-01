---
document_id: DOC-{{CODE}}-FLAGS
title: Feature flags
layer: implementation
schema_version: 2
document_status: approved
owners: [{{OWNER}}]
---

# Feature flags

> **What:** every feature flag (FLAG-): what it hides, who owns it and when it must be removed
> **Read when:** adding a flag, or when the board warns that a flag is past its removal date

A flag hides a feature or a requirement until it is on. A requirement behind an `off` flag is not delivered: it does not count toward an outcome. Every flag has a removal date or release: an old flag is a debt, and the board lists the ones past it.

Add one with `royascaff new record flag "<name>" --hides CAP-…,REQ-… --remove-by 2026-12-01` (or `--remove-by REL-…`).

## Record format (example)

```md
### FLAG-{{CODE}}-001 · New results page

- **Owner:** {{OWNER}}
- **Hides:** CAP-{{CODE}}-001
- **State:** off
- **Remove by:** 2026-12-01

Switch: `RESULTS_V2` in the app settings. Turn it on for everyone, then delete the flag and the old page.
```

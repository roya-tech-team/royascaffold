---
document_id: DOC-CAMP-RULES
title: Project rules
layer: design
schema_version: 2
document_status: approved
owners: [roya-team]
---

# Project rules

> **What:** the rules specific to this project that every change must follow (RULE-)
> **Read when:** designing or building anything; rules are included in full in every Context Pack that links them

Add one with `royascaff new record rule "<the rule>"`. General technology rules live in the adapter cards; only this project's own rules belong here.

### RULE-CAMP-001 · Dates use the client time zone

- **Owner:** roya-team
- **Applies to:** CMP-CAMP-CALENDAR

Every date on screen uses the client's time zone from the campaign. Breaking it shows a post on the wrong day.

## Record format (example)

```md
### RULE-CAMP-001 · Dates are shown in the client's time zone

- **Owner:** roya-team
- **Applies to:** CMP-CAMP-001

Every date on screen uses the client's time zone from the campaign, never the browser's. Breaking it looks like a post landing on the wrong day.
```

---
document_id: DOC-{{CODE}}-COMPONENTS
title: Components
layer: implementation
schema_version: 2
document_status: approved
owners: [{{OWNER}}]
---

# Components

> **What:** the parts of the code that own each responsibility, and their `Code:` globs
> **Read when:** finding where a feature lives in the code, or deciding where new code goes

<!-- royascaff:summary:start -->
<!-- royascaff:summary:end -->

Every source file of an app should belong to a component (`royascaff validate` reports the ones that do not).

## Record format (example)

```md
### CMP-{{CODE}}-001 · Results page

- **Owner:** {{OWNER}}
- **Code:** apps/web/src/results/**
- **Realizes:** REQ-{{CODE}}-001
- **Implements:** CTR-{{CODE}}-001
```

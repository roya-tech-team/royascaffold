---
document_id: DOC-{{CODE}}-OPERATIONS
title: Operations
layer: operations
schema_version: 2
document_status: approved
owners: [{{OWNER}}]
---

# Operations

> **What:** how the system is built, deployed, watched and recovered
> **Read when:** releasing, running, or fixing the system in an environment

## 1. Environments

_Each environment, where it runs, and how it is configured._

## 2. Build and deploy

_The exact steps or pipeline, and who may run them._

## 3. Health and monitoring

_What is watched (errors, latency, usage), where, and who is alerted._

## 4. Backup, rollback and recovery

_How to go back to the last good version and restore data; how long it takes._

## Record format (example)

```md
## 2. Build and deploy

- `npm run build` in `apps/web`, then upload `apps/web/dist` to the static host.
- Only the release owner deploys to production, after `royascaff new record release`.
```

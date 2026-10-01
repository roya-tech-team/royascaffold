---
document_id: DOC-ENG-COVERAGE
title: Brief coverage
layer: discovery
schema_version: 2
document_status: approved
owners: [roya-team]
---

# Brief coverage

> **What:** every concrete demand of the original request (SRC-), and the requirement that covers it or why it is out of scope
> **Read when:** planning features, approving the roadmap, or checking nothing asked for was dropped

Add one per demand with `royascaff new record source "<the demand>" --quote "<exact words from request.md>"`: each numbered acceptance criterion, each screen or control, each quality demand, each "do not". Each demand is one row. While planning, fill **Covered by** with the REQ-/NFR-/CAP- that delivers it, or write **Out of scope** with the reason. `royascaff approve roadmap` refuses while a demand is neither.

## Demands

| SRC | Demand | Quote | Covered by | Out of scope |
|---|---|---|---|---|

### SRC-ENG-001 · Plan index of the 1.5 to 2.0 work

- **Quote:** Plan index
- **Covered by:**
- **Source file:** plans/v1.5-v2.0/README.md

### SRC-ENG-002 · Plan: engine 1.5, verify and automate

- **Quote:** Verify & automate
- **Covered by:**
- **Source file:** plans/v1.5-v2.0/01-engine-1.5-verify-and-automate.md

### SRC-ENG-003 · Plan: engine 1.6, evolve

- **Quote:** Engine 1.6
- **Covered by:**
- **Source file:** plans/v1.5-v2.0/02-engine-1.6-evolve.md

### SRC-ENG-004 · Plan: engine 1.7, agent interface

- **Quote:** Engine 1.7
- **Covered by:**
- **Source file:** plans/v1.5-v2.0/03-engine-1.7-agent-interface.md

### SRC-ENG-005 · Plan: Studio

- **Quote:** Studio
- **Covered by:**
- **Source file:** plans/v1.5-v2.0/04-royascaff-2.0-studio-saas.md

### SRC-ENG-006 · Plan: build program for Claude Code

- **Quote:** Build program for Claude Code
- **Covered by:**
- **Source file:** plans/v1.5-v2.0/05-build-program-for-claude-code.md

## Record format (example)

```md
| SRC | Demand | Quote | Covered by | Out of scope |
|---|---|---|---|---|
| SRC-ENG-004 | Planners drag posts between days | planners drag posts … between days | REQ-ENG-004 | |
| SRC-ENG-009 | No client accounts in the first release | Clients approve through a link; no accounts yet. | | the request defers accounts; approval by link is REQ-ENG-005 |
```

---
document_id: DOC-CAMP-DISCOVERY
title: Discovery
layer: discovery
schema_version: 2
document_status: approved
owners: [product-owner]
---

# Discovery

> **What:** what we know, what we assumed and what we asked before planning Campaign Planner
> **Read when:** starting the project, or when a plan seems to contradict what the person wants

## 1. Users and roles

Agency planners create and schedule campaigns. Clients review and approve posts through a link.

## 2. Problem and outcomes

Campaigns live in spreadsheets and approvals happen by email (OUT-CAMP-001, OUT-CAMP-002).

## 3. Scope and out of scope

First release: campaigns, a post calendar and client approval. Out: publishing to social networks, billing.

## 4. Success measures

Every active campaign is in the app within a month; median approval time under one working day.

## 5. Constraints

Desktop browsers first; two developers; English only.

## 6. Technology

- **Option A:** React + TypeScript web app with a small Node API: the team's current stack
- **Option B:** a low-code tool: fast, but client links and the calendar need custom work

**Recommendation:** Option A; confirmed by the owner (ADR-CAMP-001).

## 7. Data and content

Campaigns, posts and approvals created by planners; no import in the first release.

## 8. Look, feel and references

The agency brand; a calm calendar like a paper planner.

## Questions and assumptions

### QST-CAMP-001 · Do clients need an account to approve?

- **Topic:** users
- **Answer:** no, a private link per campaign is enough
- **Source:** chat 2026-09-19

### ASM-CAMP-001 · Planners work on desktop, clients may use phones

- **Topic:** constraints
- **Basis:** approvals are opened from email links

## Record format (example)

```md
### QST-CAMP-001 · Who judges the visual quality?

- **Topic:** look
- **Answer:** the product owner
- **Source:** chat 2026-09-30
```

---
document_id: DOC-{{CODE}}-ARCHITECTURE
title: Architecture
layer: design
schema_version: 2
document_status: approved
owners: [{{OWNER}}]
---

# Architecture

> **What:** the system on one page: context, apps, main parts, data flow and the rules between them
> **Read when:** designing any change, or finding where something belongs

Keep it short and current: link records (APP-, CMP-, ADR-, CTR-) instead of repeating them. A change whose Impact says "Architecture: changed" updates this page.

## 1. Context

_A Mermaid diagram: the users, this system, and every external system it talks to._

## 2. Apps and runtimes

_Each app (APP- record in profile.md), where it runs, and how they talk._

## 3. Main parts

_The main components (CMP-) and what each one owns._

## 4. Data flow

_How data enters, moves and is stored; what is the source of truth._

## 5. Dependency rules

_Which parts may call which (for example: UI never holds business rules; the scene never reads raw data)._

## 6. Key decisions

_Links to the ADR- records that shape the architecture._

## 7. Quality and operations

_The quality targets that shape the design (NFR-), and how it is built, checked and run._

## Record format (example)

```md
## 1. Context

A Mermaid `flowchart LR`: Planner → Web app → API → Database; the API also calls the mail service.

## 5. Dependency rules

- Pages call the API client only; business rules live in the API services.
- The scene reads the graph document; it never reads raw sample data.
```

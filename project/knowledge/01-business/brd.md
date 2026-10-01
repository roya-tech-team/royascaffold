---
document_id: DOC-ENG-BRD
title: Business brief
layer: business
schema_version: 2
document_status: approved
owners: [roya-team]
---

# Business brief

> **What:** why RoyaScaff engine exists, who it is for, and the outcomes it serves
> **Read when:** deciding whether a feature is worth building

## Problem

People who build software with AI assistants cannot tell what was really built, or whether "done" is still true after the code moved on. The engine that fixes this should prove itself on its own work.

## Users

The owner and the AI sessions that build RoyaScaff. Later: every team that builds a product with it.

## Scope and out of scope

This project is the engine and its release. The studio product built on top of it is a separate project.

## Core workflow

A change is opened, designed, planned in tasks, built, verified by machines, judged by a second session and closed with evidence.

## Key words

Evidence: proof that a requirement works. Stale: evidence whose code changed since it ran. Pinned copy: the engine that runs the work, never the one being changed.

## Outcomes

_Add outcomes with `royascaff new record outcome "<result you can measure>"`. Each says how success is measured._

### OUT-ENG-001 · The engine is built and checked by the engine itself

- **Owner:** roya-team

Measured by: every engine change since 1.5 is a closed change in `project/changes/` with fresh evidence, and `royascaff ci` passes.

## Record format (example)

```md
### OUT-ENG-001 · Clients see campaign results without asking

- **Owner:** roya-team

Measured by: fewer than 2 "how is my campaign doing?" messages per client per month.
```

Write in business language: people, needs and results. The design documents hold the technical detail.

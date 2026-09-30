---
document_id: DOC-{{CODE}}-QUALITY
title: Quality strategy
layer: quality
schema_version: 2
document_status: approved
owners: [{{OWNER}}]
---

# Quality strategy

> **What:** how we know {{NAME}} is good enough: targets, checks, who judges, and the risks we accept
> **Read when:** planning checks for a change, or deciding whether something is ready to ship

## 1. Quality targets

_The NFR- records that matter most, with their measure (speed, accessibility, security, visual quality)._

## 2. Checks and who runs them

_Which checks the runner does (build, typecheck, lint, test), which a person does (visual review, demo), and when._

## 3. Evidence we keep

_What counts as proof for each kind of requirement, and where it lives (runner evidence, screenshots, notes)._

## 4. Accepted risks and gaps

_What we knowingly do not check yet, why, and until when._

## Record format (example)

```md
## 2. Checks and who runs them

- Runner: typecheck, lint and unit tests on every task; build and all tests at Check.
- Person: the product owner looks at every UI change on a desktop screen before it is verified.
```

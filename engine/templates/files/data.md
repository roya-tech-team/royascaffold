---
document_id: DOC-{{CODE}}-DATA
title: Data
layer: design
schema_version: 2
document_status: approved
owners: [{{OWNER}}]
---

# Data

> **What:** the data the system keeps: entities, fields, rules, and where the truth lives
> **Read when:** designing anything that stores, loads or changes data

## 1. Entities

_Each entity, its key fields and types, and which concept (CON-) it represents._

## 2. Rules and constraints

_Required fields, allowed values, uniqueness, and the invariants (INV-) the data must keep._

## 3. Source of truth and flow

_Where each entity comes from, who may change it, and how it is loaded, cached or generated._

## 4. Changes over time

_Migrations, versioning, backfills and how to roll back. "None yet" is a valid answer._

## Record format (example)

```md
## 1. Entities

| Entity | Key fields | Concept |
|---|---|---|
| Campaign | id, clientId, name, startDate, endDate, channels | CON-{{CODE}}-001 |
| Post | id, campaignId, channel, scheduledAt, status | CON-{{CODE}}-002 |
```

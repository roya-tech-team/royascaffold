---
document_id: DOC-CAMP-ARCHITECTURE
title: Architecture
layer: design
schema_version: 2
document_status: approved
owners: [product-owner]
---

# Architecture

> **What:** the system on one page: context, apps, main parts, data flow and the rules between them
> **Read when:** designing any change, or finding where something belongs

## 1. Context

Planners and clients use the web app (APP-CAMP-WEB) in a browser.

## 3. Main parts

Campaign form and list (CMP-CAMP-001), the post calendar.

## 5. Dependency rules

Pages call the API client only; business rules live in the API.

- `apps/web/src/calendar/**` must not import `apps/web/src/campaigns/**`: the calendar reads campaigns through the API client.

## 6. Key decisions

ADR-CAMP-001.

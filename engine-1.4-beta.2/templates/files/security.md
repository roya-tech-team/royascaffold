---
document_id: DOC-{{CODE}}-SECURITY
title: Security and privacy
layer: design
schema_version: 2
document_status: approved
owners: [{{OWNER}}]
---

# Security and privacy

> **What:** who may do what, which data is sensitive, and how the system protects it
> **Read when:** a change touches accounts, permissions, personal data, money, secrets or external input

## 1. Actors and permissions

_Who the users and systems are, and what each may read or change._

## 2. Sensitive data

_What is personal, secret or regulated; where it is stored; how long it is kept; who can see it._

## 3. Threats and controls

_The main ways the system could be misused, and the control for each (validation, rate limits, encryption, audit)._

## 4. Secrets and configuration

_Where secrets live, who can change them, and how they are rotated._

## Record format (example)

```md
## 1. Actors and permissions

| Actor | May | May not |
|---|---|---|
| Planner | create and edit campaigns of their agency | see other agencies' campaigns |
| Client (link) | approve or reject posts of one campaign | edit posts |
```

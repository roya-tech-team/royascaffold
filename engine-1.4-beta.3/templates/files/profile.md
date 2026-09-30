---
document_id: DOC-{{CODE}}-PROFILE
title: Project profile
layer: profile
schema_version: 2
document_status: approved
owners: [{{OWNER}}]
royascaff: 1.4
project_code: {{CODE}}
project_name: {{NAME}}
context_budget_tokens: 12000
max_tasks_per_change: 5
checks_on_task_done: quick
knowledge_profile: {{PROFILE}}
adapters: [{{ADAPTERS}}]
---

# Project profile

> **What:** how this project is built, checked and owned
> **Read when:** setting up, or when a command or path is unclear

Fill in the commands of each app: `royascaff check` runs them in the app's folder.

{{APPS}}

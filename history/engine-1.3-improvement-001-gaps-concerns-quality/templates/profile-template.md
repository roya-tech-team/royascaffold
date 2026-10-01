# Project Profile Template

```yaml
---
document_id: DOC-PROFILE-001
title: Project profile
layer: profile
schema_version: 1
document_status: approved
owners: [team]
project_name: <name>
project_kind: <api|web|cli|library|worker|data|embedded|ai-ml|mixed>
artifact_profile: <compact|modular|federated>
adoption_mode: <legacy-compatible|transition|strict>
adapters: [generic]
source_roots: [<relative source root>]
source_extensions: [.js, .ts]
default_context_tokens: 12000
---
```

Add applications/runtimes, repositories, commands (build/test/lint/typecheck/security/deploy), environments, integrations, configuration/secrets ownership, generated/excluded paths, brand/interface tokens when applicable, and ownership/reviewer rules.

Also add adapter versions/selections, optional runner bindings, context tiers/budgets,
quality threshold authorities, and review/adjudicator policy. `validate` does not execute
project commands; verification invokes only explicitly approved procedures.

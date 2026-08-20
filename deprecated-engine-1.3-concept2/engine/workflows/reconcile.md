---
schema: royascaff/workflow-definition/v1
name: reconcile
version: 1
purpose: Apply a verified after-state to canonical knowledge atomically, regenerate indexes, and archive the change.
steps:
  - id: reconcile
    skill: reconcile-knowledge
  - id: validate
    skill: verify-change
    requires: [reconcile]
---

# Reconcile

Require verified state and compatible target baseline. Preview full after-state file operations, apply with scoped backups, regenerate indexes/system map, validate the entire canonical repository, roll back on failure, write reconciliation evidence, and archive the change. Implementation skills never perform this operation.

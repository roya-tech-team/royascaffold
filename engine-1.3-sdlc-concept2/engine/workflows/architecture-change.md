---
schema: royascaff/workflow-definition/v1
name: architecture-change
version: 1
purpose: Change cross-system architecture through reviewed decisions and staged reversible migration.
steps:
  - id: decision
    skill: design-architecture
  - id: impact
    skill: analyze-change-impact
    requires: [decision]
  - id: migration
    skill: plan-refactor
    requires: [impact]
  - id: plan
    skill: plan-execution
    requires: [migration]
  - id: implement
    skill: implement-task
    requires: [plan]
  - id: verify
    skill: verify-change
    requires: [implement]
  - id: reconcile
    skill: reconcile-knowledge
    requires: [verify]
---

# Architecture Change

Draft an ADR/RFC, compare alternatives and consequences, resolve cross-artifact/repository impact, define transition states, compatibility, rollout, and rollback, obtain architecture/security approval, execute dependency-ordered stages, validate every transition state, and reconcile final architecture plus accepted decision history.

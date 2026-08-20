---
schema: royascaff/workflow-definition/v1
name: refactor
version: 1
purpose: Improve implementation structure while preserving approved external behavior and contracts.
steps:
  - id: characterize
    skill: plan-refactor
  - id: impact
    skill: analyze-change-impact
    requires: [characterize]
  - id: plan
    skill: plan-execution
    requires: [impact]
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

# Refactor

Identify behavior/contracts that must remain invariant, establish characterization tests, define target components/code map, create an ADR only for lasting architectural decisions, execute safe increments, verify behavior equivalence and architecture rules, then reconcile component/code-map knowledge.

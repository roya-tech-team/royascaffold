---
schema: royascaff/workflow-definition/v1
name: change-feature
version: 1
purpose: Add or modify behavior through an isolated, risk-aware, baseline-specific after-state delta.
steps:
  - id: route
    skill: route-work
  - id: requirements
    skill: elicit-requirements
    requires: [route]
  - id: impact
    skill: analyze-change-impact
    requires: [requirements]
  - id: design
    skill: design-architecture
    requires: [impact]
  - id: contracts
    skill: design-contracts
    requires: [impact]
  - id: plan
    skill: plan-execution
    requires: [design, contracts]
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

# Change Feature

Create a change, compile analysis context, define testable outcome, resolve graph/code/test impact, draft only affected after-state files, approve material decisions according to risk, plan bounded tasks, compile per-task context, implement, verify, and reconcile.

Material deviations return to design. Archived changes never become current architecture.

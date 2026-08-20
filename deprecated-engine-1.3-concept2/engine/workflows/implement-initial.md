---
schema: royascaff/workflow-definition/v1
name: implement-initial
version: 1
purpose: Deliver an approved greenfield design through bounded vertical changes and tasks.
steps:
  - id: slice
    skill: analyze-change-impact
  - id: plan
    skill: plan-execution
    requires: [slice]
  - id: context
    skill: compile-context
    requires: [plan]
  - id: implement
    skill: implement-task
    requires: [context]
  - id: verify
    skill: verify-change
    requires: [implement]
  - id: reconcile
    skill: reconcile-knowledge
    requires: [verify]
---

# Implement Initial System

Materialize the next dependency-ready vertical change or small batch. Compile and execute one task at a time. Verify and reconcile each change before moving to later dependent scope. Finish with a system-level validation report.

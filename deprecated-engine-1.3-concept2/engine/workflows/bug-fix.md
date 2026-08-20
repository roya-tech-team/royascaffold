---
schema: royascaff/workflow-definition/v1
name: bug-fix
version: 1
purpose: Correct behavior against canonical truth with root-cause and regression evidence, escalating material knowledge changes.
steps:
  - id: investigate
    skill: investigate-bug
  - id: impact
    skill: analyze-change-impact
    requires: [investigate]
  - id: implement
    skill: implement-task
    requires: [impact]
  - id: verify
    skill: verify-change
    requires: [implement]
  - id: reconcile
    skill: reconcile-knowledge
    requires: [verify]
---

# Bug Fix

Reproduce, resolve expected behavior from canonical knowledge, document root cause, and classify scope/risk. Use a compact direct task only when canonical behavior/contracts/architecture remain correct. Require a regression test or explicit justified exception. Security, corruption, migration, public-contract, or irreversible fixes use the full Change Feature workflow.

---
schema: royascaff/workflow-definition/v1
name: reverse-engineer
version: 1
purpose: Build reviewed canonical knowledge from an existing implementation in bounded evidence-backed module passes.
steps:
  - id: inventory
    skill: initialize-knowledge
  - id: module
    skill: reverse-engineer-module
    requires: [inventory]
  - id: impact
    skill: analyze-change-impact
    requires: [module]
  - id: verify
    skill: verify-change
    requires: [impact]
---

# Reverse Engineer

Inventory repositories/apps/config/commands, choose one bounded module, extract components/contracts/data/workflows with path/line evidence, infer requirements/domain with confidence, obtain module-owner review, merge only reviewed knowledge, repeat, then run cross-system drift validation and queue gaps as changes.

Never mark inference verified from file presence alone.

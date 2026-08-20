---
schema: royascaff/workflow-definition/v1
name: design-project
version: 1
purpose: Transform a greenfield product concept into approved layered canonical design and an initial execution program.
steps:
  - id: requirements
    skill: elicit-requirements
  - id: domain
    skill: model-domain
    requires: [requirements]
  - id: architecture
    skill: design-architecture
    requires: [requirements, domain]
  - id: workflows
    skill: model-workflow
    requires: [requirements, domain]
  - id: contracts
    skill: design-contracts
    requires: [architecture, workflows]
  - id: plan
    skill: plan-execution
    requires: [contracts]
---

# Design Project

Create requirements/NFR/security constraints, domain language/contexts, architecture, primary workflows, contracts/data, components, and code-map plan. Run deterministic traceability validation, surface material decisions, obtain one structured design approval, then produce a dependency-aware initial execution program.

Do not generate all implementation changes up front when early delivery can change later design.

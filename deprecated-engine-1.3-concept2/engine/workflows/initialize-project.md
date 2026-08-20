---
schema: royascaff/workflow-definition/v1
name: initialize-project
version: 1
purpose: Establish repository boundaries, project profile, adapters, ownership, and the canonical knowledge root.
steps:
  - id: inspect
    skill: initialize-knowledge
  - id: validate
    skill: verify-change
    requires: [inspect]
---

# Initialize Project

1. Detect greenfield versus existing implementation.
2. Create directories and draft profile without inventing product facts.
3. Discover/confirm repositories, applications, source roots, commands, exclusions, owners, and adapters.
4. Validate initialization.
5. Route to Design Project or Reverse Engineer.

Human decision: confirm discovered boundaries and adapters once.

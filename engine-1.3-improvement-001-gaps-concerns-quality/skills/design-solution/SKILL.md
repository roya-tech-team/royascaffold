---
name: design-solution
description: Turn an approved Quality Design Contract, requirements, references, and domain behavior into a coherent project-specific solution with explicit material patterns and alternatives.
---

# Design Solution

- Inputs: approved QDC, RDRs, requirement/workflow slice, selected adapter composition,
  current architecture/data/contracts/experience/content/components, and NFRs.
- Writes: design and implementation-map delta; no code.
- Evaluate product behavior, boundaries, security/privacy, data/migration,
  contracts/compatibility, experience, content credibility, components/actions,
  performance, quality/operations, and foundation-before-option ordering.
- For each material choice create `PAT-*`: problem/forces, chosen pattern and fit,
  adapter provenance, constraints, failure modes, rejected alternatives, affected
  IDs/tasks, and validation.
- Output decisions, after-state IDs/relations, contradictions/assumptions, likely
  first-pass risks, and verification/rollout needs.
- Do not reinterpret the stakeholder's quality bar. High-risk or high-judgment design
  proceeds to `review-solution-quality` before task compilation.

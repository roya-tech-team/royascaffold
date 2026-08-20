---
name: route-work
description: Classify intent, risk, project state, workflow, required layers, gates, and next action.
---

# Route Work

- Inputs: user outcome, profile, current active changes/status.
- Writes: routing decision only; no canonical product changes.
- Procedure: classify intent → risk dimensions → workflow → artifact profile → gate/evidence policy.
- Output: intent, risk, reasons/triggers, workflow, next skill, required approvals.
- Block when: project state or requested outcome cannot be resolved safely.


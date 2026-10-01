# Change Blueprint Template

```yaml
---
change_id: CHG-AREA-001
status: draft
intent: feature
risk: medium
uncertainty: medium
judgment: high
artifact_mode: standard
adoption_mode: transition
baseline_revision: <revision-or-migration-baseline>
owners: [team]
reviewers: []
selected_adapters: [generic]
rejected_adapters: []
required_gates: [solution-quality-review, implementation-readiness-review]
depends_on: []
claimed_ids: []
claimed_paths: []
---
```

Sections: outcome/source/non-goals; consequence/uncertainty/judgment reasons; known
findings/decisions/assumptions; QDC or QDC link; reference/pattern decisions; selected/
rejected adapters and conflicts; affected layers/IDs/evidence; proposed after-state;
SQR/IRR links and reviewed revisions; compatibility/migration; foundation-first
execution/context/evidence; approvals/authority; blockers; history.

Compact work may embed QDC and review checklists here. `ready` requires every triggered
gate to pass and every material decision to be decided or an authority-approved
assumption.

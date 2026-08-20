# Context Manifest Template

```yaml
---
manifest_id: CTX-AREA-TASK-001
role: implementer
context_tier: standard
root_ids: [TASK-AREA-001]
include_ids: [CRIT-AREA-001, DEC-AREA-001, RDR-AREA-001, PAT-AREA-001, REQ-AREA-001, CMP-AREA-001, TEST-AREA-001]
include_documents: [profile.md]
review_ids: [REV-AREA-IRR-001]
max_tokens: 12000
overflow: fail-and-split
---
```

Body records purpose, inclusion reasons and provenance, required decisions/criteria,
selected adapter contributions, reviewed source revisions, on-demand/excluded material,
selected paths/symbols, non-goals, stop/escalation conditions, contradictions checked,
and expected output path. Build with `bin/sdlc.js context`.

The pack is a generated delivery view. It cannot own or approve a decision. Required
meaning is never silently truncated; remove irrelevant duplication or split the task.

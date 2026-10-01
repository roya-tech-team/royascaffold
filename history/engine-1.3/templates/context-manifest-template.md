# Context Manifest Template

```yaml
---
manifest_id: CTX-AREA-TASK-001
role: implementer
root_ids: [TASK-AREA-001]
include_ids: [REQ-AREA-001, WF-AREA-001, CTR-AREA-001, CMP-AREA-001, TEST-AREA-001]
include_documents: [profile.md]
max_tokens: 12000
overflow: fail-and-split
---
```

Body records purpose, inclusion reasons, on-demand/excluded material, selected paths/symbols, stop/escalation conditions, and expected output path. Build with `bin/sdlc.js context`.


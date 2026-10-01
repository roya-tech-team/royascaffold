---
manifest_id: CTX-KUNI-TASK-002
role: implementer
context_tier: standard
root_ids: [TASK-KUNI-002]
include_ids: [TASK-KUNI-002, CRIT-KUNI-002, CRIT-KUNI-003, CRIT-KUNI-018, DEC-KUNI-003, DEC-KUNI-005, DEC-KUNI-008, DEC-KUNI-013, PAT-KUNI-002, PAT-KUNI-005, PAT-KUNI-006, RDR-KUNI-004, RDR-KUNI-014, INV-KUNI-001, INV-KUNI-006, CMP-KUNI-CONFIG, CMP-KUNI-GENERATOR, CMP-KUNI-STORE, TEST-KUNI-002]
include_documents: [knowledge/04-design/data/graph-model.md, knowledge/04-design/experience/experience.md]
review_ids: [REV-KUNI-SQR-001]
max_tokens: 16000
overflow: fail-and-split
---

# Context · TASK-KUNI-002

Purpose: implement generic types, centralized visual config, and a seeded clustered dummy graph.

Do not copy the reference entity set. Do not put meshes in the store.

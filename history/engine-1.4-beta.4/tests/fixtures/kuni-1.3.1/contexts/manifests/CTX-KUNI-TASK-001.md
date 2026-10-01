---
manifest_id: CTX-KUNI-TASK-001
role: implementer
context_tier: standard
root_ids: [TASK-KUNI-001]
include_ids: [TASK-KUNI-001, CRIT-KUNI-001, CRIT-KUNI-020, CRIT-KUNI-023, DEC-KUNI-002, PAT-KUNI-001, RDR-KUNI-001, REQ-KUNI-001, NFR-KUNI-006, CMP-KUNI-APP, TEST-KUNI-001, TEST-KUNI-005, REV-KUNI-SQR-001]
include_documents: [profile.md, knowledge/04-design/architecture/overview.md]
review_ids: [REV-KUNI-SQR-001]
max_tokens: 16000
overflow: fail-and-split
---

# Context · TASK-KUNI-001

Purpose: implement the client foundation without inventing product behavior.

Required decisions are the include_ids. Do not add Angular, Vue, a backend, or extra routes.

Stop if a material decision is missing. Context is a generated view and owns no truth.

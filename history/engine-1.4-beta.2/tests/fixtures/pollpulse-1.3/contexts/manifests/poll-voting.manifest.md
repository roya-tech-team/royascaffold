---
manifest_id: CTX-POLLPULSE-VOTE-001
role: verifier
root_ids: [REQ-VOTE-001, REQ-VOTE-002]
include_ids: [INV-VOTE-001, INV-VOTE-002, WF-POLLS-001, CTR-POLLS-VOTE-001, CTR-POLLS-DETAIL-001, EP-POLLS-04, SVC-POLLS-01, SVC-POLLS-03, DATA-VOTES-001, TEST-VOTE-001, RISK-TEST-001]
include_documents: [profile.md, knowledge/04-design/architecture/overview.md, knowledge/05-implementation/code-map/api.md]
max_tokens: 12000
overflow: fail-and-split
---

# Poll Voting Verification Slice

Purpose: give a verifier the complete intended vote behavior, boundaries, implementation owners, physical files, and missing-test truth without loading the full PollPulse blueprint or historical v1.2 packs.

Excluded: unrelated registration UI detail, poll creation UI, release history, archived migration narrative, and web styling source. On-demand source is limited to API files named by the code map and the poll detail/API client if interface behavior is examined.

Stop if the required test cannot be expressed without a new contract, migration, or behavior decision; return to change analysis instead of inventing it.


# Quality Design Contract Template

Use a separate file for standard/rigorous work; embed the same sections in `change.md`
for compact work.

```yaml
---
document_id: DOC-CHG-AREA-001-QDC
title: Quality Design Contract
layer: change-quality
schema_version: 2
document_status: in-review
owners: [product-owner]
change_id: CHG-AREA-001
first_pass_target: B+
final_target: A
---
```

Record outcome, audience, priority order, foundation/optional split, unacceptable
outcomes, content/data policy, references, constraints, assumptions, and authority.

For each `CRIT-*` include standard metadata plus Priority, Foundation, Outcome,
Threshold authority, Method, Authority class, Verified by, and relevant DEC/RDR links.
Mechanisms belong in constraints or `PAT-*`; they are not outcome criteria by
themselves.

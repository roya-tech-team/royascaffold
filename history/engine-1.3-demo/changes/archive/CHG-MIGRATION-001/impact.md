# Migration Impact

| Layer | State | Result |
|-------|-------|--------|
| Business/requirements | changed | extracted explicit outcomes/requirements/NFRs from description/rules/source |
| Domain/workflows | changed | concepts/invariants and auth/poll UML added |
| Architecture/security/data | changed | actual two-app/SQLite/JWT design and risks recorded |
| Contracts/experience | changed | request/response/journey boundaries made explicit |
| Components/actions/code/tests | changed | legacy IDs preserved; significant components and 40-file code map added; missing tests planned |
| Quality/operations/release | changed | evidence rules, accepted debt, local operations, non-production snapshot added |
| Application code | unchanged | `example-v1.2/apps/` read-only |

Risk is medium: broad documentation migration with no application mutation, but false verification could mislead future work. Mitigation is explicit status mapping and deterministic validation.


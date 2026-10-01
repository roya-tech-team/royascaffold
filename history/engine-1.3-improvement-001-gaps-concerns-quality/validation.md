# Contract Validation and Diagnostics

`bin/sdlc.js validate` checks machine-observable contracts only. Diagnostics include a
stable family code, owner/record, reason, and corrective direction.

| Family | Meaning |
|---|---|
| `ADP-*` / `CHG-ADAPTER` | adapter missing, prerequisite, conflict, or profile mismatch |
| `CHG-QBD` / `CHG-GATE` | quality routing metadata/gates incomplete |
| `DEC-*` / `ASM-*` | invalid/unresolved material decision or assumption authority |
| `QDC-MISSING` / `CRIT-*` | no must outcome, incomplete quality criterion, or no task owner |
| `RDR-*` | reference decision incomplete or not traced to criterion/task |
| `PAT-*` | material pattern decision incomplete |
| `TASK-*` | task contract or foundation/optional ordering invalid |
| `REV-*` | gate review missing, invalid, non-independent, or stale |
| `CTX-*` | manifest omits a task-required decision/review |
| `EVD-*` | evidence invalid, unbound, unauthorized, or stale |

Warnings are used for legacy-compatible enrichment and non-blocking density/coverage
signals. Strict mode turns triggered contract failures into blockers. Successful output
says `Contract validation PASS`; semantic SQR/IRR and evidence adjudication remain
necessary.

`index` generates disposable `quality-contracts.md`, `readiness.md`,
`evidence-freshness.md`, and `adapters.md` in addition to the v1.3 views. Delete and
regenerate them freely; they own no truth.

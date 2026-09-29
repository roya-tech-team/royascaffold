# v1.2 to v1.3 Migration Report

## Source

- Legacy blueprint/code: `example-v1.2/`.
- Migration target: this folder.
- Legacy folder was read-only and remains unchanged.

## Preserved

- Product scope, workflows, data rules, all `SVC-*`, `EP-*`, `PG-*` IDs.
- Three historical REQ-INIT pack summaries and their order/provenance.
- Actual Express/React/SQLite source behavior and paths.

## Added

- business outcomes/capabilities, requirements/NFRs, concepts/invariants/workflows/UML;
- project architecture/security/data/contracts/experience;
- generic components/actions, complete code maps, test catalog;
- quality/accepted risks/operations/release knowledge;
- one migration Change Blueprint, Context Manifest, generated indexes, and evidence records.

## Corrected truth

Legacy verification files asserted PASS without command output, test paths, revision, or tool/environment. The packages contain no test scripts. The migration therefore uses `implemented`, not `verified`, for application behavior and creates planned `TEST-*` records.

## Known legacy irregularity

Only the foundation pack contains a `blueprint/` index; auth/polls packs omit the isolated blueprint content implied by the v1.2 contract. This is retained as historical provenance, not repaired or invented in the migrated current truth.


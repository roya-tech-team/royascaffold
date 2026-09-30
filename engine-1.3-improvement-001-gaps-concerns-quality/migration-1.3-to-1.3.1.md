# Migrate RoyaScaff 1.3 to 1.3.1

## Safe default

Do not bulk-rewrite a valid 1.3 blueprint. Preserve IDs and Main ownership. Start in
`legacy-compatible`, run read-only validation, then choose transition or strict.

## Procedure

1. Preserve the original engine/project and record its revision.
2. Run the 1.3 validator and retain its result.
3. Point the project at 1.3.1 with `adoption_mode: legacy-compatible` in `profile.md`.
4. Run `validate` and classify diagnostics:
   - incompatible: must resolve before using 1.3.1;
   - enrich-on-touch: add when a new change affects this truth;
   - warning: improvement recommended but not a historical blocker;
   - informational: generated/index difference only.
5. Normalize selected adapters to the manifest contract; keep `generic` selected.
6. Move to `transition` for new changes. Add consequence/uncertainty/judgment,
   artifact mode, selected adapters, and routed gates to each new Change.
7. Enrich active high-judgment work with QDC/RDR/pattern/SQR/IRR semantics.
8. Use `strict` only after fixtures and active changes pass its blockers.

Completed historical 1.3 changes do not retroactively require QDC or reviews. Old
evidence remains history; a new current PASS uses 1.3.1 freshness and authority fields.

## Rollback

Pin the project to the original 1.3 engine and retain the 1.3.1 records as ordinary
Markdown history. Generated views can be removed and regenerated. Do not reinterpret
stale evidence as PASS during rollback, and do not renumber IDs.

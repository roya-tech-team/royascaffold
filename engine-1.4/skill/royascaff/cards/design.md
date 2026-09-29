# Card · Stage 2 — Design

Write the **After-state** section of `change.md`: how the system will look after this change.

- Name the components that change or appear: `royascaff new record component "<name>" --code "apps/web/src/x/**" --realizes REQ-…`.
- Name the contracts (`CTR-`: API, events, props), data changes, and any rule or invariant the code must enforce.
- Record every material choice (a pattern, a library, the data shape, the UI approach) with `royascaff new record decision "<choice>"`: the options, the choice, and why. Contracts: `royascaff new record contract "<API or event>"`.
- Reuse what exists. Check `royascaff trace` for the requirement, and the code map, before creating anything new.
- Keep the design at the level a different developer could implement without inventing anything public.

Then run `royascaff advance <CHG> --to approved --by ai:<tool>`.

- For medium, high or critical risk the gate waits for a person. Tell them: "Review the After-state in `project/changes/<CHG>/change.md`, then run `royascaff approve <CHG>`". Stop there.
- Editing the design after approval makes the approval stale. The person must approve again.

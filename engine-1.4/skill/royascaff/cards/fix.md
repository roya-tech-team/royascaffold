# Card · Fix a bug or polish

1. Find what the fix affects: `royascaff trace <REQ-…>` or `royascaff show <CAP-…>`. If the intended behavior is not written down anywhere, stop and plan it as a feature change instead.
2. Open the fix: `royascaff open --kind bug "<symptom>" --affects REQ-… --by ai:<tool>` (use `--kind polish` for copy or visual-only work). Risk defaults to low. Raise it with `--risk` when the fix touches security, data, money or a public contract.
3. In `change.md`, write the **Outcome** (the expected behavior), the root cause, and the **Impact** table.
4. Add one or two tasks with `royascaff new task` (see `cards/plan.md`). Include a regression test.
5. Run `royascaff advance <CHG> --to ready --by ai:<tool>`. Then build (`cards/build.md`) and check and record (`cards/check-record.md`). The evidence is the regression check.

A fix never changes approved behavior silently. If the fix changes what a requirement says, update the requirement and tell the person.

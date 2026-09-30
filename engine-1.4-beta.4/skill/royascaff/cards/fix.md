# Card · Fix, polish or refactor

1. Find what it affects: `royascaff trace <REQ-…>` or `royascaff show <CAP-…>`. If the intended behavior is not written down anywhere, stop and plan it as a feature instead.
2. Open it: `royascaff open --kind bug "<symptom>" --affects REQ-… --by ai:<tool>` (`--kind polish` for visual or copy work, `--kind refactor` for structure without behavior change). Risk defaults to low; raise it with `--risk` for security, data, money or a public contract.
3. In `change.md`, write the **Outcome** (expected behavior), the root cause, and the **Impact** table.
4. Add one or two tasks with `royascaff new task` (see `cards/plan.md`):
   - **bug:** include a regression test that fails before the fix;
   - **refactor:** first record a characterization check (tests or a recorded run) that must give the same result after; behavior, contracts and requirements do not change;
   - **polish:** say what the person will look at.
5. Run `royascaff advance <CHG> --to ready --by ai:<tool>`, then build (`cards/build.md`) and check and record (`cards/check-record.md`).

A fix never changes approved behavior silently. If the fix changes what a requirement says, update the requirement and tell the person: the feature plan then needs their approval again.

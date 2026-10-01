# Card · Fix, polish or refactor

1. Find what it affects: `royascaff trace <REQ-…>` or `royascaff show <CAP-…>`. If the intended behavior is not written down anywhere, stop and plan it as a feature instead.
2. Open it: `royascaff open --kind bug "<symptom>" --affects REQ-… --by ai:<tool>` (`--kind polish` for visual or copy work, `--kind refactor` for structure without behavior change). Risk defaults to low; raise it with `--risk` for security, data, money or a public contract.
3. In `change.md`, write the **Outcome** (expected behavior), the root cause, and the **Impact** table.
4. Add one or two tasks with `royascaff new task` (see `cards/plan.md`):
   - **bug:** include a regression test that fails before the fix;
   - **refactor:** first record a characterization check (tests or a recorded run) that must give the same result after; behavior, contracts and requirements do not change;
   - **polish:** say what the person will look at.
5. Run `royascaff advance <CHG> --to ready --by ai:<tool>`, then build (`cards/build.md`) and check and record (`cards/check-record.md`).

A fix never changes approved behavior silently. If it changes what a requirement, workflow or contract says, use a delta instead:

- **Change what exists:** `royascaff change REQ-… --after "<new wording>" --why "<SRC- or reason>" --by ai:<tool>` opens an `evolve` change and lists every test, evidence, slice and component that depended on the old wording. Mark each in the change: `update`, or `still valid (reason)`. A contract that loses a field is breaking: risk high, a person approves. Evidence of the old version turns stale; `royascaff verify` proves the new one. `royascaff history REQ-…` shows every version; `royascaff diff REL-A REL-B` compares releases.
- **Roll back:** `royascaff rollback CHG-…|REL-…` opens a rollback change: revert the commits it lists (you run `git revert`; on a conflict in `project/` keep the current project files), edit the records back to the baseline wording, then `royascaff verify`.
- **Remove:** `royascaff deprecate REQ-…|CMP-…` schedules it for removal; its code shows as scheduled in every pack.

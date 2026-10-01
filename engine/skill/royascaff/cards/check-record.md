# Card · Stage 5 — Check & Record

**Check (all tasks done):**

1. Run `royascaff verify <CHG> --by ai:<tool>`. It runs the apps' Build, Typecheck, Lint, Test and Smoke and the adapters' checks, answers each typed acceptance line (`[unit]`, `[e2e]`, `[metric]`) and writes evidence with a fingerprint: it goes stale when the code changes. A pass proves every `runner:test` `TEST-` that verifies this change's requirements.
2. It also fails on dependency rules (`` `a/**` must not import `b/**` ``) and unused dependencies. On a failure `next` gives a repair action; fix inside the tasks' allowed paths and verify again. After `repair_limit` (2) failed repairs the change blocks for a person.
2b. High or critical risk: a separate AI session (not you) runs `royascaff judge <CHG>` and records verdicts; never judge your own work.
3. For a requirement that no runner test verifies, add evidence to `project/changes/<CHG>/evidence/evidence.md`:
   ```
   ### EVD-<CODE>-NNN · <what was proven>
   - **Result:** pass
   - **Proves:** REQ-…
   - **Command:** manual: <steps>
   - **Git commit:** <short hash>
   ```
   A better fix is to add the test and a `TEST-` record, so the runner proves it next time.
4. UI change (adapters with a smoke check, as `web-ui`): run `royascaff smoke init` once; it opens the app in Chromium at three sizes and saves screenshots. For medium risk or more, ask the person to compare the app with the visual bar (discovery topic 8) and run `royascaff check <CHG> --result pass --note "looked at …" --bar all` (or the passing line numbers) in their own terminal: you cannot answer its prompt. Then `royascaff advance <CHG> --to verified --by ai:<tool>`.

**Record into Main:**

5. Update the knowledge so it describes the system as it now is: every layer the Impact marks **changed** edits its page (Architecture: `architecture.md` itself), and a record you added (ADR, CMP, CTR, RULE, INV) makes its layer changed. The Record gate checks both.
6. Commit the knowledge (`git add project && git commit -m "<CHG>: record"`), then run `royascaff advance <CHG> --to closed --by ai:<tool>`. It validates the project and regenerates `STATUS.md`. For high risk, a person approves once more before recording.

**Release** (when the person ships): `royascaff new record release "<version>" --includes CHG-…,CHG-…`. Features whose changes are all released show 🚀 Released.

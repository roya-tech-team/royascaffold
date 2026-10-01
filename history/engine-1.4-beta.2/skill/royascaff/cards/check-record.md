# Card · Stage 5 — Check & Record

**Check (all tasks done):**

1. Run `royascaff check <CHG> --by ai:<tool>`. It runs Build, Typecheck, Lint and Test of the apps in `project/profile.md` and writes the evidence. A passing run proves every `TEST-` record with `- **Check:** runner:test` that verifies this change's requirements.
2. On a failure, read the output it shows, fix it inside the tasks' allowed paths (or add a follow-up task), and run the check again.
3. For a requirement that no runner test verifies, add evidence to `project/changes/<CHG>/evidence/evidence.md`:
   ```
   ### EVD-<CODE>-NNN · <what was proven>
   - **Result:** pass
   - **Proves:** REQ-…
   - **Command:** manual: <steps>
   - **Git commit:** <short hash>
   ```
   A better fix is to add the test and a `TEST-` record, so the runner proves it next time.
4. UI change (web-ui adapter, medium risk or more): ask the person to open the app and try it, then to run `royascaff check <CHG> --result pass --note "looked at …"`. You cannot record it. Then run `royascaff advance <CHG> --to verified --by ai:<tool>`.

**Record into Main:**

5. Update the knowledge so it describes the system as it now is: requirements, components (`Code:` globs), contracts, decisions and tests. Fix anything the change made untrue.
6. Commit the knowledge (`git add project && git commit -m "<CHG>: record"`), then run `royascaff advance <CHG> --to closed --by ai:<tool>`. It validates the project and regenerates `STATUS.md`. For high risk, a person approves once more before recording.

**Release** (when the person ships): `royascaff new record release "<version>" --includes CHG-…,CHG-…`. Features whose changes are all released show 🚀 Released.

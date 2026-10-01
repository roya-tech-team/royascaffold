# RoyaScaff engine — rules for Claude Code

- This repo is the engine (npm `royascaff`). Plans: `plans/v1.5-v2.0/` (files 01–03, 05).
- Work one WP per session from file 05 §3; branch `wp/<ID>-<name>`; update `docs/PROGRESS.md`; stop at the checkpoint.
- Engine code: `engine/` (the only published package; tag `v1.4.0-beta.4` marks the beta.4 code). `history/` is frozen: read only. The repo root `package.json` is a private marker, not a package.
- Run the pinned tool for project work: `node scripts/tool.cjs <args>` (or `npx royascaff` when the alias royascaff-tool is in node_modules; see `docs/DOGFOOD.md`). Never run the working copy on itself: the engine warns when you do. This repo is a RoyaScaff project (`project/`): engine changes are changes there.
- Tests first. `npm test` (run in `engine/`, about 3-6 minutes: run it in the background) must pass. Baseline: fully green (392 tests at 1.7.0: 0 fail, 2 skipped on Windows, about 8 minutes; the skips need `sh` + `script` and Playwright; count them from the last lines of the run: `ℹ tests / pass / fail / skipped`). Editing `engine/` makes the evidence of closed changes stale: run `verify` again. `.gitattributes` forces LF in `engine/`. The contamination guard, the "no names in lib/" test and the token budgets must pass.
- Every command keeps its JSON envelope valid (contract tests). Adding fields = minor; removing = major (ask the owner).
- Core is generic: stack-specific behavior goes in adapters/*.json and their cards.
- Plain, simple English in docs and messages. Never publish to npm; the owner runs `npm run deploy`.
- Uncommitted changes the owner left in the tree (for example deleted `skills/*`) are not yours: never commit or revert them. Stage files by explicit path.

# RoyaScaff engine — rules for Claude Code

- This repo is the engine (npm `royascaff`). Plans: `plans/v1.5-v2.0/` (files 01–03, 05).
- Work one WP per session from file 05 §3; branch `wp/<ID>-<name>`; update `docs/PROGRESS.md`; stop at the checkpoint.
- Current engine code: `engine-1.4-beta.4/` (tag `v1.4.0-beta.4`). Other `engine-*` folders and `deprecated-*` are frozen history: read only.
- Run the pinned tool for project work: `npx royascaff` resolves to node_modules (alias royascaff-tool). Never run the working copy on itself.
- Tests first. `npm test` must pass (baseline: 207 tests, 206 pass, 1 skipped). The contamination guard, the "no names in lib/" test and the token budgets must pass.
- Every command keeps its JSON envelope valid (contract tests). Adding fields = minor; removing = major (ask the owner).
- Core is generic: stack-specific behavior goes in adapters/*.json and their cards.
- Plain, simple English in docs and messages. Never publish to npm; the owner runs `npm run deploy`.
- Uncommitted changes the owner left in the tree (for example deleted `skills/*`) are not yours: never commit or revert them. Stage files by explicit path.

# Card · Migrate a project from engine 1.2 or 1.3

Self-service: each team migrates its own project. Nothing is ever deleted.

1. **Preview.** Run `royascaff migrate` (add `--from 1.3|1.2` if it cannot tell; `--code CODE` to choose the project code). It is a dry run on a temporary copy: it shows files moved / edited / created, features, slices and changes, IDs archived, and the validation result. Nothing in the project changes.
2. **Review with the person.** Read the numbers and the "check by hand" list aloud. Ask before applying.
3. **Commit first.** The git tree must be clean (commit or stash) so the migration is one commit. Only use `--force` if the person says so; their uncommitted files are never touched either way.
4. **Apply.** `royascaff migrate --apply`. It writes `project/_legacy/<version>/MIGRATION.md` (what changed, old status values, what to check) and a snapshot of every original. If any record ID would be lost it undoes itself.
5. **Check.** `royascaff validate`, then `royascaff status` and `royascaff next`. Work through the "check by hand" list: app commands in `project/profile.md`, approvals for open medium/high-risk changes, closing changes that were reconciled in 1.3 (`royascaff check`, then `advance --to closed`).
6. **Commit** ("chore: migrate RoyaScaff 1.x → 1.4").

Undo at any time before new work: `royascaff migrate --rollback` restores the tree byte for byte.

What moves: 1.3 knowledge zones into `project/`, `changes/active|archive/<id>` → `changes/<id>`, `generated/` and `contexts/` → `project/_legacy/1.3/`. From 1.2: knowledge into `project/knowledge/`, packs and tracking files → `project/_legacy/1.2/`, and each pack becomes feature → slice → change.

When the old documents are badly out of date, adopt from the code instead (`cards/adopt.md`) and keep the old files in `_legacy/` as a reference.

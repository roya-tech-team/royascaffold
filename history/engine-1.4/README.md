# RoyaScaff Engine 1.4 (in development)

Plan: `benchmark/3d-network/version1.4-plan/` (design in file 02, decisions in file 08,
build plan in file 09). Engine 1.3 and 1.2 stay unchanged beside this folder.

## Build status

| Step | Scope | Status |
|---|---|---|
| 1 | Foundation: package, `project/` + `apps/` scan boundary, lossless Markdown ⇄ JSON, `export` / `render` / `roundtrip` | ✅ done (2026-09-29): 29 tests pass |
| 2 | Hierarchy + roadmap: `SLC-` slices, change kinds, typed relations vs mentions, `validate`, `show`, `new feature`, `new slice` | ✅ done (2026-09-29): 41 tests pass |
| 3 | Events + derivation: `log.md` event log, task state from events, evidence records, computed states for requirements / slices / features, depth, open fixes; `show` displays them | ✅ done (2026-09-29): 52 tests pass |
| 4 | Board + views: `project/STATUS.md` (Next up, features by horizon, active work, fixes, planned slices, recently closed, health), root pointer, opt-in summary blocks, `status`, `index`, `tasks`, `trace`, `log` | ✅ done (2026-09-29): 65 tests pass |
| 5 | State machine: `open` (slice or fix), `new task`, `advance` through gates, `approve`, `block`/`unblock`, `task start/done/block`, `check` (manual result), `next`, `brief`; every command logs an event and refreshes STATUS.md | ✅ done (2026-09-29): 81 tests pass |
| 6 | Git layer: commits made outside the engine, uncommitted developer files, automatic backups before a task (`backups`, restore), `record` after the fact, refinement (`refine`, `--confirm-refinement`, ready gate), changed since verified | ✅ done (2026-09-29): 89 tests pass |
| 7 | Context Packs: `context TASK` built from the task (no manifests), one-hop selection by usefulness, budget refusal, `--save`, real context-budget gate, glob code map warning | ✅ done (2026-09-29): 96 tests pass |
| 8 | Navigator skill (`SKILL.md` ~374 tokens) + 11 stage/situation cards (≤ 300 tokens each), `init`, `install --cursor --claude`, PLAYBOOK, GLOSSARY | ✅ done (2026-09-29): 101 tests pass |
| → | **`1.4.0-beta.1`** — package ready (47 files, 66 kB); see `docs/RELEASE-1.4.0-beta.1.md` | awaiting the owner's decision to publish |
| 9 | Basic command runner: `check CHG` runs each app's Build/Typecheck/Lint/Test, writes evidence (with failing output), proves runner-checked `TEST-` records; `--quick`; quick checks on `task done` for new projects (`--skip-checks "reason"`) | ✅ done (2026-09-29): 108 tests pass |
| 10 | Templates: 12 files with header cards and fenced worked examples, used by `init`, `open`, `new feature`; `new record <kind>` for 10 record kinds; readability warnings (header card, > 300 lines, technical words in business files) | ✅ done (2026-09-29): 113 tests pass |
| 11 | `feedback "…" --kind …` (report to review and send), `usage`, local usage counters (command shapes only, never text; off by env or profile), time in each status from the change logs | ✅ done (2026-09-29): 117 tests pass |
| 12 | Migration 1.3 → 1.4 and 1.2 → 1.4: `migrate` (dry run on a temporary copy), `--apply`, `--rollback`; nothing deleted, originals snapshotted, `_legacy/<ver>/MIGRATION.md`; `migrate.md` card | ✅ done (2026-09-29): 126 tests pass; the five real projects migrate with 0 errors, 0 lost IDs, byte-identical rollback |
| 13 | Acceptance run, then `rc` → `1.4.0` — plan file 09 §5 | next |

## Start a project (pilot)

```bash
node bin/royascaff.cjs init <repo> --name "Client Portal" --code PORT --app web=apps/web
node bin/royascaff.cjs install <repo>      # navigator skill for Cursor and Claude Code
```

Then, in the AI tool: **royascaff continue**.

An existing 1.3 or 1.2 project: `node bin/royascaff.cjs migrate <repo>` (dry run), then `--apply` (undo: `--rollback`). Release notes: `docs/RELEASE-1.4.0-beta.1.md`.

## Try it

```bash
node bin/royascaff.cjs where <repo>        # which folder is scanned
node bin/royascaff.cjs roundtrip <repo>    # Markdown -> JSON -> Markdown, byte-identical?
node bin/royascaff.cjs export <repo> --out project.json
node bin/royascaff.cjs render project.json --out /tmp/rendered
node bin/royascaff.cjs status <repo>       # regenerate and print the board
node bin/royascaff.cjs tasks <repo> --open
node bin/royascaff.cjs trace CAP-CAMP-001 tests/fixtures/greenfield
node bin/royascaff.cjs log <repo> --since 7d
node bin/royascaff.cjs validate <repo>     # IDs, links, roadmap, changes, tasks
node bin/royascaff.cjs next <repo>         # the one next action + stage card
node bin/royascaff.cjs brief <repo>        # one-page resume for a new AI session
node bin/royascaff.cjs open SLC-… <repo>   # start a slice;  open --kind bug "…" --affects REQ-…
node bin/royascaff.cjs advance CHG-… --to ready <repo>   # moves only through passing gates
node bin/royascaff.cjs task TASK-… done "hand-off note" <repo> --by ai:claude
node bin/royascaff.cjs record <commit> --as bug --affects REQ-… "what was done" --path <repo>
node bin/royascaff.cjs backups <repo>      # automatic backups of uncommitted developer files
node bin/royascaff.cjs context TASK-… <repo> [--save]   # everything one task needs
node bin/royascaff.cjs show CAP-CAMP-002 tests/fixtures/greenfield
node bin/royascaff.cjs new feature "Team workspaces" <repo> --horizon later
node bin/royascaff.cjs new slice CAP-CAMP-006 "Invite members" <repo> --delivers REQ-…
npm test
```

Requirements: Node ≥ 18, no dependencies.

## Design rules implemented so far

- **Lossless:** records' headings and `- **Key:** value` fields are rendered from data;
  anything non-canonical is kept verbatim in `raw`; everything that is not a record is
  kept as text. `roundtrip` proves byte identity on every run.
- **Scan boundary:** in the 1.4 layout only `project/` is read. `apps/`, dot-folders
  (`.cache`, `.backups`, `.cursor`, …), dependency/build folders and any copied engine folder
  are never scanned. Legacy 1.3 root layouts are read only from their knowledge zones.
- **Records are never nested:** any `ID · Title` heading starts a new record at any level;
  other headings stay inside the record body.
- **Relations vs mentions:** only known relation fields (`Feature`, `Delivers`, `Verified by`,
  `Depends on`, the 1.3 labels, …) create links. IDs anywhere else are mentions (backlinks only).
- **Kinds come from the ID prefix** (`CAP-` feature, `SLC-` slice, …).
- **Features** (`CAP-`) can live in any knowledge file; new ones go to
  `knowledge/00-roadmap/roadmap.md`. Their slices are the rows of a table whose first column
  is `Slice`, inside the feature's body.
- **Changes** are defined only by `change.md` front matter (`kind`, `slice`, `affects`,
  `status`). 1.3 `intent` values map to kinds. Tasks belong to the change folder they are in.
- **Transactional writes:** `new feature` / `new slice` re-validate after writing and restore the
  file if the write introduced an error.
- **Status is computed, never typed:** task state = last task event in `changes/<CHG>/log.md`;
  a requirement is ✅ Done only when the change delivering it is closed **and** passing
  evidence proves it (directly or through its test). Closed without evidence shows
  🧪 Checking with a "no passing evidence" warning.
- **Open fixes are visible:** an open bug/polish change that affects a Done requirement or
  feature is listed on it; it never changes Done.
- **One board, deterministic:** `project/STATUS.md` is regenerated by `index`/`status`, never by
  hand, and renders the same bytes for the same project state (golden snapshot tests). A root
  `STATUS.md` pointer is written only if the team has no root `STATUS.md` of its own.
- **Summary blocks are opt-in:** only text between `<!-- royascaff:summary:start -->` and
  `<!-- royascaff:summary:end -->` is ever rewritten inside a knowledge file.
- **Gates, not promises:** status changes only through `advance`, which runs the checks of
  every transition on the way and stops at the first failing one (plan 09 §3.6). Checks that
  belong to later build steps are reported as *pending*, never faked.
- **Approvals belong to people and to a design version:** `approve` refuses `ai:*` actors and
  records a hash of `change.md` (without front matter); editing the design afterwards makes the
  approval stale.
- **Freshness by log order:** a check counts only if it comes after the last `task.done` in the
  append-only log.
- **Git is the witness (on when the project folder is its own repository root, or with
  `git_subdir: true`):** a commit counts as covered when its files are knowledge only, its message
  starts with a task/change ID, it was attached with `record`, or its files fall inside a task's
  allowed paths while that change was open. Everything else is shown under "⚠ Work outside the
  engine".
- **The developer's uncommitted work is never discarded:** before a task starts, uncommitted files
  inside its allowed paths are copied to `project/.backups/` (self-ignored by git) and saved as a
  git stash entry without touching the working tree; restoring backs up the current versions first.
- **Done is flagged, not undone:** code changed after the verifying evidence shows
  "⚠️ changed since verified" until a later change covers it.
- **Refinement:** opening a slice whose requirements changed since it was planned needs
  `--confirm-refinement`; confirmations store fingerprints of the reviewed requirements, and the
  ready gate re-checks them.
- **Context Packs without manifests:** the task's `Inputs` are the roots; one hop of typed links
  adds rules the code must obey in full (contracts, invariants, rules, tests, decisions),
  workflows/NFRs/components compactly, and everything else as titles only. Over the budget
  (`context_budget_tokens`, default 12000) the pack is refused, never cut. Packs go to the
  git-ignored `project/.cache/`; `--save` keeps a linkable copy in the change folder.
- **Code map by globs:** source files under a declared app that no component's `Code:` globs own
  are reported as one warning per app (`code_exclude` for exceptions).
- **The runner only runs the project's own commands** (from the `APP-` records in `profile.md`),
  in each app's folder, with a timeout (`check_timeout_seconds`, default 600). A passing full run
  becomes evidence that proves the tests marked `Check: runner:…` for the change's requirements;
  quick runs (typecheck + lint) never count as the full check.
- **Every file comes from a template:** title, header card ("What" / "Read when"), summary
  block where useful, and a worked example in a fenced block under `## Record format (example)`
  (never parsed as a record). New records are always inserted above the example.
- **Feedback is data, and stays local:** each command adds one line to `project/.usage/usage.jsonl`
  (command, sub-command, duration, result, failed gate checks; never notes, titles or paths).
  `feedback` writes a report for the developer to review and send; nothing is sent automatically.
- **ESM-safe:** the CLI is CommonJS with a `.cjs` extension, so it runs inside
  `"type": "module"` projects.

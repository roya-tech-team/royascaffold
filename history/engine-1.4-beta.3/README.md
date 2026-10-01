# RoyaScaff Engine 1.4 — beta.3 (`1.4.0-beta.3`, not published)

> Copy of `engine-1.4-beta.2/` made 2026-09-30 to build step 12c, product quality (plan files 13 and 14).
> `engine-1.4/` (beta.1) and `engine-1.4-beta.2/` stay frozen.

> Copy of `engine-1.4/` (frozen as `1.4.0-beta.1`), made 2026-09-30 to build step 12b
> (plan files 10 and 11). All step 12b work happens here; `engine-1.4/` is not edited.

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
| 12b | Final review fixes (plan files 10 and 11), built in this copy, work package by work package | ✅ done (2026-09-30): 156 tests pass · package `1.4.0-beta.2` (not published) |
| 12b · WP1 | Discover stage (`discovery.md`, 8 topics, `QST-`/`ASM-` records, tech options + recommendation), `architecture.md` and `project/log.md` from `init`, `approve project`, `approve roadmap` / `approve CAP-…` (people only, hashed, stale on edit), features 📝 Outlined until approved, `open` refused without approvals, `discover.md` card | ✅ done (2026-09-30): 131 tests pass |
| 12b · WP2 | Git truth: `task done` needs the task's code **and** the project knowledge committed, and refuses files changed outside the task's allowed paths (a person may accept with `--outside-ok "<reason>"`); `advance --to closed` needs the knowledge committed; the board shows "⚠ Project knowledge not committed". Refinement in 1.4 projects = the person's plan approval (feature hash now includes the records the requirements link to; `refine` and `--confirm-refinement` are for people only). `context --save` refused for AI actors and needs `--reason` | ✅ done (2026-09-30): 132 tests pass |
| 12b · WP3 | Engine bugs A1–A6: baseline Done for existing work (closed knowledge/migration change with `affects:` + passing evidence); `next` orders must → should → could inside a horizon; Understand gate: "changed" layers name existing IDs or paths; Design gate: the After-state names an ADR-/CMP-/CTR- record or the architecture page; Record gate: changed source files belong to a component, and an architecture change edits the architecture page; warnings for missing Feature / Code / Check / Verifies / Outcome and ID ranges in relations; `next --json` says `initialized` | ✅ done (2026-09-30): 137 tests pass |
| 12b · WP4+5 | `knowledge_profile: standard` (default) or `lite` (`init --lite`); `new doc architecture|quality`; standard feature/refactor changes need a written quality strategy before Record. NFRs proven by evidence without a slice; a feature whose slices are all done but whose NFRs are unproven is 🧪 Checking ("prove NFR-…", also in `next`); a full check that ran every app with a Test command proves every runner-checked TEST- in the project | ✅ done (2026-09-30): 140 tests pass |
| 12b · WP6 | Adapters `generic`, `web-ui`, `web-api` (1.4 cards: Design, Rules, Check, Words; ≤ 600 tokens) in `adapters/`; `init --adapter`, `install` copies them; `next --json` names `adapter_cards` at Design and Check; every Context Pack carries the adapter's Rules; the adapter's Words extend the business-language check. R8: with `web-ui`, a feature/polish change of medium risk or more needs a person's recorded look (`check --result pass --note "looked at …"`) before verified — `next` shows it as a human step | ✅ done (2026-09-30): 145 tests pass |
| 12b · WP7 | `new doc architecture|data|experience|security|quality|operations` (new templates; experience holds UI states and design tokens); record kinds `rule` (RULE-, `Applies to`) and `release` (REL-, `Includes` → 🚀 Released, now also for features); richer brief (scope, core workflow, key words); design card: layer trigger table + the core rules; fix card covers fix, polish and refactor; `adopt` lists each app's modules and the share owned by components, and `next` proposes the first unowned module | ✅ done (2026-09-30): 150 tests pass |
| 12b · WP8+9 | Health on the board and in `status --json` (docs vs code, saved pack lines, largest open pack, code owned by components); duplicate-paragraph warning; `cache clear`; `royascaff continue` in the terminal explains itself. Migration adds discovery, architecture page and project log (unique document IDs), 1.2 profiles get their adapters, a 1.3 migration change `affects` what it documented. PLAYBOOK, GLOSSARY, release notes `docs/RELEASE-1.4.0-beta.2.md`; scripted walkthrough in git through the CLI from `init` to ✅ Done | ✅ done (2026-09-30): 156 tests pass |
| 12c · WP-C1 | Brief coverage: `init` creates `00-discovery/request.md` (the request, word for word) and `coverage.md`; record kind `source` (SRC-, `Quote`, `Covered by` / `Out of scope`); a quote not found in the filled request is an error, an uncovered demand a warning; `approve project` needs the request filled, ≥ 1 SRC and every quote found (request.md is in the project hash) and lists request list items nobody quoted; `approve roadmap` / `approve CAP-…` refused while a demand is uncovered and list the out-of-scope ones; board Health "Brief: X of Y demands covered"; `next` asks to cover the brief before the roadmap approval; discover card saves the request first | ✅ done (2026-09-30): 159 tests pass |
| 12c · WP-C2+C3 | Quality planned, foundation first, breadth waits, deferrals tracked (`lib/quality.cjs`): plan approval refused while a *must* NFR of a Now/Next feature is in no slice; within a priority, slices that deliver a must NFR go first (board "· foundation"); a Next/Later/Backlog slice is not ready while a Now feature is not ✅ Done and accepted (web-ui: a person looked at its last change) — `open` refuses (a person may `--force`), `next` asks for the look or says "Waits for Now"; `Deferred to: SLC-…` on records and in After-states: missing slice = error, finished slice = warning, vague wording ("in a later slice") = warning and refused at the Approved gate of feature changes; board shows "N deferred item(s)" per planned slice; plan-feature card (NFRs, cover the brief, foundation slice, Now first) and design card (Deferred to) | ✅ done (2026-09-30): 166 tests pass |
| 12c · WP-C4 | Tests first, tests that run code (`lib/testsfirst.cjs`), for feature changes of 1.4 projects that deliver a *must* requirement or NFR and whose apps declare a Test command (H4): the ready gate needs a `TEST-` with `Check: runner:test` for each; `check <CHG> --red` runs only the Test commands and records `check.red` when they fail (refused when they already pass); the verified gate needs a red run after the change became ready (not for work recorded after the fact) and refuses test files that read application source as text (`readFileSync`/`readFile` of `src/…` or a source file, `?raw` imports), which the full `check` also lists by name; plan card (first task = acceptance tests, then `--red`) and build card (a test calls the code) | ✅ done (2026-09-30): 170 tests pass |
| 12c · WP-C5 | The app in a real browser and the visual bar (`lib/smoke.cjs`, `templates/smoke/web-smoke.mjs`): `royascaff smoke init [--app]` copies the Playwright smoke script into `<app>/scripts/` and sets the APP record's `Smoke:`; the script serves the built app (`vite preview` by default), opens it at 1440×900, 1024×768 and 430×932, fails on console/page errors and on any button whose click changes fewer than 50 pixels, saves screenshots and prints a JSON summary. `Smoke` runs in the full check (after Test) with `ROYASCAFF_SHOTS` = `evidence/shots/<EVD>/`, listed as `Screenshots:` in the evidence. web-ui feature/polish changes need a passing smoke run before verified. web-ui projects need a `**Visual bar:**` of ≥ 5 lines in discovery topic 8 before `approve project`; a person's look needs `--bar all|1,2,4|none` (the bar and the latest screenshots are shown when it is missing) and is recorded as "pass" or "pass with gaps 3, 5"; the board shows the gaps on the feature. Cards: discover, check-record, web-ui adapter | ✅ done (2026-09-30): 173 tests pass, 1 skipped (the Playwright end-to-end test, run and passed separately with Chromium) |
| 12c · WP-C6+C7 | `web-3d` adapter (Design: visual tokens, camera framing, labels, frame budget; Rules: instancing, no per-frame allocation, dispose, no flat unlit main items, project font, visible re-seed; Check; Words), `init --adapter web-ui,web-3d`; a web-3d project counts as a browser UI (smoke gate, visual bar, look). The runner passes `ROYASCAFF_ADAPTERS` to the smoke script, whose 3D block samples frames for 3 s (fails below 30 fps, `ROYASCAFF_FPS_MIN`), fails on a blank canvas and saves `3d-closeup.png`. Content checks in the full `check` (`lib/content.cjs`): dependencies in `package.json` never imported under the app (import, require, dynamic import, CSS `@import`/`@use`, `@tailwind`, npm scripts) fail as a `deps` check by name unless listed in `- **Unused ok:**` on the APP record; placeholder content (lorem ipsum, TODO, coming soon, no description yet, placeholder text; tests excluded) is counted in the evidence (`Placeholders:`), printed by `check`, and shown with the screenshots when a person scores the look | ✅ done (2026-09-30): 177 tests pass, 1 skipped (3D block run separately with Chromium) |
| 12c · WP-C8 | Plan 02 §12 and file 07 updated (1.4 now carries product-quality mechanisms); PLAYBOOK and GLOSSARY (request, demand, visual bar, foundation slice, red check, smoke check, Deferred to); release notes `docs/RELEASE-1.4.0-beta.3.md`; greenfield fixture gains request, coverage (5 demands, 1 out of scope) and a visual bar; `- **Smoke ignore:**` on the APP record skips accepted controls; extended git walkthrough (request and demands, must NFR in the first slice, Next feature refused until the Now feature is done and looked at, tests red then green, smoke screenshots, look with gaps then `--bar all`, ✅ Done, Next slice opens); package `1.4.0-beta.3` | ✅ done (2026-09-30): step 12c complete |
| 13 | Acceptance run (benchmark rerun with this engine), then `rc` → `1.4.0` — plan file 09 §5 | next |

## Start a project (pilot)

```bash
node bin/royascaff.cjs init <repo> --name "Client Portal" --code PORT --app web=apps/web
node bin/royascaff.cjs install <repo>      # navigator skill for Cursor and Claude Code
```

Then, in the AI tool: **royascaff continue**.

An existing 1.3 or 1.2 project: `node bin/royascaff.cjs migrate <repo>` (dry run), then `--apply` (undo: `--rollback`). Release notes: `docs/RELEASE-1.4.0-beta.2.md` (beta.1: `docs/RELEASE-1.4.0-beta.1.md`).

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

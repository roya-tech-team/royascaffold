# RoyaScaff 1.4.0-beta.1 — release notes

> **For:** the pilot team (engine 1.3 users), on a **new** project first
> **Channel:** npm dist-tag `beta` — `npm install royascaff` still gives 1.2.5 to everyone else

## What it does

- **One entry point.** Say "royascaff continue" in Cursor or Claude Code. The navigator runs `royascaff next`, reads one short stage card, does one step, and ends with Done / Next / Say.
- **One board.** `project/STATUS.md` shows Next up, features by horizon (state, depth, slices and requirements done), active work, fixes, planned slices, recently closed, and work outside the engine.
- **Status is computed, never typed.** Feature → Slice → Change → Task, with evidence. "Done" needs a closed change **and** passing evidence.
- **Five stages with gates.** `advance` refuses an unfinished stage and names what is missing. Only people approve, and editing the design makes an approval stale.
- **Nothing is lost between sessions.** Every step is an event in `changes/<CHG>/log.md`, with a hand-off note. `brief` gives a new session the state in about 200–400 tokens.
- **Context Packs without manifests.** `context TASK-…` builds everything one task needs, within a budget.
- **Git is the witness.** Commits and uncommitted files the engine did not see are flagged, and `record` attaches them. A developer's uncommitted files are backed up before a task starts, and never discarded.

## Install (pilot)

Before npm publishing, from a clone of `royascaffold`:

```bash
node <royascaffold>/engine-1.4/bin/royascaff.cjs init --name "<product>" --code <CODE> --app web=apps/web
node <royascaffold>/engine-1.4/bin/royascaff.cjs install      # Cursor + Claude Code
```

After publishing: `npx royascaff@beta init …` and `npx royascaff@beta install`.

Then say **royascaff continue** in your AI tool. Humans run `royascaff approve CHG-…` and `royascaff status`. The playbook is in `project/PLAYBOOK.md`.

## Known limits of beta.1 (planned for beta.2)

| Limit | Workaround now | Arrives |
|---|---|---|
| No automatic check runner | Run the app commands yourself; record with `royascaff check CHG-… --result pass --note "…"` | Step 9 |
| Templates are minimal (no worked examples) | The cards show the record formats | Step 10 |
| No `royascaff feedback` command yet | Write feedback in a `FEEDBACK.md`, with the output of `royascaff brief` | Step 11 |
| No automatic 1.2 / 1.3 migration | `cards/migrate.md` describes the manual steps | Step 12 — ✅ built for beta.2: `royascaff migrate` |
| Requires Node ≥ 18 and git (git is needed for manual-work tracking) | — | — |

## Report a bug

Include: the command, its full output, `royascaff brief`, and `royascaff validate --json`. Bugs go into `1.4.0-beta.N`. New feature ideas wait for 1.5, unless the pilot shows 1.4 is unusable without them (roadmap file 07 §2).

---
name: royascaff
description: RoyaScaff navigator for this project. Use for "royascaff continue", what's next, where are we, start, plan a feature, fix a bug, record work done by hand, adopt or migrate a project. Arabic or English.
---

# RoyaScaff navigator

CLI: `{{CLI}}` (below: `royascaff`), run from the repository root.

## Every time

1. Run `royascaff next --json`.
2. If `human` is true (questions, approvals, blocks, hand-made commits), do not act for the person: ask them or show the `text` and command, then stop.
3. Otherwise read only `cards/<card>` (and any `adapter_cards`) from this folder; do that one action.
4. Record every step with the CLI and `--by ai:<tool>`. Never hand-edit statuses, `log.md` or `STATUS.md`.
5. End with **Done**, then **Next** (`royascaff next`), then **Say** (its `say`).

## Situations

Plan a feature → `plan-feature.md` · bug or "fix …" → `fix.md` · code changed by hand → `record-manual.md` · new project → `start.md` · open questions → `discover.md` · existing code, no `project/` → `adopt.md` · engine 1.2/1.3 project → `migrate.md` · "where are we?" → `royascaff status` · feedback about RoyaScaff → `royascaff feedback "<their words>" --kind …`, then show them the file.

## Rules

- At about 60% context use, record the step and ask for a new session ("royascaff continue"); `royascaff brief` restores it.
- Reply in the person's language; files and IDs stay in English.
- Only people approve. Never discard a developer's uncommitted files.
- If the CLI refuses, fix exactly what it names, or ask.

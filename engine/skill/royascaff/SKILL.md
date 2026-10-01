---
name: royascaff
description: RoyaScaff navigator. Use for "royascaff continue", what's next, where are we, plan a feature, fix a bug, change or roll back, record hand-made work, adopt or migrate.
---

# RoyaScaff navigator

CLI: `{{CLI}}` (below: `royascaff`), run from the repository root.
MCP: if the `royascaff` tools are listed, use them (no repo scanning); else the CLI.

## Every time

1. Call `next_action` (CLI: `royascaff next --json`).
2. If `human` is true (questions, approvals, blocks), do not act for the person: ask or show `text`, then stop. Approvals: `request_approval`.
3. Otherwise read only `cards/<card>` (and any `adapter_cards`); do that one action. A task: `claim_task`, `get_context`, `task_start`, `task_done`.
4. Record every step (CLI: `--by ai:<tool>`). Never hand-edit statuses, `log.md` or `STATUS.md`.
5. End with **Done**, then **Next**, then **Say**.

## Situations

Plan a feature → `plan-feature.md` · bug, fix, change or roll back → `fix.md` · code changed by hand → `record-manual.md` · new project → `start.md` · open questions → `discover.md` · existing code, no `project/` → `adopt.md` · engine 1.2/1.3 project → `migrate.md` · "where are we?" → `status` · feedback → `royascaff feedback "<their words>" --kind …`, show the file.

## Rules

- At about 60% context, record the step and ask for a new session; `royascaff brief` restores it.
- Reply in the person's language; IDs stay English.
- Only people approve. Never discard uncommitted files.
- If refused, fix what `error.missing` names, or ask. `CLAIM_CONFLICT`: take other work.

# Troubleshooting and FAQ

Common failure modes, what causes them, and how to recover.

## The AI edited main while a pack was in flight

**Symptom:** `project/plan/` or `project/actions/` changed, but no pack has merged.

**Why it happens:** the isolation invariant was skipped — usually because the session started mid-flow without loading the flow file, or a "just update the spec quickly" request slipped past the gates.

**Fix:**

1. Revert the main files to their pre-edit state (git makes this trivial).
2. Move the intended content into the pack's `blueprint/` as after-state entries.
3. Continue the flow normally. Main gets those changes at Step 5.6.

**Prevent it:** start every session by loading the flow. The isolation invariant is stated at the top of change mode: do not edit main `plan/`, `actions/`, `rules.md`, `profile.md`, or `description.md` until the merge step.

## The change-log disagrees with a pack

**Symptom:** `change-log.md` says `drafted` but the pack's `status.md` says `in-progress`, or the `Done/Total` counts differ.

**Why:** a status transition updated one place and not the other. Index sync is mandatory but it is a discipline, not a compiler.

**Fix:** the pack is the source of truth for in-flight work. Read the pack's `status.md` and `blueprint/_index.md`, then correct three places to match:

- The row in `change-log.md`, including the "Artifacts done" column
- The `pack-status` in the pack's `change-request.md` metadata
- The pack's `status.md`

**Prevent it:** every transition touches the same row plus both pack files. Ask the AI to confirm all three after each transition.

## A new chat does not know where things stand

**Symptom:** the AI proposes work that is already done, or re-derives the architecture from scratch.

**Fix:** give it the resume protocol explicitly:

```text
Resume this project. Read project/changes/change-log.md first,
then project/changes/build-program.md if it exists,
then project/status.md. Report the state before doing anything.
```

**Prevent it:** if this happens often, the indexes are probably stale — a fresh chat can only be as good as what it reads. Check that `status.md` was refreshed at the last merge.

## Phase 5, P, or 6 refuses to start

**Symptom:** the flow stops and routes you to Phase 0–4 or Phase R.

**Why:** `project/profile.md` is missing. Phases 5, P, and 6 all require an existing blueprint, and the engine will not invent product facts.

**Fix:** run `/initial-build` for a greenfield project or `/reverse-engineer` for existing code. If you have code and just want to make one change, Phase R is the right entry point — it produces a real blueprint from what already exists.

## A polish task turned out to need a real change

**Symptom:** midway through `/polish` it becomes clear the change needs a new field, an endpoint change, or a behavior change.

**Fix:** the flow has a defined escape hatch. Stop, set `change-type` to the appropriate Phase 5 type, **keep the same folder and `request-id`**, and continue in change mode from Step 5.1.

Do not start a new pack. The existing folder, its change-log row, and its history carry over.

**Related boundary:** polish forbids data-model changes, new or modified endpoints and services, auth or permission changes, and new business rules. If you are touching any of those, it was never polish.

## A pack is stuck as `blocked`

**Symptom:** the flow refuses to implement and sets `pack-status: blocked`.

**Why:** `depends-on` points at a pack that is not yet `verified` or `merged`.

**Fix:** check that dependency's row in `change-log.md`.

- If it is genuinely incomplete, finish it first.
- If it is finished but its row was never updated, fix the index — the block is a symptom of the stale row.
- If the dependency was wrong, remove or correct `depends-on` in the change request metadata and update the change-log row.

## Verification failed

**Symptom:** `verify-code.md` shows `FAIL`.

**What it means:** the code does not match the pack blueprint or the acceptance criteria. The pack stays out of `verified`, and it may not merge.

**Fix:** the failure report tells you which of the scoped checks failed — endpoints matching the pack, pages and views matching, backend layering and frontend isolation, acceptance criteria met, screenshots if any. Fix the code and re-verify. Do not amend the blueprint to match the code unless the blueprint was genuinely wrong, and if it was, say so explicitly rather than quietly editing it.

## The status dashboard does not match the specs

**Symptom:** `status.md` counts disagree with the `_index.md` rollups, or an `_index.md` disagrees with its module file.

**Why:** a merge refreshed one level and not the next.

**Fix:** regenerate upward. Per-artifact status in the module file is the source of truth. Recompute each `_index.md` rollup and `Done/Total` from it, then regenerate `status.md` from the indexes.

Rollup rule, for reference:

| Condition | Module status |
|-----------|---------------|
| All artifacts `done` | `done` |
| Any `partial`, or a mix of `done` and `planned` | `partial` |
| All `planned` | `planned` |
| All remaining work `deferred` | `deferred` |

## Code exists but the spec says `planned`

**Symptom:** verification check 15 flags it.

**What it means:** this is drift, and the check names it directly: *"Code that exists but is spec'd as `planned` is a drift — fix the status."*

**Fix:** if the code is complete and matches the spec, set the artifact to `done` and refresh the rollups. If it is incomplete, set `partial`. If it was built outside the flow and does not match any spec, treat it as undocumented code — document it, then decide whether to keep it.

## Everything is `deferred` and nobody remembers why

**Prevent this rather than fix it.** `deferred` always requires a reason — `deferred: post-MVP`, `deferred: waiting on payment provider`. Without a reason, the correct status is `planned`.

Deferred and planned artifacts may never be deleted silently. They are the record of unfinished work, and they only leave via an explicit change or bug fix.

## Frequently asked

**Can I edit the engine files?**
Yes — it is MIT licensed and the flows are markdown. The one rule to preserve is engine purity: no system-specific data in `royascaff/engine/`. If you customize, note that `npx royascaff init --force` overwrites the engine wholesale, so keep your changes in version control. See [Extending and releasing](../contributing/02-extending-and-releasing.md).

**Does upgrading the engine break my blueprint?**
No. `--force` replaces `royascaff/engine/` and `.cursor/skills/` and never touches `project/`. That separation is the reason engine purity is enforced.

**Do I have to use Cursor?**
The skills in `.cursor/skills/` are Cursor slash commands, but they are thin wrappers that tell the assistant which engine flow to read. Any assistant that can read files in the repository can follow `royascaff/engine/flow.md` directly.

**Should `project/` be committed?**
Yes. It is the blueprint for your system and it must travel with the code — the rebuild test assumes it is there.

**Can I skip Phase 0–2 and just start building?**
Phase 3 has no input without them, and Phases 5, P, and 6 require `profile.md`. If you have code already, `/reverse-engineer` is the fast path to a blueprint. If you do not, the interview in Phase 0 is genuinely quick — most of Phase 1 and 2 is generated from it.

**Can two people work on the same module at once?**
Only in separate packs, and only if the artifacts they own do not overlap. Two packs owning `EP-BILLING-03` is a slicing mistake. Two packs owning `EP-BILLING-03` and `EP-BILLING-04` is fine.

**What happens to a pack I abandon?**
Set `pack-status: cancelled`. Main was never touched, so there is nothing to unwind. The folder stays as a record of what was considered.

**Why does the flow stop after every merge?**
So the next session starts with a small, clean load set. Context size is the main determinant of how accurate the model stays, and a hard stop is the cheapest way to control it.

**Where do I put a rule that applies to every project I build?**
[engine/rules/](../../engine/rules/) — backend and frontend conventions. Product-specific rules go in `project/rules.md`. If you find yourself writing the same "project-specific" rule in every project, it belongs in the engine.

## Related

- [Daily workflow](03-daily-workflow.md)
- [Status and IDs](../reference/03-status-and-ids.md)
- [Verification checks](../reference/08-verification-checks.md)
- [Working as a team](05-working-as-a-team.md)

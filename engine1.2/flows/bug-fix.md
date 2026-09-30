# AI-Control Engine — Bug Fix Flow (Phase 6)

**Goal**: Lightweight process for bug fixes that chooses a full change work pack (architectural impact) or a direct code fix (isolated correction).

**Prerequisite — blueprint must exist.** If `project/profile.md` is missing, stop. Route to Phase 0–4 or Phase R. Create `project/bugs/` (and `bug-log.md`) as needed. Layout: `royascaff/engine/project-layout.md`.

**Style-only tweaks (nothing broken)?** Use Phase P (`royascaff/engine/flows/polish.md`) — not this flow.

**Resume:** Read `project/bugs/bug-log.md` first; if Status is `ESCALATED`, also read `project/changes/change-log.md` and open the linked change pack.

---

## Bug log index

`project/bugs/bug-log.md` is a **live index** (create on first bug):

```md
# Bug Log

| ID | Date | Severity | Area | Summary | Status | File / Change pack |
|----|------|----------|------|---------|--------|--------------------|
| 20260726-093015 | 2026-07-26 | high | auth | login 500 | PENDING | `bug-20260726-093015-login-500.md` |
| 20260726-101122 | 2026-07-26 | medium | billing | wrong total | ESCALATED | `change-20260726-101122-bug-fix-billing-total/` (pack-status: in-progress) |
```

Statuses: `PENDING` · `DONE` · `ESCALATED`. Keep the row updated on every transition. For `ESCALATED`, link the change pack folder and optionally note its `pack-status` from `change-log.md`.

IDs use local datetime `YYYYMMDD-HHMMSS` (same rules as change packs — see `royascaff/engine/project-layout.md` → Pack and bug IDs). **Never** allocate sequential bug numbers.

---

## Entry Point

1. **Plain language** — user describes the bug  
2. **Bug report file** — `project/bugs/bug-<ID>-<slug>.md` from `royascaff/engine/templates/bug-report-template.md`

Start **Step 6.0**.

---

## Step 6.0 — Bug Triage

- **Input**: Bug description
- **Actions**:
  1. Gather: what is broken, where, expected behavior, reproduction steps, severity.
  2. Identify affected app(s), module(s), file(s).
  3. If this is visual polish with correct behavior → redirect to Phase P.
  4. Run the decision tree below.

### Decision Tree: Change Pack vs. Direct Fix

**Q1. Does the fix require plan / action blueprint changes?**  
New entity fields, new endpoints, new pages, new services, new integrations, modified business logic affecting other features → **YES → Path A**. Otherwise → Q2.

**Q2. Does the fix affect multiple modules or apps?**  
Touches > 1 module or app → **YES → Path A**. Otherwise → Q3.

**Q3. Does the fix require a data migration?**  
Schema changes, data transformations, backfill → **YES → Path A**. Otherwise → **Path B**.

---

## Path A — Escalate to Change Work Pack

When any question answers YES:

1. Create/update row in `bug-log.md` with Status **`ESCALATED`** (create `bug-<ID>-…md` stub optional; at minimum the log row).
2. Create work pack `project/changes/change-<ID>-bug-fix-<slug>/` (mint a new datetime `<ID>` — see `project-layout.md`).
3. Set `change-type: bug-fix` in `change-request.md`; `pack-status: drafted`; register in `change-log.md`.
4. Link bug-log **File / Change pack** column to that folder.
5. Proceed with **Phase 5** (`royascaff/engine/flows/change-mode.md`) from Step 5.0 — **isolation applies**: main plan/actions untouched until pack **merge** (Step 5.6).
6. Bug is resolved when the change pack is **`merged`** (verify PASS + merge gate). Then set bug-log Status → **`DONE`** and note Merged date.

- **Done when**: bug-log `DONE` (or still `ESCALATED` while pack in flight); change-log tracks pack-status.

---

## Path B — Direct Fix

When all questions answer NO (no blueprint impact). **Do not** edit main `project/plan/` or `project/actions/`. If the fix reveals plan drift, escalate to Path A.

### Step 6.1 — Create Bug Log Entry

- **Output**: `project/bugs/bug-<ID>-<slug>.md` + bug-log row `PENDING`
- Use `royascaff/engine/templates/bug-report-template.md`.
- **Done when**: File exists; bug-log has the row.

### Step 6.2 — Investigate & Document Root Cause

- Trace code; document Root Cause; propose minimal fix; **no code yet**.
- **Done when**: Root cause + proposed files documented.

### Step 6.3 — ⛔ Pre-Fix Confirmation Gate

Present summary, root cause, proposed fix, files. Ask: **"Can I proceed with applying the changes?"**  
Silence ≠ confirmation.

### Step 6.4 — Implement Fix

- Minimal isolated fix; follow `royascaff/engine/rules/*` + `project/rules.md`.
- Finalize Fix Applied / Related Files in the bug file.
- **Done when**: Code fixed; basic verification passes.

### Step 6.5 — ⛔ Post-Fix Confirmation Gate

Ask: **"Can you confirm this resolves the issue so I can mark it as DONE?"**

### Step 6.6 — Mark as Done

1. Bug file Status → `DONE`; confirm date; check verification boxes.
2. Update bug-log row → `DONE`.
3. Path B does **not** merge blueprint packs. Only if the fix completes a known `partial` on **main** that already matched intended behavior, you may correct that artifact's status on main — do not invent new plan content. Prefer Path A when unsure.

- **Done when**: bug-log `DONE`.

---

## Summary

| Decision | Path | Outputs |
|----------|------|---------|
| Needs blueprint change, multi-module, or migration | **A — Change pack** | `change-<ID>-bug-fix-<slug>/` + change-log; bug-log `ESCALATED`→`DONE` after merge |
| Isolated code fix | **B — Direct fix** | `bug-<ID>-<slug>.md`; bug-log `PENDING`→`DONE`; no main plan edits |

**Key principle**: Bugs that touch the plan become isolated change packs. Pure code corrections stay on Path B.

# AI-Control Engine — Polish Flow (Phase P)

Visual / style / copy / spacing / layout tweaks that do **not** change product behavior, data, or APIs.

Polish is **not** a bug (nothing is broken) and **not** a full feature change. It still uses a **change work pack** and the live `change-log.md` index so work is trackable across chats.

**Prerequisite:** `project/profile.md` exists. Layout: `royascaff/engine/project-layout.md`. Isolation: main plan/actions untouched until merge.

**Resume:** Read `project/changes/change-log.md` first.

---

## When to use / redirect

| Situation | Route |
|-----------|--------|
| Spacing, colors, typography, copy, button look, layout alignment only | **This flow** |
| Behavior wrong vs expected/spec | Phase 6 `bug-fix.md` |
| New/changed capability, fields, endpoints, services, business rules | Phase 5 `change-mode.md` |

### Hard forbidden in polish

- Data-model changes
- New or modified endpoints / services (beyond cosmetic client display of existing data)
- Auth / permissions changes
- New business rules

**If scope grows** during the work: stop, set `change-type` to the appropriate Phase 5 type (keep same folder / `request-id`), and continue in `change-mode.md` from Step 5.1.

---

## Pack layout

```text
project/changes/change-<ID>-polish-<slug>/
  change-request.md      # change-type: polish
  impact.md              # abbreviated — pages/components/files only
  status.md
  blueprint/
    actions/<web>/pages/<module>.md   # or views/ — UI notes / target states
    _index.md
  verify-code.md
  merge-report.md
```

Register in `change-log.md` with Type `polish`. Sync pack-status on every transition (same rules as Phase 5).

---

## P.0 — Triage

- **Input**: User description ("make the button larger", "fix spacing on settings", etc.)
- **Actions**:
  1. Confirm polish criteria (no API/data/behavior change).
  2. If fails → redirect to Phase 5 or 6; do not continue here.
  3. Identify app-key, page(s)/view(s), components/files.
- **Done when**: Confirmed polish; target surfaces listed.

---

## P.1 — Create pack + index row

- **Output**: `change-<ID>-polish-<slug>/change-request.md` + `change-log.md` row
- **Actions**:
  1. Mint datetime `<ID>` (`YYYYMMDD-HHMMSS`; see `project-layout.md`). Create log from `change-log-template.md` if missing.
  2. Fill metadata: `change-type: polish`, `pack-status: drafted`, scope = pages/views only.
  3. Acceptance criteria = observable visual outcomes (e.g. "primary CTA uses brand token", "form fields aligned").
  4. Optional: screenshot / Figma links in Notes.
- **⛔ Gate**: Present request; ask for confirmation.
- **Done when**: User confirmed; index shows `drafted`.

---

## P.2 — Minimal blueprint

- **Output**: `blueprint/actions/<app>/pages/<module>.md` (or `views/`) + `_index.md` + `status.md` + short `impact.md`
- **Actions**:
  1. Read main page/view spec **read-only** for context.
  2. In pack blueprint, document after-state UI notes (layout, tokens, copy, states). Use `## Delta` for what changes visually.
  3. List code files to touch in `impact.md` (components, stylesheets, templates).
  4. Artifacts start `planned` in pack status.
- **Done when**: Pack is enough for another chat to implement without prior context.

---

## P.3 — ⛔ Implement

Ask: **"Can I proceed with the polish implementation?"**

- Set pack-status → `in-progress`.
- Change styles/markup/copy only; follow brand tokens from `project/profile.md` when present.
- Update pack artifact statuses + change-log Artifacts done.
- **Do not** edit main plan/actions yet.
- **Done when**: UI changes applied; pack statuses current.

---

## P.4 — Verify

- **Output**: `verify-code.md`
- Check acceptance criteria / screenshots if any.
- On PASS → pack-status **`verified`**.
- **Done when**: Overall PASS; index says `verified`.

---

## P.5 — Merge

Ask: **"Verify PASS. Merge polish notes into main page/view specs?"**

1. Merge blueprint page/view notes into main `project/actions/.../pages|views/<module>.md` (in-place; usually Notes / UI state lines). If the pack only changed code and main notes are unchanged, still record a one-line Notes update when useful.
2. Refresh main `_index.md` / `project/status.md` only if artifact status on main changed (often unchanged for pure CSS).
3. Write `merge-report.md`; set pack-status → **`merged`**; move change-log row to Completed.
4. Main plan/data-model/services/endpoints must remain untouched.

- **Done when**: Index shows `merged`; pack retained as record.

---

## Phase P — Done

Polish pack merged (or left `verified` if user deferred merge). For another polish, create the next `change-<ID>-polish-<slug>/` pack.

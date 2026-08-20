# AI-Control Engine — Change Mode (Phase 5)

Incrementally add or modify features while keeping the **main** blueprint equal to **implemented** code only.

Phase 5 is independent of Phases 0–4. Use it any time after a blueprint exists (after Initial Build or Phase R).

**Prerequisite — blueprint must exist.** If `project/profile.md` is missing, stop. Route to Phase 0–4 or Phase R. Layout: `royascaff/engine/project-layout.md`.

**Isolation invariant:** Do **not** edit main `project/plan/`, `project/actions/`, `project/rules.md`, `project/profile.md`, or `project/description.md` until **Step 5.6 Merge**. All in-flight specs live in the change work pack under `blueprint/`.

**UI polish only?** Use Phase P (`royascaff/engine/flows/polish.md`) instead — not this flow.

**Initial Build / Phase R packs:** Packs created under `request-id: REQ-INIT` or `REQ-R` (see `project/changes/build-program.md`) use this **same** lifecycle from Step 5.4 (implement → verify → merge). Do not invent a second implementation path.

**Resume:** Read `project/changes/change-log.md` first (and `build-program.md` if present), then open the pack folder.

---

## Work pack layout

```text
project/changes/change-<ID>-<slug>/
  change-request.md
  impact.md
  status.md                 # royascaff/engine/templates/change-status-template.md
  blueprint/
    plan/                   # touched slices only
    actions/…               # per-module delta specs
    _index.md               # royascaff/engine/templates/change-blueprint-index-template.md
  verify-plan.md            # optional
  verify-code.md
  merge-report.md           # after merge
```

`<ID>` = local datetime `YYYYMMDD-HHMMSS` at creation (see `royascaff/engine/project-layout.md` → Pack and bug IDs). **Never** use sequential counters. Register every pack in `change-log.md` immediately (template: `royascaff/engine/templates/change-log-template.md`).

---

## Index sync (mandatory)

On every pack-status transition, update the **same** row in `project/changes/change-log.md` and the Metadata `pack-status` in `change-request.md` + pack `status.md`.

| pack-status | When |
|-------------|------|
| `drafted` | Folder + request (+ blueprint) created; code not started |
| `in-progress` | Implementation started |
| `verified` | `verify-code.md` Overall PASS |
| `merged` | Main blueprint updated |
| `cancelled` | Abandoned; main never touched |
| `blocked` | `depends-on` not yet `verified`/`merged` |

Mirror **Artifacts done** (`Done/Total` from `blueprint/_index.md`) into the In flight table.

---

## Flow Selection

Before starting, evaluate against Fast-Track criteria:

### Fast-Track Criteria (ALL must be true)

1. Change touches ≤ 1 module
2. No new data model entities or fields
3. No new services or endpoints (modifying existing is OK)
4. Frontend-only OR backend-only (not both, unless endpoint already exists)
5. User provides a clear, complete change description
6. Not `polish` (use Phase P) and not multi-part with unmet deps

**If ALL criteria met** → **Fast-Track Flow** below.
**If ANY criterion fails** OR user says "use full flow" → **Standard Flow** below.

---

## Fast-Track Flow (same isolation)

### FT-5.0 — Understand

- Read description / `change-request.md`. Resolve `target-app` against `project/profile.md`.
- Create pack folder; set `pack-status: drafted`; register in `change-log.md`.
- If `depends-on` is set and dep is not `verified`/`merged` → set `blocked` and stop.

### FT-5.1 — Quick Recon + Impact

- Output abbreviated `impact.md`. Load only relevant main `_index.md` + module files (**read-only**).
- List pack blueprint files to create (not main files).

### FT-5.2 — Draft pack + Implement

#### ⛔ Confirmation Gate

Present pack blueprint + code file list. Ask: **"Can I proceed?"** Wait for explicit confirmation.

- Write specs **only** under `blueprint/` + pack `status.md` + `blueprint/_index.md`.
- Set index → `in-progress`; implement code from pack blueprint.
- Update pack artifact statuses (`done` / `partial` / `deferred`).
- **Do not** edit main plan/actions.

### FT-5.3 — Verify + Merge

1. Write `verify-code.md` against **pack** blueprint + acceptance criteria. On PASS → `verified`.
2. ⛔ Ask: **"Verify PASS. Merge into main blueprint?"** On yes → Step 5.6 merge rules; set `merged`.
3. If user defers merge, leave pack at `verified` (main unchanged).

---

## Standard Flow

### Entry Point

Create `project/changes/change-<ID>-<slug>/` from `royascaff/engine/templates/change-request-template.md`, or describe the change in plain language and run Step 5.0.

---

### Step 5.0 — Understand the Change + Discovery Interview

- **Input**: `change-request.md` or plain-language description
- **Output**: Confirmed `change-request.md` + change-log row (`drafted`)

#### 5.0.1 — Read & Resolve Scope

1. Read request; note `change-type`, `target-app`, `request-id`, `depends-on`, `affected-repos`.
2. Resolve apps/repos against `project/profile.md`.
3. If `depends-on` is set: check that pack's status in `change-log.md`. If not `verified`/`merged` → set this pack `blocked` and stop (or wait).
4. Read relevant **main** plan/actions **read-only** for context.
5. If description is thin, run discovery interview (sections below).

#### 5.0.2 — Discovery Interview

Ask section by section; wait for answers.

**Section 1 — Business Context** _(always)_  
Motivation, who affected, outcome, out-of-scope, constraints, priority; multi-pack `request-id` / `part` / `depends-on` if splitting.

**Section 2 — Type-Specific Technical Details** _(always)_  
Type-specific block from the template guide.

**Section 3 — Data & Integrations** _(skip for modify-page I/O-only, modify-endpoint I/O-only, refactor)_

**Section 4 — Security & Permissions** _(skip if auth unchanged AND no new endpoints)_

**Section 5 — Edge Cases & Errors** _(skip if pure UI)_

**Section 6 — Frontend Style** _(when frontend touched)_  
Pages, design system, screenshot/Figma, layout, states, RTL.

#### 5.0.3 — Draft the Change Request

1. Create folder; draft `change-request.md` (all metadata including `pack-status: drafted`).
2. Register row in `change-log.md` (create log from template if missing).
3. Acceptance criteria = numbered testable outcomes.

#### 5.0.4 — ⛔ Confirmation Gate

Present drafted request. Ask: **"Does this change request look correct? Please confirm to proceed."**  
Silence ≠ confirmation.

- **Done when**: `change-request.md` saved, user confirmed, change-log row exists.

---

### Step 5.1 — Code Recon + Impact Analysis

Runs **before** any pack blueprint is finalized. Skip recon for `change-type: new-app`.

- **Input**: Scope + repos + main plan/actions (**read-only**)
- **Template**: `royascaff/engine/templates/impact-template.md`
- **Output**: pack `impact.md`
- **Scope rule**: Load only affected module files via main `_index.md`.

#### 5.1.1 — Code Reconnaissance

1. Search affected modules in **actual code** (schema → repo → service → controller → FE service → page).
2. Feature state: `none` | `partial` | `complete`.
3. Record plan-vs-code drift on **main** (for awareness; fix via this pack's merge, not by editing main early).
4. Ripple map + reuse opportunities + risks (auth, async, migration).

#### 5.1.2 — Impact Classification

Classify: **Create** / **Complete in place** / **Modify** (+ ripple).

Map `change-type` → which **pack blueprint** slices are needed:

| Change type | pack `plan/` | pack `services/` | pack `endpoints/` | pack `pages/`/`views/` | pack rules/desc slices |
|-------------|:---:|:---:|:---:|:---:|:---:|
| `new-app` | maybe | — | — | ✓ | maybe |
| `new-module` | ✓ | ✓ | ✓ | maybe | maybe |
| `new-feature` | maybe | maybe | maybe | maybe | maybe |
| `modify-*` | as touched | as touched | as touched | as touched | as touched |
| `bug-fix` | as needed | as needed | as needed | as needed | as needed |
| `general` | assess | assess | assess | assess | assess |

- **Done when**: Every pack file and code location identified; deps recorded.

---

### Step 5.1b — New App Definition (only when `change-type` is `new-app`)

Skip if not `new-app`.

- Resolve modules/features against main `modules.md` (**read-only**).
- Draft new app client specs under **`blueprint/actions/<app-key>/pages/` or `views/`** (not main).
- Note profile additions in pack (e.g. `blueprint/plan/profile-delta.md` or Notes) — apply to main `profile.md` only at merge.
- Flag new endpoints needed in pack `endpoints/` blueprint.

---

### Step 5.2 — ⛔ Pack Confirmation Gate

Present:

1. Impact summary — which **pack blueprint** files will be created
2. Code impact — which code files will be created/modified
3. Ripple effects
4. Dependency status

Ask: **"Can I proceed with drafting the change pack blueprint?"**  
Wait for explicit confirmation.

---

### Step 5.3 — Draft Pack Blueprint (not main)

Write specs **only** under `change-<ID>-<slug>/blueprint/`.

> **Never edit main plan/action files here.** Never append `change-<ID>` sections to main files.

- **Templates**: existing services/endpoints/pages/views/modules/data-model templates, scoped to delta content; `change-blueprint-index-template.md`; `change-status-template.md`.

#### Delta writing rules

- **Data model**: after-state of affected entity + `## Delta` listing adds/changes.
- **Services / endpoints / pages**: only artifacts owned by this change, as complete after-state entries.
- New artifacts start with status **`planned`** in the pack.
- Fill `blueprint/_index.md` and pack `status.md`. Keep change-log at `drafted` until code starts.
- Honor impact verdict: create / complete / modify / ripple — all represented in the pack.

#### Optional: Pre-Build Pack Verification

If complex (≥ 3 blueprint layers or new entities), check coverage inside the pack; write `verify-plan.md` if useful.

- **Done when**: Pack blueprint internally consistent; index still `drafted` (or `blocked` if deps unmet).

---

### Step 5.4 — ⛔ Code Confirmation Gate + Implement Code

#### Dependency gate

If `depends-on` is not `verified`/`merged` → set `blocked`, update change-log, stop.

#### ⛔ Confirmation Gate

Present code file list + pack blueprint summary. Ask: **"Can I proceed with implementing the code?"**

#### Implement

- Set pack-status → `in-progress` (change-log + request + pack status).
- Implement from **pack blueprint** + `royascaff/engine/rules/*` + main `project/rules.md` (read).
- Backend: controller → service → repository; integrations isolated.
- Frontend: pages call app services only; no hardcoded external URLs.
- Update **pack** artifact statuses and `blueprint/_index.md` Done/Total; mirror into change-log Artifacts done.
- **Do not** write main plan/actions.

#### UI Screenshot Review (optional)

If screenshots submitted, check against pack page/view specs.

- **Done when**: Code compiles; pack statuses accurate; change-log `in-progress` with current Done/Total.

---

### Step 5.5 — Post-Build Code Verification

- **Input**: Code + **pack** blueprint + acceptance criteria
- **Template**: `royascaff/engine/templates/verification-template.md`
- **Output**: pack `verify-code.md`
- **Checks** (scoped to pack):
  1. Endpoints in code match pack
  2. Pages/views in code match pack
  3. BE layering / FE isolation / auth as declared in pack
  4. Acceptance criteria met (or explicitly deferred in pack)
  5. UI screenshots if any
- On PASS → set pack-status **`verified`** (change-log + request + pack status).
- **Do not merge yet.**
- **Done when**: `verify-code.md` shows **Overall: PASS** and index says `verified`.

---

### Step 5.6 — Merge into Main Blueprint

#### ⛔ Merge Gate

Ask: **"Verify PASS. Merge this pack into the main blueprint?"**  
Wait for explicit confirmation.

#### Merge actions

1. Apply pack deltas **in-place** into main:
   - `project/plan/*`, `project/actions/**`, `project/rules.md`, `project/description.md`, `project/profile.md` as listed in pack
2. Refresh main `_index.md` rollups and `project/status.md` (merged reality only).
3. Write `merge-report.md` (`royascaff/engine/templates/merge-report-template.md`).
4. Set pack-status → **`merged`**; move change-log row to Completed with Merged date.
5. Never leave appended change sections at the bottom of main files.

- **Done when**: Main matches implemented code for this pack; change-log shows `merged`; pack retained as record.

If user declines merge: leave at `verified`. Main stays unchanged.

---

## Multi-part features

- Share `request-id` (e.g. `REQ-7`) across packs; optional `part: 2/3`.
- Each part = own folder + own change-log row + own blueprint.
- Respect `depends-on`. Filter change-log by `request-id` to see the whole feature.

---

## Phase 5 — Done

When Step 5.6 (or FT-5.3 merge) completes:

- Main blueprint matches code for merged work.
- Pack holds request, impact, blueprint, verify, merge-report.
- `change-log.md` shows `merged`.

To continue: create the next pack (or next `request-id` part) and start Phase 5 again.

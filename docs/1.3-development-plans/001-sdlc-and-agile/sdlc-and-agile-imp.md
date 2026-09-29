# 001 · SDLC Delivery Modes and Task-Management Integration — Implementation

- **Design source:** [`sdlc-and-agile-plan.md`](sdlc-and-agile-plan.md)
- **Target:** [`engine-1.3/`](../../../engine-1.3/) — decision 4
- **Approved decisions:** `CHG-` is the primary synced unit · `delivery/` is non-canonical · engine → tracker writes first · target `engine-1.3/`
- **Scope here:** P0–P3. The Jira/MCP provider binding is [002](../002-jira-mcp/jira-mcp-plan.md) (P4).

Every phase is additive and independently revertible.

---

## Phase 0.0 — Test harness prerequisite

`engine-1.3-demo` **cannot validate in this repository today**, independently of this work:

```text
$ node engine-1.3/bin/sdlc.js validate engine-1.3-demo
Validation failed (2 issues):
- Source root does not exist: ../example-v1.2/apps/api
- Source root does not exist: ../example-v1.2/apps/web
```

Its profile points at an `example-v1.2/` tree that is not present, and `index` refuses to run when validation fails. So the demo cannot be the acceptance harness. Two things instead:

1. **Baseline diff on the demo.** Record the two-issue output above as the baseline. Acceptance is *no new issue*, not a clean PASS.
2. **A new `engine-1.3-delivery-fixture/`** — the smallest project that actually validates: `system-map.md`, `profile.md` with `source_roots: []`, one requirement record, one change, one iteration. This is what P1–P3 assert against, and it runs offline with no missing dependency.

Fixture viability and the central design claim are both already verified against the real CLI:

```text
before delivery/ :  Validation PASS: 1 artifacts …  project 1057f214566c
with    delivery/ :  Validation PASS: 2 artifacts …  project 1057f214566c
after editing the iteration window :             project 1057f214566c
```

The hash is unchanged across all three, which is the empirical proof that decision 2 needs no CLI change: `isCanonical()` already excludes `delivery/`, so scheduling churn cannot invalidate a semantic approval.

---

## Phase 0 — Decide and document

No code. Eight files. Effort: S.

### 0.1 New file `engine-1.3/delivery-modes.md`

The canonical answer to "waterfall or agile". Required sections:

1. **Two axes** — knowledge order is fixed L0→L4; only delivery batching varies.
2. **Mode presets** over four knobs:

| Mode | `knowledge_gate_scope` | `delivery_gate_scope` | `iterations_enabled` | `phases_enabled` | `reconcile_cadence` |
|---|---|---|---|---|---|
| `waterfall` | product | product | false | true | batched |
| `agile` | slice | slice | true | false | per-slice |
| `hybrid` | product | slice | true | true | per-slice |

3. **Comparison table** — copy plan §3.2.
4. **Mode-independent invariants** — copy plan §3.3 verbatim; this is the section reviewers will cite.
5. **The execution limit** — plan §3.4, stated as a callout: *waterfall changes approval batching and reconciliation timing, never execution granularity. Context Packs still fail rather than truncate.*
6. **`batched` reconciliation warning** — batching reconciliation grows the window in which code exists that Main does not describe. Under `waterfall`, `reconcile_cadence: batched` requires a declared maximum batch size and an accepted-risk record.
7. **Choosing a mode** — three-question decision aid (is scope contractually fixed? is there a compliance sign-off body? is the team able to release per slice?).

### 0.2 `engine-1.3/templates/profile-template.md`

Add to the front-matter block:

```yaml
delivery_mode: agile              # waterfall | agile | hybrid
knowledge_gate_scope: slice       # product | slice
delivery_gate_scope: slice        # product | slice
reconcile_cadence: per-slice      # per-slice | batched
iterations_enabled: true
phases_enabled: false
iteration_length: 14d             # or: none
```

Prose note: omitting all of these means `agile` with per-slice gates, which is the current de facto behaviour — so **existing profiles keep working unchanged**.

### 0.3 `engine-1.3/conventions.md`

Add ID-prefix rows:

| Kind | Prefix |
|---|---|
| Team / member | `TEAM-`, `MBR-` |
| Iteration (sprint, phase, milestone, release window) | `ITER-` |
| External tracker link | `LNK-` |

Add relation labels to the allowed list: `Assigned to`, `Scheduled in`, `Staffed by`, `Tracked by`.

Add an **External identifiers** subsection:

> External keys are written only in the link register table that precedes the first record in `delivery/links.md`. They are never written inside a record block. Reason: the artifact-reference matcher recognises any token of three or more uppercase segments, so a key such as `ROYA-CHG-001` inside a record body would be parsed as a missing engine ID. Two-segment keys such as `TF-123` are inherently safe; the register rule makes all keys safe regardless of the provider's naming.

### 0.4 `engine-1.3/project-layout.md`

Add to the tree, after `contexts/`:

```text
  delivery/
    team.md
    iterations.md
    tracker.md
    links.md
```

Add the zone row:

| Zone | Ownership |
|---|---|
| `delivery/` | Delivery policy: staffing, scheduling, tracker binding. Validated and reviewable, **not canonical Main, excluded from the project hash and the rebuild test.** |

Add one line to the rebuild test: Main must explain the system without `delivery/`; staffing and scheduling are not needed to recreate it.

### 0.5 `engine-1.3/risk-and-gates.md`

Add a **Gate scope** section: the gate *matrix* (which reviews are required) is driven by risk, unchanged. The gate *scope* (how much crosses one gate) is driven by delivery mode. Under `product` scope a single approval covers the whole declared scope and goes stale when any covered artifact changes materially — which is exactly why phase gates need a re-review trigger, and worth stating.

### 0.6 `engine-1.3/rules/core.md`

Append rules 11–16, from plan §6.8:

```text
11. External tracker state is never evidence.
12. A tracker comment, field, or transition is never an engine gate approval.
13. Assignment grants no scope; an assignee works only inside the approved task boundary.
14. Synchronization never creates, changes, or deletes canonical meaning; a needed meaning change returns to a Change Blueprint.
15. Schedules never override gates; a due date cannot advance an unverified slice.
16. Member records hold aliases and contact routes only, never personal or sensitive data.
```

### 0.7 `engine-1.3/flow.md`

- Entry checks: add step — read `delivery_mode` and gate scopes from `profile.md`; absent means `agile` defaults.
- Invariants: add — *a tracker transition is a routing request, never a state change. Engine status is authoritative; tracker status is a projection.*

### 0.8 `engine-1.3/README.md`

- Link `delivery-modes.md` from "Start here" as step 3.
- New short section **Delivery modes** with the two-axis summary and the §3.4 limit.

### P0 done when

```bash
node engine-1.3/bin/sdlc.js validate engine-1.3-demo   # still exactly the 2 baseline issues, no new ones
```

Plus: a reader can state the difference between the modes, and can explain why waterfall does not mean one big build task. P0 touches only engine documentation, so it cannot change any project's hash.

---

## Phase 1 — The `delivery/` zone

Templates, schemas, and a populated demo. No CLI change. Effort: M.

### 1.1 Record shapes

All four required metadata fields apply to every record in every zone, because the validator does not special-case directories. For delivery records, `Implementation status: not-applicable` is the correct value.

`delivery/team.md`:

```md
---
document_id: DOC-DELIVERY-TEAM
title: Delivery team
layer: delivery
schema_version: 1
document_status: approved
owners: [taskflow-team]
---

### TEAM-TASKFLOW-CORE · TaskFlow core team

- **Kind:** team
- **Knowledge status:** approved
- **Implementation status:** not-applicable
- **Owner:** taskflow-team
- **Staffed by:** `MBR-TASKFLOW-001`, `MBR-TASKFLOW-002`
- **Tracker portfolio:** declared in `delivery/tracker.md`

### MBR-TASKFLOW-001 · hana (alias)

- **Kind:** member
- **Knowledge status:** approved
- **Implementation status:** not-applicable
- **Owner:** taskflow-team
- **Roles:** implementer, planner
- **Contact:** #taskflow-dev
```

`delivery/iterations.md` — one record kind serves sprints and phases:

```md
### ITER-TASKFLOW-S01 · Sprint 1 — create and assign a task

- **Kind:** iteration
- **Knowledge status:** approved
- **Implementation status:** not-applicable
- **Owner:** taskflow-team
- **Iteration kind:** sprint
- **Window:** 2026-09-01 → 2026-09-12
- **Capacity:** 6 slices
- **Goal:** an authorized member can create and assign a task
- **Scheduled changes:** `CHG-TASKS-001`, `CHG-TASKS-002`
- **Staffed by:** `TEAM-TASKFLOW-CORE`
```

The waterfall flavour is the same record with `Iteration kind: phase`, a phase name, and a phase-exit gate reference. That single-concept choice is what lets one mechanism serve both modes.

`delivery/links.md` — the register precedes all records, so unsafe external strings never sit inside a record block:

```md
---
document_id: DOC-DELIVERY-LINKS
title: External link register
layer: delivery
schema_version: 1
document_status: approved
owners: [taskflow-team]
---

# External link register

| Link | Engine ID | Provider | External key | URL | Last synced hash | Authority |
|------|-----------|----------|--------------|-----|------------------|-----------|
| LNK-TASKS-001 | CHG-TASKS-001 | jira | TF-14 | https://… | 4f2a… | engine |

## Records

### LNK-TASKS-001 · CHG-TASKS-001 tracker binding

- **Kind:** external-link
- **Knowledge status:** approved
- **Implementation status:** not-applicable
- **Owner:** taskflow-team
- **Maps to:** `CHG-TASKS-001`
```

Split of duties: the **register table holds the volatile external data** (key, URL, synced hash); the **record holds the addressable identity** so `CHG-`/`TASK-` records can say `Tracked by: LNK-TASKS-001` and have it resolve. No field is duplicated between them.

`delivery/tracker.md` — front matter exactly as plan §6.3, body carrying three tables: field mapping, status mapping (plan §6.5), and capability degradation (what happens when `sprints`, `subtasks`, or `custom-fields` are unavailable).

### 1.2 New templates in `engine-1.3/templates/`

`team-template.md`, `iteration-template.md`, `tracker-template.md`, `delivery-plan-template.md`, `sync-report-template.md` — each following the existing terse template style: front matter block plus a one-paragraph statement of required sections.

### 1.3 New schemas in `engine-1.3/schemas/`

- `iteration.schema.json` — required `id` (`^ITER-(?:[A-Z0-9]+-){1,}[A-Z0-9]+$`), `iteration_kind` (enum `sprint|phase|milestone|release-window`), `window`, `capacity`, `goal`, `scheduled_changes`; `additionalProperties: true`.
- `tracker-adapter.schema.json` — required `provider`, `mode` (enum `none|manual|mcp-read-only|mcp-read-write`), `capabilities`, `field_mapping`, `status_mapping`, `write_policy`.
- `external-link.schema.json` — required `link_id`, `engine_id`, `provider`, `external_key`, `authority` (enum `engine|tracker`).

### 1.4 Additive fields on existing schemas

Both already declare `additionalProperties: true`, so these are documentation of intent rather than constraint changes — add them as optional `properties` so tooling can see them:

- `change.schema.json`: `iteration`, `phase`, `team`, `assignee`, `due`, `priority`, `external_key`.
- `execution-task.schema.json`: `assignee`, `estimate`, `iteration`, `external_key`, `depends_on`.

No `required` array is touched. Existing changes and tasks stay valid.

### 1.5 Populate the fixture and the demo

Build `engine-1.3-delivery-fixture/` per §0.0, then add `delivery/` to `engine-1.3-demo` for PollPulse with `tracker_provider: none`, `tracker_mode: none`: one team, two members, one sprint, one phase, and a `LNK-` binding to an existing archived change. The demo stays illustrative; the fixture is what CI asserts on.

### P1 done when

```bash
F=engine-1.3-delivery-fixture
node engine-1.3/bin/sdlc.js index $F      # record the project hash
# edit delivery/iterations.md: change a window, reassign a slice
node engine-1.3/bin/sdlc.js validate $F   # PASS with delivery records present
node engine-1.3/bin/sdlc.js index $F      # project hash MUST be byte-identical
```

That hash-stability test is the acceptance proof for the non-canonical-zone decision, and it already passes on a prototype fixture (§0.0). `generated/artifacts.md` will gain rows and `generated/status.md` will gain `not-applicable` counts — expected, since generated views are not canonical. The demo must still show only its two baseline issues.

---

## Phase 2 — Skills and cadence workflow

Effort: M. No CLI change.

### 2.1 `engine-1.3/skills/plan-delivery/SKILL.md`

```text
name: plan-delivery
description: Schedule dependency-ready slices into an iteration or phase under declared capacity and staffing rules.
```

- **Inputs:** capability roadmap, changes at `approved`/`ready`, `delivery_mode` and gate scopes, `delivery/team.md` capacity, tracker capabilities.
- **Writes:** `delivery/iterations.md` only. Never `knowledge/`, never a change's status, never code.
- **Procedure:** select dependency-ready slices → detect overlapping exclusive `claimed_ids`/`claimed_paths` → check role coverage against each slice's risk (high/critical needs a verifier distinct from the implementer) → fit declared capacity → write the `ITER-` record → request the delivery views.
- **Block when:** delivery mode unresolvable, capacity undeclared, a scheduled slice's dependency is unreconciled while `reconcile_cadence: per-slice`, or a high-risk slice cannot be staffed with independent verification.
- **Mode behaviour:** under `waterfall`, the iteration is a phase and the exit gate is `product`-scoped; under `agile`/`hybrid` it is a sprint with per-slice gates. Same skill, different knob values.

### 2.2 `engine-1.3/skills/sync-tracker/SKILL.md`

```text
name: sync-tracker
description: Project engine delivery state to an external tracker and mirror tracker-owned fields back, without transferring authority.
```

- **Inputs:** `delivery/tracker.md`, `delivery/links.md`, current project hash, change/task states, evidence references.
- **Procedure:** load the authority table → compute intended operations → write `generated/delivery/sync-packet.json` → apply according to mode → write `generated/delivery/sync-report.md` → classify conflicts → update the link register and `last_synced_project_hash`.
- **Never:** change an engine status from tracker state, write into `knowledge/`, resolve a conflict silently, or embed canonical meaning into a tracker field beyond a synopsis plus a link back.
- **Write policy:** with `dry-run-first`, the first run of any new operation shape only produces the packet and the report.
- **MCP boundary:** this skill is the only place MCP is called. The CLI never performs network I/O, which keeps `engine.json`'s empty dependency list and offline reproducibility true.

### 2.3 `engine-1.3/workflows/09-delivery-cadence.md`

One workflow parameterized by mode, not one per mode:

```text
1. Read delivery mode, gate scopes, and reconcile cadence from profile.md.
2. Confirm the knowledge gate for the required scope (product for waterfall, slice for agile).
3. plan-delivery: schedule ready slices into the current ITER-.
4. sync-tracker: publish the iteration and its slices outbound.
5. Deliver each slice with the normal Change workflow — unchanged.
6. Reconcile per cadence: after each slice, or as a declared batch with its accepted-risk record.
7. sync-tracker: publish verified/reconciled outcomes and evidence links.
8. Close the iteration: record delivered, carried-over, and dropped slices with reasons.
```

Explicit non-goal in the file: this workflow never replaces workflows 02–08. It schedules and reports on them.

### 2.4 Router and README updates

- `flow.md`: add the routing row — *iteration or phase planning and tracker synchronization → [Delivery Cadence](workflows/09-delivery-cadence.md)*.
- `README.md`: add both skills to the skill table and the workflow to the intent-routing table.

### P2 done when

The same slice is delivered twice in the fixture — once with `delivery_mode: agile`, once with `waterfall` — **with no engine file edited between the two runs**, only profile knobs. That is the proof that mode is a policy rather than a fork. Record both runs' gate sets and reconciliation points side by side; the difference must be batching only, never an invariant.

---

## Phase 3 — Sync packet and delivery validations

The only phase that touches `bin/sdlc.js`. Effort: M–L.

### 3.1 `engine-1.3/schemas/sync-packet.schema.json`

```json
{
  "schema_version": 1,
  "provider": "jira",
  "portfolio": "TF",
  "project_hash": "4f2a…",
  "operations": [
    {
      "op": "upsert-work-item",
      "engine_id": "CHG-TASKS-001",
      "external_key": "TF-14",
      "item_type": "story",
      "authority": "engine",
      "fields": {
        "summary": "Create a task",
        "synopsis": "≤ 400 chars, generated from the change outcome",
        "engine_ref": "changes/active/CHG-TASKS-001/change.md",
        "labels": ["roya:CHG-TASKS-001"]
      },
      "precondition": { "external_status_in": ["Ready for Dev", "In Progress"] }
    }
  ]
}
```

Operation vocabulary: `upsert-work-item`, `transition`, `assign`, `schedule`, `link`, `attach-evidence`, `comment`.

**Byte stability requirements**, because the packet is the artifact every mode shares:

- No timestamps and no random values in the packet; all clock data lives in `sync-report.md`.
- Operations sorted by `engine_id`, then by operation name.
- Object keys emitted in a fixed order.
- Full meaning is never embedded: `synopsis` plus `engine_ref` only, per rule 14.

### 3.2 `bin/sdlc.js` additions

New command `delivery <project-root>`:

1. Skip entirely when `delivery/` does not exist — existing projects and any consumer without a delivery zone are unaffected.
2. Parse the delivery zone, the link register table, and `tracker.md`.
3. Run the delivery validations (3.3).
4. Write `generated/delivery/sync-packet.json`, `assignments.md`, `iteration-status.md`.

Also extend `index`: add a `zone` field to each entry in `artifacts.json` (`main`, `change`, `delivery`, `context`) so generated views can separate delivery bookkeeping from knowledge. This is the one change to existing output, and it is additive.

`isCanonical()` and `hashCanonical()` stay untouched — `delivery/` already falls outside both, which is why decision 2 needs no code at all.

### 3.3 Delivery validations

| Check | Severity | Rule source |
|---|---|---|
| High/critical-risk change has a verifier distinct from its implementer | error | `risk-and-gates.md` |
| A change at `ready`/`in-progress` has an assignee and an iteration | error under `agile`/`hybrid` | delivery policy |
| Overlapping exclusive `claimed_paths`/`claimed_ids` between active changes | error | governance §Parallel work |
| Every `LNK-` resolves on both sides — no orphan, no dangling | error | plan §6.7 |
| No external key inside a record block matches the engine ID pattern | error | plan §5 |
| Iteration committed scope ≤ declared capacity | warning | delivery policy |
| `last_synced_project_hash` equals the current hash before an outbound sync | error at sync time | plan §6.7 |
| A change is `reconciled` while its tracker item is open, or the reverse | warning | plan §6.5 |
| `reconcile_cadence: batched` without an accepted-risk record | warning | §0.1 |

Roles referenced by these checks (`implementer`, `verifier`, …) reuse the vocabulary already defined in the governance document rather than inventing a second role list.

### 3.4 Conflict classifier

Four classes, each with a named decision owner and no timestamp-wins rule:

| Class | Meaning | Decision owner |
|---|---|---|
| `authority-violation` | The non-owning side wrote a field | that field's declared owner |
| `divergence` | Both sides changed within their own lanes and now disagree | change owner |
| `orphan` | Tracker item carrying no engine ID | delivery owner |
| `dangling` | `LNK-` whose tracker item no longer exists | delivery owner |

### P3 done when

- `sdlc.js delivery engine-1.3-delivery-fixture` produces a byte-identical packet across repeated runs (`diff` of two runs is empty).
- `tracker_mode: none` and `manual` are fully functional with no credentials and no network.
- Every validation in 3.3 has a passing case and a deliberately failing fixture case.
- A project with no `delivery/` directory behaves exactly as before: the `delivery` command exits cleanly and `validate` output is unchanged.

---

## Sequencing, effort, and rollback

| Phase | Effort | Depends on | Revert by |
|---|---|---|---|
| P0.0 harness | S | — | delete the fixture |
| P0 docs | S | — | revert eight doc edits |
| P1 zone | M | P0 | delete `delivery/`, new templates and schemas |
| P2 skills | M | P1 | delete two skill folders and one workflow; revert router rows |
| P3 CLI | M–L | P1 (P2 recommended) | remove the `delivery` command and the `zone` field |
| P4 Jira MCP | see 002 | P3 | disable the provider; fall back to `manual` |
| P5 second provider | S–M | P4 | — |

P0 and P1 are safe to ship on their own: they give the team a documented mode choice and a validated home for staffing and scheduling, with zero integration risk. P3 can ship before P2 if the packet is more urgent than the skills, since the packet is a pure function of the zone.

## Open items carried into 002

- Jira field IDs for `synopsis`, engine-ID label or custom field, and evidence remote links.
- Which MCP server and tool surface to bind, and its rate-limit behaviour.
- Whether Jira sprints are read via board APIs or mirrored from `ITER-` records.
- Permission scope required for the outbound-only phase, which should be narrower than read-write.

# 001 · SDLC Delivery Modes and Task-Management Integration — Plan

- **Status:** proposal, awaiting decisions in [§11](#11-decisions-i-need-from-you)
- **Targets:** [`engine-1.3/`](../../../engine-1.3/)
- **Depends on:** [000-explaination](../000-explaination/plan.md) (engine mental model)
- **Feeds:** [002-jira-mcp](../002-jira-mcp/jira-mcp-plan.md) (concrete Jira/MCP binding)
- **Companion:** `sdlc-and-agile-imp.md` (implementation steps — written after these decisions are approved)

---

## 1. What this plan answers

Three questions, in this order:

1. **What actually differs** when the same engine is driven in a waterfall cadence versus an agile cadence — and what must stay identical.
2. **How the engine represents delivery facts** it currently has no home for: team, member, assignment, project, timeline, sprint, phase, estimate.
3. **How the engine talks to an external task-management tool** through a provider-neutral contract that works with MCP, without MCP, with Jira, or with something else.

It deliberately does **not** define Jira field IDs, MCP tool names, or JQL. Those belong to 002 so that plan 001 stays provider-neutral and reusable.

---

## 2. Where engine 1.3 stands today

Established by reading the engine, not assumed:

**Already present and directly reusable**

| Capability | Where |
|---|---|
| Layered reading model L0→L4, vertical delivery | [`README.md`](../../../engine-1.3/README.md), [`project-layout.md`](../../../engine-1.3/project-layout.md) |
| Zone separation: Main / Change / Context / generated | `project-layout.md` §Zones |
| Change lifecycle `draft → … → reconciled → closed` | [`flow.md`](../../../engine-1.3/flow.md) |
| Two-dimensional status (knowledge vs implementation) | [`conventions.md`](../../../engine-1.3/conventions.md) |
| Intent × risk routing with adaptive gates | [`risk-and-gates.md`](../../../engine-1.3/risk-and-gates.md) |
| Executable task contract (goal, allowed paths, checks, done_when, handoff) | `schemas/execution-task.schema.json` |
| Deterministic project hash over canonical files only | `bin/sdlc.js` → `hashCanonical`, `isCanonical` |
| Role vocabulary and approval-staleness rules | [`docs/1.3-new-plan/10-team-collaboration-and-governance.md`](../../1.3-new-plan/10-team-collaboration-and-governance.md) |

**Absent today**

- No notion of a **person**. `Owner` is a free-text team string; there is no member record, no assignment, no capacity.
- No notion of **time**. No dates, no estimates, no start/end, no velocity, no due date anywhere in the engine.
- No notion of a **batch of work above a change**. There is no sprint, no phase, no milestone, no release train. `releases/` records what was deployed, not what was planned.
- No **external system identity**. Nothing anywhere holds a Jira key, an issue URL, or a sync timestamp.
- No **delivery cadence policy**. `profile.md` declares technology and budgets, never how the team works.
- The CLI is intentionally **dependency-free and offline** (`engine.json` → `"dependencies": []`). It cannot make network calls, so it cannot be the thing that talks to Jira.

Grep confirms the word "agile", "sprint", "scrum", and "jira" appear nowhere in `engine-1.3/`. This is greenfield surface, which is good news: nothing has to be undone.

---

## 3. Waterfall versus agile on the same engine

### 3.1 The insight that makes this tractable

Engine 1.3 already contains a statement that most people misread:

> Waterfall is the reading and reasoning order; vertical change slices remain the delivery order. — `docs/1.3-new-plan/00-index.md`

So the engine has **two independent axes**, and "waterfall vs agile" only moves one of them:

```text
Axis A — knowledge order        L0 → L1 → L2 → L3 → L4        FIXED. Never changes.
Axis B — delivery batching      how much scope crosses one gate at one time
```

Everything people call "waterfall" or "agile" in engine terms is a choice on Axis B, plus a choice about *when* Axis A knowledge must be approved relative to code existing.

Therefore: **delivery mode is a policy, not a second engine.** We add one configuration value and one planning zone. We do not fork workflows, and we do not touch the knowledge model.

### 3.2 What differs

| Dimension | Waterfall mode | Agile mode |
|---|---|---|
| L1/L2 approval timing | Whole product scope approved before implementation starts | Breadth-level for the product, depth just-in-time per slice |
| Batching unit | Phase (`requirements`, `design`, `build`, `test`, `deploy`) | Iteration (sprint) containing several slices |
| Typical `CHG-` granularity | One change per phase deliverable, large scope | One change per vertical slice, small scope |
| Gate application | Phase exit gate over the entire scope, single sign-off body | Per-slice gate, strictness set by that slice's risk |
| Baseline behaviour | Frozen baseline per phase; changes after freeze go through change control | Rolling baseline; every reconciliation moves it |
| Reconciliation cadence | Batched near the end of build/test | After each verified slice |
| Scope/time contract | Scope fixed, time negotiated | Time fixed, scope negotiated |
| Planning artifacts | Phase plan, WBS, milestone dates, sign-off register | Backlog, sprint goal, capacity, DoR/DoD, velocity |
| Progress signal | Percentage of phase deliverables signed off | Count of slices that reached `reconciled` |
| Failure mode to guard | Approved documents describing unbuilt software | Working code with no durable canonical meaning |

### 3.3 What must be identical in both

Non-negotiable, mode-independent:

- `implemented ≠ verified ≠ reconciled`.
- PASS requires fresh evidence tied to the current revision; a checklist assertion is not evidence.
- Implementation may not invent public behaviour, contracts, architecture, migrations, dependencies, or security rules outside its approved task.
- Every canonical fact has exactly one owner; generated views never become canonical.
- Unknowns stay explicit rather than being promoted to `approved`.
- Traceability `OUT → CAP → REQ → CTR/CMP/ACT → TEST → EVD` is unchanged.

If a mode requires weakening any of these, the mode is wrong, not the engine.

### 3.4 The hard limit worth stating loudly

Engine 1.3's Initial Build workflow carries a stop rule: *never materialize or implement the whole system in one context.* Context Packs fail rather than truncate (`overflow: fail-and-split`).

Consequence: **you can run the engine waterfall at the knowledge and approval level, but you cannot run it waterfall at the execution level.** Even under a phase-gated process, implementation still happens as bounded tasks with per-task Context Packs.

So "waterfall mode" in this engine means precisely: *bigger approval batches and later reconciliation, with unchanged execution granularity.* That is the sentence to put in the engine docs, because it prevents someone from configuring waterfall and then expecting a single monolithic build task.

### 3.5 Hybrid is the realistic default

Most teams need waterfall breadth for architecture, security, and compliance sign-off, then agile depth per slice:

```yaml
delivery_mode: hybrid
knowledge_gate_scope: product      # L0–L2 breadth approved up front
delivery_gate_scope: slice         # each slice gated individually
iteration: enabled                 # slices are scheduled into sprints
phases: enabled                    # phase milestones exist for reporting/sign-off
```

I propose three named modes — `waterfall`, `agile`, `hybrid` — implemented as presets over the same four knobs, so a team can also hand-tune.

---

## 4. New delivery concepts

Minimum concept set that covers everything you listed (team, project, assign, timeline, changes, phases, sprints) without inventing a project-management product:

| Concept | ID prefix | Purpose | Notes |
|---|---|---|---|
| Team | `TEAM-` | A staffing group with roles and a tracker identity | Maps to a Jira project role / board |
| Member | `MBR-` | A person or agent identity, by alias | Alias + handle only. No personal data or secrets. |
| Iteration | `ITER-` | One scheduling window | `iteration_kind: sprint \| phase \| milestone \| release-window` — one concept, four flavours |
| External link | `LNK-` | Binding between an engine ID and an external key | Holds provider, key, URL, last sync, authority |

Deliberately **not** new record kinds:

- **Assignment** → metadata on the `CHG-`/`TASK-` record (`Assigned to`, `Verified by` already exists) plus a generated view. A separate `ASG-` record would double the bookkeeping for zero gain.
- **Project** → already `profile.md` (`project_name`), extended with a tracker project key.
- **Estimate / dates** → fields on `CHG-`/`TASK-`/`ITER-`, not records.
- **Sprint vs phase** → same `ITER-` record with a different `iteration_kind`. This is what lets one mechanism serve both delivery modes.

New relation labels for `conventions.md`: `Assigned to`, `Scheduled in`, `Staffed by`, `Tracked by`. The CLI does not validate the label vocabulary, so this is a documentation change only.

---

## 5. Where delivery facts live — a `delivery/` zone, deliberately non-canonical

The important design choice in this plan.

Assignments, sprint dates, and estimates are **volatile and externally owned**. If we put them in `knowledge/`, three bad things happen, all provable from `bin/sdlc.js`:

1. `hashCanonical()` covers `system-map.md`, `profile.md`, `knowledge/`, `releases/`, `incidents/`. Reassigning a ticket would change the project hash.
2. A changed project hash makes reviewed revisions stale, so **moving a card on a board would invalidate architecture approvals**.
3. `project-layout.md`'s rebuild test says Main must explain how to recreate the system. Sprint 14's capacity does not help anyone rebuild anything.

So:

```text
project/
  delivery/
    team.md            TEAM-*, MBR-*, roles, tracker identities
    iterations.md      ITER-* windows, goals, capacity, scheduled change IDs
    tracker.md         provider config, capability descriptor, field + status mapping
    links.md           LNK-* engine-ID ↔ external-key bindings
  generated/
    delivery/
      sync-packet.json      intended outbound operations (deterministic)
      sync-report.md        applied/skipped/conflicted, per run
      assignments.md        who owns what right now
      iteration-status.md   slice states per iteration
```

Constraints this zone inherits from the current CLI (verified by reading the validator):

- Records anywhere must carry **Kind, Knowledge status, Implementation status, Owner**. For a `MBR-` record, `Implementation status: not-applicable` is the correct value.
- All IDs referenced inside a record block must resolve, and all local Markdown links must exist.
- **ID-collision trap:** the ID matcher is `[A-Z][A-Z0-9]*(?:-[A-Z0-9]+){2,}`, i.e. three or more uppercase segments. A Jira key like `TF-123` has two segments and is safe. A key like `ROYA-CHG-001` would be parsed as an engine ID and fail validation as a missing reference. Mitigations: keep external keys in **front matter** (front matter is excluded from record blocks, so refs there are not resolved) or in a table column the plan declares off-limits for engine IDs. Recommended: front matter now, plus an optional CLI ignore rule for an `external_key:` line later.

Net effect: delivery churn never touches the project hash, never invalidates a semantic approval, and never pollutes the rebuild test — while still being validated, linkable, and reviewable.

---

## 6. Task-management integration architecture

### 6.1 Two sources of truth, split by fact type

The failure mode to avoid is mirroring Jira into Markdown, or mirroring requirements into Jira. Neither survives contact with a real team. Instead, split ownership per fact and never let both sides own the same field:

| Fact | Canonical owner | Authority |
|---|---|---|
| Requirement meaning, acceptance criteria, invariants | Engine (`knowledge/`) | `engine` |
| Design, contracts, data model, code map | Engine | `engine` |
| Task boundary: allowed paths, forbidden inventions, checks, `done_when` | Engine (`TASK-`) | `engine` |
| Change lifecycle status, risk, gate approvals, evidence | Engine (`CHG-`, `EVD-`) | `engine` |
| Assignee, estimate, dates, sprint membership, board column, comments, worklog | Tracker (Jira) | `tracker` |
| Priority, business ordering of the backlog | Tracker, mirrored read-only into engine | `tracker` |
| Stakeholder-readable delivery narrative | Tracker | `tracker` |
| The binding between the two | Engine (`LNK-`) | `engine` |

Rule: **each field has exactly one writer.** Sync copies; it never merges.

### 6.2 A provider-neutral delivery object model

Jira is the first *instance*, not the contract. The contract is a small canonical object model that every provider adapter maps onto:

```text
Portfolio  → Jira: project / Linear: team        / Azure DevOps: project
Team       → Jira: project role or board         / Linear: team
Member     → Jira: account                       / Linear: user
Iteration  → Jira: sprint or fixVersion          / Linear: cycle
WorkItem   → Jira: issue (epic/story/sub-task)   / Linear: issue
Link       → Jira: issue link or remote link
Status     → Jira: workflow status + transition
Attachment → Jira: attachment / comment / remote link
```

A provider adapter supplies three things and nothing more: a **capability descriptor**, a **field mapping**, a **status mapping**. That is what makes "works with Jira or others" real rather than aspirational.

### 6.3 Capability descriptor

`delivery/tracker.md` front matter:

```yaml
tracker_provider: jira            # jira | linear | azure-devops | github-projects | gitlab | none
tracker_mode: mcp-read-write      # none | manual | mcp-read-only | mcp-read-write
tracker_portfolio: TF
tracker_capabilities: [issues, subtasks, epics, sprints, links, attachments, transitions, custom-fields]
tracker_write_policy: dry-run-first
tracker_id_label: roya            # e.g. label "roya:CHG-TASKS-001" for idempotent matching
last_synced_project_hash: <hash>
```

Skills read capabilities before acting. If a provider lacks `sprints`, iteration sync degrades to labels instead of failing. If it lacks `subtasks`, `TASK-` items become checklist items on the parent. **Missing capability degrades, it never blocks.**

### 6.4 Which engine artifact maps to which work item

The mapping decision that determines whether the integration feels natural or forced.

| Engine artifact | Tracker object | Direction | Rationale |
|---|---|---|---|
| `OUT-` outcome | Initiative (optional) | engine → tracker | Often already exists in the tracker; keep optional |
| `CAP-` capability | Epic | engine → tracker | Stable, coarse, matches epic lifespan |
| `REQ-` requirement | Story description + link | engine → tracker | Meaning stays in the engine; the story references it |
| **`CHG-` change** | **Story / primary issue** | **both** | **The natural synced unit** — already has status, risk, owners, baseline |
| `TASK-` execution task | Sub-task | both | Assignment and time tracking land here |
| `ITER-` iteration | Sprint / fixVersion | both | Membership is tracker-owned, goal is engine-owned |
| `EVD-` evidence | Attachment or remote link | engine → tracker | Never the reverse; evidence is engine-owned |
| Gate approval | Transition + approval field/comment | engine → tracker | A tracker comment is *not* an engine approval |
| Verification result | Transition + comment | engine → tracker | Board state must not be able to declare PASS |

**`CHG-` as the primary synced unit** is the recommendation: it is the only engine object that already carries status, risk, owners, and baseline, so the mapping is 1:1 with no synthetic objects.

### 6.5 Lifecycle mapping and direction rules

```text
engine                          Jira (illustrative)
draft ─────────────────────────► Backlog
analyzed ──────────────────────► Refinement
approved ──────────────────────► Ready for Dev (DoR met)
ready ─────────────────────────► Ready for Dev + context pack attached
in-progress ───────────────────► In Progress
verified ──────────────────────► In Review / QA Passed
reconciled ────────────────────► Done  (DoD met)
closed ────────────────────────► Closed
blocked / failed ──────────────► Blocked / Reopened
```

Direction rules, which are the actual safety property:

1. **Engine status is authoritative; tracker status is a projection.** Sync writes engine → tracker.
2. A tracker transition may only **request** an engine transition. It becomes a routing input, never an automatic state change. Dragging a card to Done does not make anything `verified` or `reconciled`.
3. Tracker-owned fields (assignee, estimate, sprint, priority, comments) flow tracker → engine as **read-only mirror** into `delivery/`, never into `knowledge/`.
4. Any divergence outside these two lanes is a **conflict**, reported, never silently resolved.

### 6.6 Four integration modes that collapse into one code path

This is how "handle it if MCP exists or not" stays simple.

| Mode | Reads | Writes | Who applies the outbound packet |
|---|---|---|---|
| `none` | — | — | nobody; delivery data is engine-local only |
| `manual` | pasted/imported snapshot | — | a human, from a generated packet |
| `mcp-read-only` | MCP | — | nobody |
| `mcp-read-write` | MCP | MCP | the agent, via MCP, after dry-run |

Every mode produces the **same deterministic sync packet** (`generated/delivery/sync-packet.json`): an ordered list of intended `create` / `update` / `transition` / `link` / `comment` operations, each carrying its engine source ID and a precondition. Modes differ *only in who applies it*.

Consequences worth having:

- The offline, dependency-free CLI keeps working: it computes and validates the packet, it never calls the network.
- **MCP calls live in the skill/agent layer, not in the CLI.** This preserves `engine.json`'s zero-dependency runtime and keeps validation reproducible in CI.
- `manual` mode is not a second-class fallback; it is the same packet with a human applier.
- Every mode is testable without credentials, because the packet is a file.

### 6.7 Idempotency, staleness, conflicts

- **Idempotency** by dual keying: the engine ID is written to the tracker (label `roya:CHG-TASKS-001` or a custom field), and the external key is written to the engine `LNK-` record. Re-running a sync produces no duplicates.
- **Staleness** by reusing the existing project hash: `last_synced_project_hash` versus the current `hashCanonical()` output tells the skill exactly whether canonical meaning moved since the last sync. No new mechanism needed.
- **Preconditions** on every operation, so a packet applied against a moved tracker state fails loudly instead of overwriting.
- **Conflict classification** before resolution, following the governance doc's existing pattern: `authority-violation` (wrong side wrote a field), `divergence` (both changed), `orphan` (tracker item with no engine ID), `dangling` (engine ID whose tracker item vanished). Each class gets a named decision owner, not a timestamp-wins rule.

### 6.8 Guardrails to add to `rules/core.md`

1. External tracker state is never evidence.
2. A tracker comment or approval field is never an engine gate approval.
3. Assignment grants no scope: an assignee still works only inside the approved task boundary.
4. Sync never creates, changes, or deletes canonical meaning; a needed meaning change goes back through a Change Blueprint.
5. Dates never override gates. A due date cannot make an unverified slice `verified`.
6. Member records hold aliases and contact routes, never personal or sensitive data.

---

## 7. Engine change inventory

Honest answer to "maybe we need changes in the engine, maybe not": **mostly additive, no breaking change, and roughly half is documentation.**

### 7.1 Documentation-only (no code)

| File | Change |
|---|---|
| `README.md` | New section: delivery modes and their relationship to the reading model |
| `flow.md` | Router also reads `delivery_mode`; add the tracker-transition-is-a-request rule |
| `conventions.md` | New ID prefixes `TEAM-`, `MBR-`, `ITER-`, `LNK-`; four new relation labels |
| `project-layout.md` | New `delivery/` zone with its non-canonical ownership statement |
| `risk-and-gates.md` | Gate-scope knob: whole-scope phase gate versus per-slice gate |
| `rules/core.md` | The six guardrails from §6.8 |
| New `delivery-modes.md` | The full waterfall/agile/hybrid comparison and the §3.4 limit |

### 7.2 Additive, backward compatible

| Item | Change | Why it is safe |
|---|---|---|
| `profile.md` | Add `delivery_mode`, `iteration_length`, `tracker_*` keys | The front-matter parser ignores unknown keys; nothing validates a key allowlist |
| `execution-task.schema.json` | Optional `assignee`, `estimate`, `iteration`, `external_key`, `depends_on` | `additionalProperties: true` already |
| `change.schema.json` | Optional `iteration`, `phase`, `team`, `due`, `priority`, `external_key` | `additionalProperties: true` already |
| New schemas | `iteration.schema.json`, `tracker-adapter.schema.json`, `sync-packet.schema.json` | New files |
| New templates | `team-template.md`, `iteration-template.md`, `tracker-template.md`, `delivery-plan-template.md`, `sync-report-template.md` | New files |
| New skills | `plan-delivery` (schedule ready slices into an iteration/phase under capacity), `sync-tracker` (build packet, apply per mode, report conflicts) | New folders; existing skills untouched |
| New workflow | `09-delivery-cadence.md`, parameterized by mode rather than one workflow per mode | New file |

### 7.3 CLI changes (optional, last)

Strictly optional and network-free:

- `sdlc.js delivery <root>` → validate the delivery zone, emit `sync-packet.json` plus the assignment and iteration views.
- Extend `validate` with delivery-aware checks (§8), **behind a flag or auto-skipped when `delivery/` is absent**, so existing projects and the demo keep passing untouched.

### 7.4 What must not change

The knowledge model, the layer semantics, the change lifecycle names, the context-pack budget behaviour, and the zero-dependency offline CLI guarantee.

---

## 8. Validations we get for free

Once staffing and scheduling are machine-readable, the engine can check things it currently can only recommend:

| Check | Rule source |
|---|---|
| High/critical-risk change has a verifier different from its implementer | `risk-and-gates.md`, governance doc |
| Every `CHG-` in `ready` or `in-progress` has an assignee and an iteration | delivery policy |
| Overlapping exclusive `claimed_paths` / `claimed_ids` across active changes | governance doc §Parallel work |
| Every `LNK-` resolves on both sides; no orphan and no dangling links | §6.7 |
| No `CHG-` is `reconciled` while its tracker item is still open, or vice versa | §6.5 |
| `last_synced_project_hash` matches the current hash before an outbound sync | §6.7 |
| Iteration committed scope does not exceed declared capacity | delivery policy |

This is the strongest argument for doing this work at all: it turns three governance recommendations into deterministic checks.

---

## 9. Implementation roadmap

Each phase is independently shippable and leaves the engine and demo valid.

| Phase | Content | Done when |
|---|---|---|
| **P0 — Decide and document** | `delivery-modes.md`, profile keys, conventions/rules/layout/gates edits. No code. | `validate` still passes on `engine-1.3-demo`; a reader can state the difference between the modes and the §3.4 limit |
| **P1 — Delivery zone** | Templates and schemas for `team.md`, `iterations.md`, `tracker.md`, `links.md`; populate them in the demo | Demo has a real team, one sprint, one phase; `validate` passes; project hash unchanged by delivery edits |
| **P2 — Skills and workflow** | `plan-delivery`, `sync-tracker`, `09-delivery-cadence.md`; router reads `delivery_mode` | One slice runs end to end in `agile` mode and again in `waterfall` mode with no engine edits between runs |
| **P3 — Sync packet** | `sync-packet.schema.json`, `sdlc.js delivery`, delivery-aware validations, conflict classifier | Packet is byte-stable across runs; conflicts are reported not resolved; `mode: none` and `mode: manual` both fully work |
| **P4 — Jira via MCP** (plan 002) | Provider adapter, field/status mapping, dry-run, then read-only, then read-write | One `CHG-` and its `TASK-`s round-trip: created, assigned, transitioned, evidence linked, reconciled |
| **P5 — Prove neutrality** | A second provider (Linear or GitHub Projects) using the same contract | Adding it touches only the provider adapter — zero changes to skills, schemas, or the CLI |

P5 is the real test of §6.2. If adding provider two requires touching anything else, the abstraction was wrong and P4 should be revisited before shipping.

---

## 10. Risks

| Risk | Mitigation |
|---|---|
| Double bookkeeping: the same fact maintained in two systems | Single-writer-per-field ownership table (§6.1); sync copies, never merges |
| Board state used to fake completion | `verified`/`reconciled` are engine-only; tracker transitions are requests (§6.5); guardrail 1–2 |
| Delivery churn invalidating architecture approvals | Non-canonical `delivery/` zone outside the project hash (§5) |
| External keys colliding with the engine ID pattern | Front-matter-only external keys; documented three-segment collision rule (§5) |
| MCP unavailable, throttled, or permission-limited | Four modes with graceful degradation; the packet is a file, so nothing is blocked (§6.6) |
| Personal data leaking into a versioned repo | Aliases and contact routes only; guardrail 6 |
| Scope creep into building a project-management tool | Only four new record kinds; no estimates engine, no velocity forecasting, no reporting UI |
| Waterfall mode misread as "one giant build task" | Stated explicitly in `delivery-modes.md` per §3.4 |

---

## 11. Decisions I need from you

Four choices change the shape of the implementation. My recommendation is listed first in each case.

1. **Primary synced unit:** `CHG-` as the Jira story (recommended), or `REQ-`, or `TASK-` only.
2. **`delivery/` zone canonicality:** non-canonical, outside the project hash (recommended), or inside `knowledge/08-delivery/`.
3. **Write direction for P4:** engine → tracker only at first, then read-write later (recommended), or read-write immediately.
4. **Target engine:** `engine-1.3/` (recommended, matches your request), or `engine-1.3-improvement-001-gaps-concerns-quality/` which already has extra skills and schemas and would otherwise need this work ported twice.

---

## 12. What `sdlc-and-agile-imp.md` will contain

Once the above is settled: exact file-by-file diffs for P0–P3, the record shapes for `TEAM-`/`MBR-`/`ITER-`/`LNK-`, the two new skill contracts, the `09-delivery-cadence.md` workflow, the sync-packet schema, the delivery-aware validation list, and the demo walk-through proving one slice in both modes.

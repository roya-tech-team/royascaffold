# 02 — Engine 1.6: Evolve

> **Goal:** changing a product that already exists is as safe and traceable as building it.
> Requirements change cleanly, every release has a baseline, experiments and rollbacks are
> first-class, and adoption works on large codebases.
> **Builds on:** 1.5 (fingerprints, freshness, inferred records, scan, contract v1).
> **Repo:** `royascaff` · **Releases:** `1.6.0-beta.N` → `rc` → `1.6.0`.
> **Order:** 1.6 comes before 1.7, and 1.7 includes everything in 1.6.
> **Can run in parallel with Studio.** Studio shows 1.6 features once a project pins 1.6
> (the contract adds fields only; no Studio change is required to keep working).

## 1. Features

| ID | Feature | In one line |
|---|---|---|
| E1 | Requirement deltas | Changing a requirement creates a delta record; everything that depended on the old wording is flagged. |
| E2 | Workflow and contract deltas | The same for workflows (WF-) and contracts (API/data contracts). |
| E3 | Baselines | A frozen snapshot of the knowledge at each release; diff any two baselines. |
| E4 | History | `royascaff history <ID>`: every version of a record, who changed it, in which change. |
| E5 | Feature flags | FLAG- records: what a flag hides, its owner, its removal date; the board warns about old flags. |
| E6 | Experiments | EXP- records: a hypothesis, the variants, the metric, the decision; linked to an outcome (OUT-). |
| E7 | Rollback | `royascaff rollback <CHG|REL>` opens a revert change with its own evidence; requirements go back to their previous baseline state. |
| E8 | Large-codebase adoption | An incremental scan cache, per-module checkpoints, parallel adoption tasks, and a budget per module. |
| E9 | Deprecation | Requirements and components can be `deprecated` with a removal slice; the code map shows their code as scheduled for removal. |
| E10 | Upgrade path | `royascaff migrate` 1.5 → 1.6, reversible (backups), as in 1.4. |

## 2. Requirement deltas (E1, E2)

Today a changed requirement is edited in place, and `refine` asks to confirm the slices. That loses what the old wording was, and it doesn't find the tests and evidence that proved the old version.

**New flow:**
1. `royascaff change REQ-READ-002 --by …` opens (or joins) a change of kind `evolve`. The change holds a delta block:
   ```
   ## Delta REQ-READ-002 (v2 → v3)
   Before: A title is required.
   After:  A title is required and must be at most 200 characters.
   Why:    SRC-READ-014 (support ticket quote)
   ```
2. On record, the requirement's version increases. The old text stays in its history (E4).
3. **Impact is found automatically.** Every test (TEST-) that verifies the requirement, every evidence record, every slice that delivered it, and every component that realizes it is listed in the change's Impact table as *affected*. Evidence for the old version turns **stale** (1.5 V3).
4. The Understand gate refuses to move on until each affected item is marked *update* or *still valid (reason)*.

Workflows and contracts use the same delta block. A contract delta with a removed field is **breaking**: it needs risk ≥ high and a person's approval.

## 3. Baselines and history (E3, E4)

- `royascaff release REL-… --baseline` (and every `REL-` by default) writes `project/baselines/<REL-ID>.json`: all records with their versions and the fingerprints of their evidence. It uses the contract's export schema.
- `royascaff diff <REL-A> <REL-B> [--json]`: added, changed and removed requirements, features and components, with the changes that caused each.
- `royascaff history <ID> [--json]`: each version, the event that made it, the person or agent, and the change.
- The board's Releases section shows what changed since the last baseline.
- Studio uses `diff` for the client's "what's new" page (file 04 §8).

## 4. Flags, experiments and rollback (E5–E7)

- **FLAG-** records: `Hides: CAP-…/REQ-…`, `Owner`, `Remove by: <date or REL>`. The board lists flags past their removal date. A requirement behind an off flag is not "delivered" for outcomes.
- **EXP-** records: `Hypothesis`, `Variants`, `Metric` (a metric name, the same form as the NFR measures: `` `signup_rate >= 0.05` ``), `Outcome: OUT-…`, `Decision: keep A | keep B | stop`. `royascaff measure EXP-… --result …` records the decision; the losing variant becomes a removal slice.
- **Rollback:** `royascaff rollback CHG-…` opens a change of kind `rollback` with:
  - the commits to revert (from the change's evidence and the git log);
  - the requirements whose state returns to the previous baseline;
  - a required verify run after the revert.
  The engine never runs `git revert` itself; the AI or the person does it in the change's task, as with all code work.

## 5. Large codebases (E8)

| Problem at scale | 1.6 answer |
|---|---|
| `scan` re-reads everything | Incremental cache keyed by git blob hash; only changed files are re-scanned |
| One adoption session can't hold a big module | Modules above a size budget are split into sub-modules; each is a checkpoint |
| Adoption is serial | `adopt --plan` creates one knowledge change per module; different agents can take them (claims arrive in 1.7) |
| The board gets long | The board shows a summary per module; details via `show` and `trace` |

Target: a 200k-line repo adopts module by module with no single session over 60% context.

## 6. Out of scope for 1.6

Multi-repo products (later), the MCP server and claims (1.7), any server (Studio).

## 7. Acceptance gate for 1.6.0

| # | Test | Pass when |
|---|---|---|
| B1 | Delta | Changing a requirement flags its tests, evidence and slices; the gate refuses until each is handled |
| B2 | Baseline | Two releases diff correctly; history shows every version of a record |
| B3 | Rollback | A rolled-back change restores the previous baseline state after a passing verify |
| B4 | Real project | Validated on one real client project with a changed requirement and one rollback (as in 1.4 file 07) |
| B5 | Scale | A 200k-line public repo adopted to ≥ 80% ownership with layer coverage, within the session budget |
| B6 | Contract | Only additive contract changes (`1.x`); all contract tests pass |

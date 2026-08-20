# Team Collaboration and Governance

## Collaboration goal

The blueprint should be a team memory and coordination surface, not an AI-only artifact. A developer must be able to correct, approve, own, and evolve the same records that agents consume.

## Ownership model

Canonical artifacts support:

- accountable owner/team;
- optional domain/product/architecture/security/operations reviewers;
- code owners or repository owners;
- last confirmed date/source;
- escalation/contact alias (not personal secrets).

Ownership is assigned at the highest stable scope (context/module/layer) and overridden only for exceptional records. Do not repeat owner lists on every tiny section when inheritance is clear.

## Change roles

| Role | Responsibility |
|------|----------------|
| Requester/product owner | outcome, priority, acceptance, scope decisions |
| Analyst/domain reviewer | requirement/workflow correctness |
| Designer/architect | solution, boundaries, contracts, quality/operations design |
| Planner | executable task partition and context completeness |
| Implementer | code/tests/config within approved tasks |
| Verifier | independent evidence and semantic assessment as policy requires |
| Reconciler | canonical conflict resolution/application |
| Release/operations owner | deployment, monitoring, rollback, incident linkage |

One person/agent may hold multiple roles for low-risk work. High/critical risk requires separation defined in the gate policy.

## Developer knowledge capture

When a developer says “the workflow is actually X,” “this exception is intentional,” or “use provider Y for this reason,” the engine must:

1. identify the owning canonical artifact;
2. record the source and rationale;
3. assess affected relations/artifacts;
4. update through a knowledge change or the active change delta;
5. revalidate/rebuild affected Context Packs;
6. use an ADR only when the decision is lasting and consequential.

Do not store durable decisions only in chat, PR comments, or task notes.

## Parallel work

### Claims

Before a change becomes `ready`, it declares:

- artifact IDs it intends to modify;
- exclusive/shared ownership intent;
- code paths or path patterns it may change;
- contract/schema/migration names;
- dependency change IDs and required revisions.

The generated active-change index detects overlapping exclusive claims. Overlap does not always prohibit work, but it must be resolved by ordering, shared coordination, or scope split before implementation.

### Dependency semantics

- A dependent change may be analyzed/designed against an approved predecessor.
- It may be implemented only when predecessor code exists in the same baseline/working tree.
- It may be reconciled only when its canonical baseline includes reconciled dependencies or an explicitly supported stacked-change strategy.
- `verified` alone is not proof that another branch contains the code.

## Branch and review guidance

Recommended, not hard-coded to one Git host:

- one active change per branch/worktree when practical;
- code, tests, blueprint delta, evidence, and reconciliation preview travel together;
- review order: outcome/requirements → design/plan → code diff → evidence → reconciliation preview;
- central change/status views are generated after merge, not edited by every branch;
- canonical Main changes occur through reconciliation rather than ad hoc edits during implementation;
- emergency override is allowed only through an explicit policy record and mandatory follow-up reconciliation.

## Handoff contract

A handoff between people/sessions/models consists of:

- change state and baseline;
- next task ID and dependencies;
- validated Context Pack;
- execution plan and allowed scope;
- completed outputs/evidence;
- open findings/decisions/blockers;
- exact next eligible action.

No handoff may depend on “read the previous chat.”

## Reviews and approvals

Approval records include:

- decision/artifact/change ID;
- reviewer role/identity;
- reviewed revision/hash;
- decision and conditions;
- timestamp;
- expiry/re-review condition when relevant.

If the reviewed artifact changes materially, the approval is stale. Mechanical formatting or generated-view changes should not invalidate semantic approval unless canonical content changes.

## Conflict resolution

Conflicts are classified before resolution:

| Conflict | Owner of decision |
|----------|-------------------|
| Requirement meaning | product/domain owner |
| Domain invariant/workflow | domain owner |
| Architecture/boundary | architecture owner/team |
| Security/privacy | security/data owner plus product risk acceptance |
| Public contract compatibility | owning/consumer teams |
| Implementation mechanics | code owner/implementer within approved design |
| Canonical baseline merge | reconciler with artifact owners |

The engine must not choose semantic winners from timestamps alone.

## Governance records

Use the smallest correct record:

- requirement source/rationale for product behavior;
- domain invariant for always-true rules;
- ADR for lasting technical choices/tradeoffs/exceptions;
- accepted-risk record for knowingly unmet quality/security constraints;
- release record for deployed composition;
- incident record for operational events/learning;
- change archive for provenance and evidence.

Avoid ADRs for routine code style or reversible local mechanics.

## Team onboarding

Recommended path:

1. `system-map.md` and its context/module/UML views;
2. business glossary and relevant domain/workflows;
3. requirements/NFRs for owned capability;
4. project architecture and contracts;
5. component/code map and quality/operations knowledge;
6. active changes for the owned scope.

Historical packs are optional audit material, not onboarding material.

## Collaboration acceptance

The collaboration model succeeds when:

- two non-overlapping changes can proceed without a shared hand-edited log;
- overlapping claims are detected before implementation;
- a new implementer can resume from artifacts alone;
- developer corrections survive beyond the conversation;
- high-risk verification is independent;
- the current system remains understandable without reading archived changes.


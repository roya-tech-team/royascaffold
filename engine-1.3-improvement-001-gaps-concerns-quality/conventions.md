# Engine Conventions

## Canonical document header

Every canonical Markdown file uses simple YAML front matter:

```yaml
---
document_id: DOC-POLLS-REQUIREMENTS
title: Poll requirements
layer: requirements
schema_version: 1
document_status: approved
owners: [polls-team]
---
```

Allowed `document_status`: `draft`, `in-review`, `approved`, `deprecated`, `superseded`.

## Artifact record

Catalog files contain addressable records:

```md
### REQ-POLLS-001 · Create a poll

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** polls-team
- **Satisfies:** `CAP-POLLS-001`
- **Realized by:** `ACT-POLLS-001`, `CMP-POLLS-001`
- **Verified by:** `TEST-POLLS-001`
```

Required metadata: Kind, Knowledge status, Implementation status, Owner.

Allowed knowledge status: `draft`, `in-review`, `approved`, `deprecated`, `superseded`.

Allowed implementation status: `not-planned`, `planned`, `partial`, `implemented`, `verified`, `not-applicable`.

## Typed relation labels

Use: `Satisfies`, `Constrained by`, `Described by`, `Realized by`, `Exposes`, `Accepts`, `Returns`, `Implements`, `Depends on`, `Maps to`, `Verified by`, `Supersedes`, `Affects`, `Supports`, `Configures`, `Migrates`, `Owned by`.

All referenced IDs must resolve. Do not use ID ranges in canonical relations.

## IDs

| Kind | Prefix |
|------|--------|
| Document | `DOC-` |
| Outcome/capability | `OUT-`, `CAP-` |
| Requirement/use case/NFR | `REQ-`, `UC-`, `NFR-` |
| Concept/invariant/workflow | `CON-`, `INV-`, `WF-` |
| Contract/component/action | `CTR-`, `CMP-`, `ACT-` |
| Legacy action IDs | `SVC-`, `EP-`, `PG-`, `VW-` |
| Rule/decision/test | `RULE-`, `ADR-`, `TEST-` |
| Change/task/evidence/release/incident | `CHG-`, `TASK-`, `EVD-`, `REL-`, `INC-` |
| Decision/finding/assumption/criterion | `DEC-`, `FND-`, `ASM-`, `CRIT-` |
| Reference/pattern/review | `RDR-`, `PAT-`, `REV-` |

IDs are stable, uppercase, and never reused after supersession.

## Decision and materiality states

Material quality-by-design records add these fields when applicable:

```md
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** stakeholder interview 2026-01-20
```

Allowed decision status: `proposed`, `decided`, `approved-assumption`, `delegated`,
`blocked`, `superseded`.

Allowed materiality: `non-material`, `material`, `critical`. A material or critical
record in `proposed`, `delegated`, or `blocked` state cannot be treated as implementation
ready. `approved-assumption` must name authority, consequence, and review/expiry point.

Use the record types consistently:

| Prefix | Purpose |
|---|---|
| `DEC-*` | approved stakeholder/product/design decision |
| `FND-*` | sourced observation or derived finding with confidence |
| `ASM-*` | explicit assumption with consequence and review point |
| `CRIT-*` | observable acceptance/quality outcome and proof method |
| `RDR-*` | reference observation translated to retain/adapt/reject decision |
| `PAT-*` | selected solution pattern, forces, alternatives, and failure modes |
| `REV-*` | immutable gate result tied to exact reviewed inputs |

## Quality criteria

A `CRIT-*` record states an observable product outcome. It includes Priority
(`must`, `should`, `may`), Foundation (`yes`/`no`), Outcome, Method, Authority class,
and `Verified by`. A mechanism such as “uses cache” or “uses instancing” is a pattern
or constraint, not sufficient product acceptance by itself.

Material thresholds identify their authority: `owner`, `existing-standard`,
`adapter-recommended`, `regulation`, or `approved-assumption`. A model may recommend a
threshold with rationale; it may not silently approve its own quality bar.

## Review and authority

SQR and IRR use `pass`, `pass-with-conditions`, or `revise`. Verification uses `pass`,
`fail`, `inconclusive`, `manual-required`, `not-applicable`, or `stale`.

Authority classes: `implementer-self-check`, `fresh-context-reviewer`,
`independent-model`, `independent-person`, `deterministic-runner`, and
`stakeholder-owner`. The selected risk/gate profile declares which class may adjudicate
each material criterion. A review becomes stale when a reviewed material input changes.

## Significant-file rule

A file needs a component owner when it owns business/security logic, persistence, I/O, public/cross-module behavior, a runtime entry, asynchronous processing, independently replaceable infrastructure, or a meaningful reusable responsibility.

Code-map relationships: `implements`, `defines`, `supports`, `configures`, `verifies`, `migrates`, `generated`, `vendor`, `excluded`.

Every file under a declared source root must appear in the code map or match an approved exclusion.

## Source of truth

- one durable fact, one canonical owner;
- indexes/status/context are generated views;
- active deltas stay outside Main;
- archived/superseded material is excluded by default;
- developer corrections update the owner or create a change;
- unknown facts are explicit, never guessed into `approved` or `verified`.

## Evidence

PASS requires evidence tied to the current source/artifact revision. Evidence records
criterion, source revision or fingerprint, command/replay procedure, expected/actual
result, scope, time, environment, executor, adjudicator, artifact/log reference,
limitations, redactions, and freshness. A relevant source, configuration, criterion,
or implementation change makes evidence `stale` until replayed. Runner absence becomes
`manual-required`, never PASS. `not-applicable` requires a reason and policy decision.

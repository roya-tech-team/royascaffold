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

IDs are stable, uppercase, and never reused after supersession.

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

PASS requires evidence tied to the current source/artifact revision. Evidence records command/inspection, result, scope, time, tool/environment, artifact/log reference, and redactions. `skipped` and `not-applicable` require a reason and policy decision.


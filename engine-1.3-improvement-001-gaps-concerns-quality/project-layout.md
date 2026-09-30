# Project Layout Contract

The generated project root is a portable, layered knowledge repository.

```text
project/
  system-map.md
  profile.md
  knowledge/
    01-business/
    02-requirements/
    03-domain/workflows/
    04-design/
      architecture/decisions/
      data/
      contracts/
      experience/
    05-implementation/
      components/
      actions/
      code-map/
      tests/
    06-quality/
    07-operations/runbooks/
  changes/
    active/<change-id>/
      change.md
      quality-design-contract.md      # separate only when routed
      reference-decisions.md          # when influential sources apply
      pattern-decisions.md            # when material choices apply
      solution-quality-review.md      # when SQR is routed
      execution-plan.md
      implementation-readiness-review.md
    archive/<change-id>/
  contexts/
    manifests/
    generated/
  evidence/
  releases/
  incidents/
  generated/
```

## Required artifacts

- `system-map.md` and `profile.md`;
- business brief/BRD;
- functional requirements and NFRs;
- domain model and complex workflows;
- project-specific architecture overview;
- implementation components/actions/code map;
- quality strategy.

## Conditional artifacts

Create security, data, contracts, experience, migration, deployment, observability, runbook, release, incident, or specialized adapter artifacts only when their triggers apply.

Quality-by-design contracts are semantic, not file-count requirements. Compact work
may embed a QDC delta and review checklist in `change.md`. Use separate files when the
work is standard/rigorous, independently approved, reused across tasks, or too large
for the Change's context budget.

## Quality artifact ownership

| Artifact | Active owner | After reconciliation |
|---|---|---|
| QDC | Change | durable criteria merge into Main requirements/experience/quality; QDC archives |
| RDR | Change | durable decisions merge into Main design/experience; provenance archives |
| Pattern decision | Change | durable architecture/design decision merges to Main |
| SQR / IRR | Change | archive as gate provenance; never become requirements |
| Context Pack | generated view | discard/regenerate; never reconcile |
| Evidence | Change/release | retain as source-bound history |

## Document profiles

- **Compact:** one catalog file per layer/area.
- **Modular:** split by module or bounded context.
- **Federated:** split by runtime/team/repository; connect through the system map and IDs.

Split when a file exceeds its context budget, ownership differs, a release boundary exists, terminology/invariants form a distinct context, or parallel work repeatedly conflicts.

## Zones

| Zone | Ownership |
|------|-----------|
| `knowledge/`, `system-map.md`, `profile.md` | Main Blueprint: current reconciled knowledge plus approved roadmap |
| `changes/active/` | Change Blueprint: proposed after-state and execution |
| `contexts/` | Slice Manifest and generated execution view; never canonical |
| `generated/` | disposable indexes/status/traceability views |
| `changes/archive/`, `releases/`, `incidents/` | historical/provenance records, excluded from default implementation context |

## Rebuild test

Main plus the declared project profile must explain the product, behavior, architecture, contracts, implementation ownership, quality posture, and operations sufficiently to recreate the implemented system without reading archived changes.

The rebuild test includes material reference, visual, content, interaction, and pattern
decisions. If a future implementer needs the original chat to reproduce the approved
result, reconciliation is incomplete.

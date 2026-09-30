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


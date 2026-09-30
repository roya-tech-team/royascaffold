# Project Layout Contract

```text
project/
  system-map.md
  profile.md
  requirements/{product.md,non-functional.md,modules/}
  architecture/{overview.md,security.md,applications/,modules/,patterns.md}
  domain/{glossary.md,contexts.md,modules/}
  workflows/<module>/
  contracts/<app>/<module>.md
  data/<app>/<module>.md
  implementation/components/<app>/<module>.md
  implementation/code-map/<app>/<module>.md
  decisions/ADR-*.md
  changes/active/change-<ID>-<slug>/
    change.md
    impact.md
    delta/                 # full after-state canonical files at mirrored paths
    execution/
      plan.md
      tasks/*.md
      context/*-manifest.md
      context/*-pack.md
      evidence/
    verification.md
    reconciliation.md
  changes/archive/<year>/
  bugs/{active,archive}/
  indexes/{artifacts.json,artifacts.md,status.md,changes.json,changes.md}
  verify/latest-system-report.md
```

## Canonical versus temporary

- Everything from `requirements/` through `decisions/` is canonical current knowledge.
- `system-map.md` is the validated top-level map, not a duplicate master specification.
- `indexes/` is generated and non-canonical.
- `changes/active/` is temporary proposed/execution state.
- `changes/archive/` is audit history and excluded from ordinary context.
- Code remains in repository roots declared by `profile.md`; the code map links it to canonical artifacts.

## Delta rule

Concept 2 reconciliation uses full after-state Markdown files inside `delta/`, mirroring their canonical target paths. This makes apply/rollback deterministic. A later schema version may support safe artifact-section merging; v1.3 must not implement fragile text merging.

## Small project rule

Small projects may keep one file per layer. Split by module/app when ownership or context size requires it. Never create a file per trivial helper merely to satisfy a template.

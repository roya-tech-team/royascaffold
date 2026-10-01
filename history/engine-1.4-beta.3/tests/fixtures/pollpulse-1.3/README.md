# PollPulse v1.3 SDLC Blueprint Demo

This folder is the v1.3 **project blueprint** migrated from `example-v1.2/`. The application code remains in the original demo and is referenced through the code map; the old demo is not modified.

## Reading path

1. [System map](system-map.md) — product, actors, boundaries, modules, workflows, and deeper links.
2. [Business requirements](knowledge/01-business/brd.md) — why PollPulse exists and its capabilities.
3. [Functional requirements](knowledge/02-requirements/functional.md) and [NFRs](knowledge/02-requirements/nfr.md).
4. [Domain model](knowledge/03-domain/model.md) and [poll lifecycle UML](knowledge/03-domain/workflows/poll-lifecycle.md).
5. [Architecture](knowledge/04-design/architecture/overview.md), [security](knowledge/04-design/architecture/security.md), [data](knowledge/04-design/data/model.md), and contracts.
6. [Components](knowledge/05-implementation/components/foundation.md), [actions](knowledge/05-implementation/actions/api.md), and [code maps](knowledge/05-implementation/code-map/api.md).
7. [Quality strategy](knowledge/06-quality/strategy.md) and [operations](knowledge/07-operations/deployment.md).

## Important migration truth

The source implements the documented workflows, but the v1.2 packages have no automated test scripts. v1.2 Markdown reports asserted PASS without command output. v1.3 therefore maps application artifacts to `implemented`, not `verified`, and records the missing tests as explicit quality debt.

## Validate and regenerate

From the repository root:

```bash
node engine-1.3-sdlc/bin/sdlc.js validate engine-1.3-sdlc-demo
node engine-1.3-sdlc/bin/sdlc.js index engine-1.3-sdlc-demo
node engine-1.3-sdlc/bin/sdlc.js context engine-1.3-sdlc-demo engine-1.3-sdlc-demo/contexts/manifests/poll-voting.manifest.md
```

Generated files under `generated/` and `contexts/generated/` are views, not canonical knowledge.

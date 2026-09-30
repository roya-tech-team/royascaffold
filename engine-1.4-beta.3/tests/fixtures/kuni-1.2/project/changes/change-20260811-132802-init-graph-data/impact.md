# Impact Analysis — GraphData (REQ-INIT 2/5)

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | none | — | greenfield |
| Service(s) | none | — | local modules only |
| Endpoint(s) | none | — | no API in MVP |
| Page(s) | none | `src/features/graph/` | types, config, data modules missing |

Feature state: **none** (greenfield; depends on Foundation shell)

## Affected Modules
- **GraphData** — create types, visual configs, mock data, and cluster generator

## Pack blueprint files to create
- [x] `blueprint/plan/modules.md` — GraphData module excerpt
- [x] `blueprint/actions/web/pages/graph-data.md` — PG-GRAPHDATA-01 after-state
- [x] `blueprint/_index.md`
- [x] `status.md`

## Expected code files to create (under `src/`)
- `src/features/graph/types/graph.ts` (or split: `node.ts`, `edge.ts`, enums)
- `src/features/graph/types/index.ts`
- `src/features/graph/config/nodeTypeConfig.ts`
- `src/features/graph/config/edgeTypeConfig.ts`
- `src/features/graph/config/index.ts`
- `src/features/graph/data/mockGraph.ts`
- `src/features/graph/data/graphGenerator.ts`
- `src/features/graph/data/index.ts`

## Risk: complexity M, cross-module Y (GraphScene consumes), migration N

## Recommendation
- **Create**: graph domain types, configs, mock dataset, generator — **Complete**: — — **Modify**: —

## Status target (per artifact in the pack after implement)
- PG-GRAPHDATA-01 → done

## Dependencies
- depends-on: change-20260811-132801 — current pack-status of dep: drafted

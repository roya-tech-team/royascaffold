# Impact Analysis — GraphScene (REQ-INIT 3/5)

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | none | — | types in GraphData pack |
| Service(s) | none | — | local graph modules |
| Endpoint(s) | none | — | no API in MVP |
| Page(s) | none | `src/features/graph/components/` | canvas, nodes, edges, labels, FX missing |

Feature state: **none** (greenfield; depends on Foundation + GraphData)

## Affected Modules
- **GraphScene** — create R3F canvas, node/edge rendering, labels, environment/effects

## Pack blueprint files to create
- [x] `blueprint/plan/modules.md` — GraphScene module excerpt
- [x] `blueprint/actions/web/pages/graph-scene.md` — PG-GRAPHSCENE-01 after-state
- [x] `blueprint/_index.md`
- [x] `status.md`

## Expected code files to create (under `src/`)
- `src/features/graph/components/GraphCanvas.tsx`
- `src/features/graph/components/GraphNodes.tsx` (or instanced variant)
- `src/features/graph/components/GraphEdges.tsx`
- `src/features/graph/components/GraphLabels.tsx`
- `src/features/graph/components/GraphBackground.tsx` (particles/stars)
- `src/features/graph/components/GraphEffects.tsx` (post-processing)
- `src/lib/three/` helpers as needed
- Wire canvas into `src/app/App.tsx`

## Risk: complexity H, cross-module Y (GraphData + future Interaction), migration N

## Recommendation
- **Create**: full 3D graph scene rendering stack — **Complete**: — — **Modify**: App shell composition

## Status target (per artifact in the pack after implement)
- PG-GRAPHSCENE-01 → done

## Dependencies
- depends-on: change-20260811-132802 — current pack-status of dep: blocked

# Impact Analysis — GraphInteraction (REQ-INIT 4/5)

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | none | — | GraphUiState in store |
| Service(s) | none | — | local adjacency from dataset |
| Endpoint(s) | none | — | no API in MVP |
| Page(s) | none | `src/features/graph/hooks/`, `state/` | interaction layer missing |

Feature state: **none** (greenfield; depends on GraphScene + GraphData)

## Affected Modules
- **GraphInteraction** — create Zustand store, interaction hooks, camera controls, scene state bindings

## Pack blueprint files to create
- [x] `blueprint/plan/modules.md` — GraphInteraction module excerpt
- [x] `blueprint/actions/web/pages/graph-interaction.md` — PG-GRAPHINTERACTION-01 after-state
- [x] `blueprint/_index.md`
- [x] `status.md`

## Expected code files to create (under `src/`)
- `src/features/graph/state/graphStore.ts`
- `src/features/graph/hooks/useGraphInteraction.ts`
- `src/features/graph/hooks/useGraphCamera.ts`
- `src/features/graph/hooks/useGraphAdjacency.ts` (optional helper)
- Updates to GraphScene components for hover/select/dim state bindings
- OrbitControls integration in `GraphCanvas.tsx`

## Risk: complexity H, cross-module Y (Scene + Chrome), migration N

## Recommendation
- **Create**: interaction store, hooks, camera controls, scene state wiring — **Complete**: — — **Modify**: GraphScene components

## Status target (per artifact in the pack after implement)
- PG-GRAPHINTERACTION-01 → done

## Dependencies
- depends-on: change-20260811-132803 — current pack-status of dep: blocked

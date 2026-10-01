# Impact Analysis — GraphChrome (REQ-INIT 5/5)

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | none | — | UI state in graphStore |
| Service(s) | none | — | local store + dataset |
| Endpoint(s) | none | — | no API in MVP |
| Page(s) | none | `src/features/graph/components/`, `src/components/ui/` | chrome overlays missing |

Feature state: **none** (greenfield; depends on GraphInteraction + GraphData)

## Affected Modules
- **GraphChrome** — create header, controls, legend, details panel, search placeholder

## Pack blueprint files to create
- [x] `blueprint/plan/modules.md` — GraphChrome module excerpt
- [x] `blueprint/actions/web/pages/graph-chrome.md` — PG-GRAPHCHROME-01 after-state
- [x] `blueprint/_index.md`
- [x] `status.md`

## Expected code files to create (under `src/`)
- `src/features/graph/components/GraphHeader.tsx`
- `src/features/graph/components/GraphControls.tsx`
- `src/features/graph/components/GraphLegend.tsx`
- `src/features/graph/components/NodeDetailsPanel.tsx`
- `src/features/graph/components/SearchPlaceholder.tsx`
- `src/components/ui/` shared glass/button primitives as needed
- Wire overlays into `src/app/App.tsx`

## Risk: complexity M, cross-module Y (Interaction store + GraphData configs), migration N

## Recommendation
- **Create**: full chrome overlay UI — **Complete**: — — **Modify**: App shell composition

## Status target (per artifact in the pack after implement)
- PG-GRAPHCHROME-01 → done

## Dependencies
- depends-on: change-20260811-132804 — current pack-status of dep: blocked

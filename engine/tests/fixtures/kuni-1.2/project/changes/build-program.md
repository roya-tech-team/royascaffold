# Build Program

- **request-id**: REQ-INIT
- **Source**: Initial Build Phase 2
- **Created**: 2026-08-11
- **Last updated**: 2026-08-11

## Slice rules

- Vertical slice per module (frontend-only MVP — no API services/endpoints)
- Order: Foundation → GraphData → GraphScene → GraphInteraction → GraphChrome
- Shared `request-id: REQ-INIT` across all packs

## Packs (ordered)

| Part | Pack folder | Module / scope | Depends on | Target apps | Pack status | Notes |
|------|-------------|----------------|------------|-------------|-------------|-------|
| 1/5 | `change-20260811-132801-init-foundation/` | Foundation | — | web | merged | Vite/React/TS/Tailwind/R3F shell |
| 2/5 | `change-20260811-132802-init-graph-data/` | GraphData | change-20260811-132801 | web | merged | types, config, mock, generator |
| 3/5 | `change-20260811-132803-init-graph-scene/` | GraphScene | change-20260811-132802 | web | merged | canvas, nodes, edges, labels, FX |
| 4/5 | `change-20260811-132804-init-graph-interaction/` | GraphInteraction | change-20260811-132803 | web | merged | hover/select/focus/camera/store |
| 5/5 | `change-20260811-132805-init-graph-chrome/` | GraphChrome | change-20260811-132804 | web | merged | header, controls, legend, panel, search |

## Progress

| Metric | Value |
|--------|-------|
| Packs total | 5 |
| Merged | 5 |
| In flight | 0 |
| Blocked / drafted | 0 |
| Deferred | 0 |

## Next pack

- **Default**: none — REQ-INIT complete
- **Resume**: further work via `/change-mode`

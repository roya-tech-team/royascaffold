# Pages — Knowledge Universe Web · GraphInteraction

### Graph Interaction Layer `PG-GRAPHINTERACTION-01`

- Route: `/` (behavior layer on Graph Universe Scene)
- Status: done
- Components: interaction hooks (`useGraphInteraction`, `useGraphCamera`), Zustand `graphStore` bindings inside scene
- Service: local adjacency lookups from `GraphDataset` — no HTTP
- Guard: `none`
- Notes: Implements DEFAULT / HOVER / SELECTED / FOCUS / DIMMED. Hover intensifies node + neighborhood; click selects, dims unrelated, drives details panel + optional smooth camera focus. OrbitControls with damping, zoom/pan/rotate, distance limits; subtle toggleable auto-rotate. Cursor feedback on interactive nodes. Loading N/A beyond scene; error = raycast/WebGL edge cases handled silently or with toast.

## Delta

- Create from planned main (`project/actions/web/pages/graph-interaction.md`); no prior implementation exists.

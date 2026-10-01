# Modules & Features (excerpt) — GraphData

## 2. GraphData
- Scope: FE `src/features/graph/types/`, `config/`, `data/`
- Audience: public
- Entities: `GraphNode`, `GraphEdge`, `NodeType`, `EdgeType`, visual configs
- Depends on: `Foundation`

### Features
1. **Graph Domain Types** [frontend] — strict TypeScript models for nodes/edges/enums
2. **Visual Type Config** [frontend] — centralized `nodeTypeConfig` / `edgeTypeConfig` (colors, shapes, sizes, opacities)
3. **Mock Graph Dataset** [frontend] — curated seed entities (AI/tech/knowledge themes) plus generated fill to ≥100 nodes
4. **Cluster Graph Generator** [frontend] — reusable layout/relationship generator producing clusters, hubs, peripherals in 3D

### Notes
- Renderer must never hardcode specific dummy entity IDs/labels

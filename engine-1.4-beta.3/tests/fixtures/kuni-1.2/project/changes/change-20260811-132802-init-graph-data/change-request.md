# Change Request

## Metadata
- **date**: 2026-08-11
- **change-type**: new-module
- **target-app**: web
- **affected-repos**: frontend
- **priority**: high
- **request-id**: REQ-INIT
- **part**: 2/5
- **depends-on**: change-20260811-132801
- **blocks**: change-20260811-132803
- **pack-status**: merged

## Scope
- Module(s): GraphData
- Feature(s): Graph Domain Types, Visual Type Config, Mock Graph Dataset, Cluster Graph Generator
- Endpoint(s): —
- Page(s)/View(s): web: Graph Data Modules (`PG-GRAPHDATA-01`) — client modules, no dedicated UI route
- Service(s): local `graphGenerator` / `mockGraph` → in-memory `GraphDataset`

## Description
Second REQ-INIT pack. Delivers strict TypeScript graph domain models (`GraphNode`, `GraphEdge`, `NodeType`, `EdgeType`), centralized visual configs (`nodeTypeConfig`, `edgeTypeConfig`), a curated seed dataset with generated fill (100–300 nodes, 200–800 edges), and a reusable cluster-aware 3D layout generator producing hubs, clusters, and peripherals. Randomize will rebuild via generator in later packs. Renderer must accept arbitrary `GraphNode`/`GraphEdge` arrays — never hardcode specific dummy entity IDs or labels.

## Acceptance Criteria
1. `GraphNode`, `GraphEdge`, `NodeType`, `EdgeType`, and related types are defined under `src/features/graph/types/` with strict TS.
2. `nodeTypeConfig` and `edgeTypeConfig` centralize colors, shapes, sizes, and opacities per type.
3. Mock dataset delivers ≥100 meaningful nodes and hundreds of edges with visible clusters/hierarchy.
4. `graphGenerator` produces cluster-aware 3D positions and realistic relationship patterns.
5. Exported `GraphDataset` (or equivalent) is consumable by GraphScene without hardcoded entity references.
6. Randomize entry point exists (callable function) to rebuild graph data.

## Notes
- Blocked until Foundation pack (change-20260811-132801) is verified/merged.
- All data is client-only; no backend, persistence, or API.

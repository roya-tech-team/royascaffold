# Pages — Knowledge Universe Web · GraphData

### Graph Data Modules `PG-GRAPHDATA-01`

- Route: `(no dedicated UI route — client modules consumed by GraphScene)`
- Status: done
- Components: N/A (types, config, `mockGraph`, `graphGenerator`)
- Service: local `graphGenerator` / `mockGraph` modules → in-memory `GraphDataset` (no `EP-*`)
- Guard: `none`
- Notes: Delivers strict graph types, centralized visual configs, seed+generated dummy dataset (100–300 nodes, 200–800 edges), and cluster-aware 3D layout generation. Randomize rebuilds via generator. Renderer must accept arbitrary `GraphNode`/`GraphEdge` arrays.

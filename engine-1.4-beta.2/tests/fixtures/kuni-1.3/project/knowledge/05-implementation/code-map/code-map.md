---
document_id: DOC-KUNI-CODEMAP
title: Knowledge Universe code map
layer: implementation
schema_version: 1
document_status: approved
owners: [knowledge-universe-team]
---

# Code map

First-slice source ownership. Every file under `src` with a profile extension must appear here.

| Path | Kind | Blueprint owner | Relationship | Runtime | Status | Notes |
|------|------|-----------------|--------------|---------|--------|-------|
| `src/main.tsx` | entry | `CMP-KUNI-APP` | implements | yes | implemented | bootstrap |
| `src/vite-env.d.ts` | types | `CMP-KUNI-APP` | supports | no | implemented | Vite types |
| `src/app/App.tsx` | shell | `CMP-KUNI-APP` | implements | yes | implemented | canvas plus chrome |
| `src/features/graph/types/graph.types.ts` | types | `CMP-KUNI-GENERATOR` | defines | no | implemented | generic graph objects |
| `src/features/graph/config/visualConfig.ts` | config | `CMP-KUNI-CONFIG` | configures | no | implemented | camera and atmosphere |
| `src/features/graph/config/nodeTypeConfig.ts` | config | `CMP-KUNI-CONFIG` | configures | no | implemented | node visual language |
| `src/features/graph/config/edgeTypeConfig.ts` | config | `CMP-KUNI-CONFIG` | configures | no | implemented | edge visual language |
| `src/features/graph/data/graphGenerator.ts` | policy | `CMP-KUNI-GENERATOR` | implements | yes | implemented | clustered dummy graphs |
| `src/features/graph/data/mockGraph.ts` | data | `CMP-KUNI-GENERATOR` | supports | yes | implemented | default instance |
| `src/features/graph/state/graphStore.ts` | state | `CMP-KUNI-STORE` | implements | yes | implemented | data and UI stores |
| `src/features/graph/hooks/useGraphInteraction.ts` | hook | `CMP-KUNI-STORE` | supports | yes | implemented | hover and select |
| `src/features/graph/hooks/useGraphCamera.ts` | hook | `CMP-KUNI-CANVAS` | supports | yes | implemented | orbit, reset, focus |
| `src/features/graph/components/GraphCanvas.tsx` | view | `CMP-KUNI-CANVAS` | implements | yes | implemented | R3F host |
| `src/features/graph/components/GraphScene.tsx` | view | `CMP-KUNI-CANVAS` | supports | yes | implemented | lights and children |
| `src/features/graph/components/GraphNodes.tsx` | view | `CMP-KUNI-NODES` | implements | yes | implemented | instanced nodes |
| `src/features/graph/components/GraphEdges.tsx` | view | `CMP-KUNI-EDGES` | implements | yes | implemented | buffer edges |
| `src/features/graph/components/GraphLabels.tsx` | view | `CMP-KUNI-LABELS` | implements | yes | implemented | HTML labels |
| `src/features/graph/components/GraphControls.tsx` | view | `CMP-KUNI-HUD` | implements | yes | implemented | view buttons |
| `src/features/graph/components/GraphLegend.tsx` | view | `CMP-KUNI-HUD` | implements | yes | implemented | type legend |
| `src/features/graph/components/NodeDetailsPanel.tsx` | view | `CMP-KUNI-DETAILS` | implements | yes | implemented | glass panel |
| `src/features/graph/components/SearchPlaceholder.tsx` | view | `CMP-KUNI-HUD` | implements | yes | implemented | inert search |
| `src/features/graph/components/AmbientSpace.tsx` | view | `CMP-KUNI-CANVAS` | supports | yes | implemented | stars and particles |
| `src/components/layout/OverlayChrome.tsx` | view | `CMP-KUNI-HUD` | implements | yes | implemented | HUD layout |
| `src/lib/three/graphMaterials.ts` | helper | `CMP-KUNI-CONFIG` | supports | yes | implemented | shared materials |
| `src/features/graph/analysis/graphAlgorithms.ts` | policy | `CMP-KUNI-ALGO` | implements | yes | implemented | path and influence |
| `src/features/graph/config/timelineConfig.ts` | config | `CMP-KUNI-CONFIG` | configures | no | implemented | year span |
| `src/features/graph/components/ExploreModes.tsx` | view | `CMP-KUNI-HUD` | implements | yes | implemented | inspect path influence |
| `src/features/graph/components/EdgeTypeFilter.tsx` | view | `CMP-KUNI-SEMANTIC` | implements | yes | implemented | relationship chips |
| `src/features/graph/components/GraphTimeline.tsx` | view | `CMP-KUNI-TIMELINE` | implements | yes | implemented | year playhead |
| `src/features/graph/components/SemanticPathPanel.tsx` | view | `CMP-KUNI-SEMANTIC` | implements | yes | implemented | hop chain |
| `src/features/graph/components/GraphEdgeLabels.tsx` | view | `CMP-KUNI-SEMANTIC` | implements | yes | implemented | type labels on edges |

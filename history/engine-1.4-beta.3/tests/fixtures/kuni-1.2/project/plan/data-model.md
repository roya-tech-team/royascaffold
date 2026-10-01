# Data Model

MVP persistence: **none**. Entities are in-memory TypeScript structures loaded/generated on the client. IDs are string UUIDs or stable string keys. No Mongo/SQL tables.

## Enums

### NodeType
`person` | `organization` | `concept` | `technology` | `place` | `event` | `document`

### EdgeType
`related_to` | `depends_on` | `created_by` | `located_in` | `part_of` | `influences` | `works_at` | `studied_at`

## 1. GraphNode
Purpose: a knowledge entity in the 3D graph

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `id` | String | required, unique | — |
| `label` | String | required | — |
| `type` | Enum `NodeType` | required | — |
| `description` | String | optional | — |
| `importance` | Number | required, 0–1 (or 0–100 normalized in config) | — |
| `position` | `[number, number, number]` | optional until layout/generator assigns | — |

Relations: one node → many edges as source or target  
Indexes (logical): unique `id`; index `type`; sort/filter by `importance`

## 2. GraphEdge
Purpose: a directed or undirected relationship between two nodes (MVP treats as undirected for highlight/degree unless type implies direction)

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `id` | String | required, unique | — |
| `source` | String | required | → `GraphNode.id` |
| `target` | String | required | → `GraphNode.id` |
| `type` | Enum `EdgeType` | required | — |
| `strength` | Number | optional, 0–1 | — |

Relations: edge references two nodes  
Indexes (logical): unique `id`; index `source`; index `target`; composite (`source`,`target`)

## 3. GraphDataset
Purpose: the full client-side graph payload produced by mock/generator modules

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `nodes` | `GraphNode[]` | required, length 100–300 for MVP | — |
| `edges` | `GraphEdge[]` | required, length 200–800 for MVP | — |
| `seed` | Number \| String | optional; used by Randomize | — |

Relations: contains nodes + edges  
Validation: every edge `source`/`target` must resolve to a node id; no self-loops preferred

## 4. GraphUiState
Purpose: transient interaction/UI flags (Zustand) — not persisted

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `selectedNodeId` | String \| null | optional | → `GraphNode.id` |
| `hoveredNodeId` | String \| null | optional | → `GraphNode.id` |
| `focusedNodeId` | String \| null | optional | → `GraphNode.id` |
| `showLabels` | Boolean | default true (selective labels still apply) | — |
| `autoRotate` | Boolean | default false or subtle-on per UX choice documented in pack | — |

Relations: references node ids only; never stores Three.js objects

## 5. NodeTypeVisualConfig
Purpose: centralized visual language per `NodeType`

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `type` | Enum `NodeType` | required, unique | — |
| `color` | String | required (CSS/hex) | — |
| `emissive` | String | required | — |
| `baseSize` | Number | required | — |
| `shape` | String | required (`sphere` \| `octahedron` \| `ringSphere` etc.) | — |
| `hasRing` | Boolean | default false | — |
| `labelPriority` | Number | required | — |

## 6. EdgeTypeVisualConfig
Purpose: centralized visual language per `EdgeType`

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `type` | Enum `EdgeType` | required, unique | — |
| `color` | String | required | — |
| `opacity` | Number | required, 0–1 | — |
| `width` | Number | required (thin) | — |

## Validation Rules
1. `importance` clamped to configured range.
2. Edge endpoints must exist in the dataset.
3. Generator must produce multiple clusters and varying degree distributions (hubs vs peripherals).
4. Visual configs must cover all enum values used in data.

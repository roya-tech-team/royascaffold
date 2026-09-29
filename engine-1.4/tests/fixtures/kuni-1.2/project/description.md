# Product Description

## 1. Product Summary
- **Name**: Knowledge Universe
- **Type**: tool (interactive 3D knowledge/network visualization)
- **Audience**: Product designers, knowledge workers, and engineers evaluating a premium 3D graph experience; future users of a broader knowledge-graph product

**Purpose (MVP milestone):** Deliver a beautiful, high-performance, generic 3D network visualization with realistic dummy data so visual quality and interaction can be evaluated before any real data platform, search, AI, or persistence work.

**Visual reference:** `docs/reference/3d-network-reference.png` — inspiration for density, dark environment, relationships, and spatial feel. Do **not** reproduce literally; target substantially more polished, cinematic results.

## 2. Core Workflow
1. User opens the app and lands immediately on a full-screen 3D knowledge/network graph.
2. User explores via orbit / zoom / pan; optionally enables subtle auto-rotate.
3. User hovers a node → intensity, scale, connected edges/neighbors, and label emphasize.
4. User clicks a node → neighborhood highlight, unrelated graph dims, glass details panel appears; optional camera focus.
5. User uses chrome controls (Reset View, Randomize, Toggle Labels, Toggle Auto Rotate) and sees a search placeholder (non-functional in MVP).

## 3. Core Features

### Graph Visualization
- Full-screen React Three Fiber scene with 100–300 nodes and 200–800 edges
- Clustered 3D layout (central, secondary, peripheral nodes; multiple separated clusters)
- Category-differentiated nodes (color/shape/size via centralized config)
- Thin glowing edges with relationship-type styling
- Floating labels for important / hovered / selected / near-camera nodes
- Ambient particles, subtle fog, careful bloom; deep navy / near-black radial background
- Premium futuristic aesthetic (not an engineering demo)

### Graph Interaction
- Hover, select, focus-camera, and dimmed unrelated states with smooth transitions
- Cursor feedback; neighborhood emphasis on hover/select
- Glassmorphism node details panel (name, type, description, connection count)

### Graph Chrome UI
- Top-left product title/subtitle
- Top-right controls: Reset View, Randomize, Toggle Labels, Toggle Auto Rotate
- Bottom-left node-type legend
- Centered/top search placeholder (“Search knowledge…”) — visual only, architecture-ready
- Minimal UI; graph dominates the viewport

### Graph Data (client-only)
- Generic `GraphNode` / `GraphEdge` model and enums (`NodeType`, `EdgeType`)
- Dedicated mock-data + graph-generation modules (clusters, realistic relationship patterns)
- Renderer works with arbitrary graph objects — never hardcoded to specific dummy entities

## 4. Key Entities
- **GraphNode**: id, label, type, description?, importance, position?
- **GraphEdge**: id, source, target, type, strength?
- **NodeType**: person, organization, concept, technology, place, event, document
- **EdgeType**: related_to, depends_on, created_by, located_in, part_of, influences, works_at, studied_at
- **GraphUiState** (transient): selectedNodeId, hoveredNodeId, showLabels, autoRotate, focusedNodeId
- **NodeTypeVisualConfig** / **EdgeTypeVisualConfig**: centralized visual language

## 5. User Roles
- **Explorer (anonymous)**: can explore the graph, hover/select nodes, use chrome controls; cannot authenticate, persist, or search real knowledge (out of scope for MVP)

## 6. Integrations
- N/A for MVP — all data is local dummy/generated data. No backend, AI, database, or third-party APIs.

## 7. Tech & Constraints
- **Backend**: N/A (MVP is frontend-only)
- **Frontend**: React + TypeScript (strict) + Vite + Three.js + React Three Fiber + @react-three/drei + Zustand + Tailwind CSS + Framer Motion
- **DB**: N/A (in-memory mock graph)
- **i18n**: English only for MVP
- **Constraints**:
  - Do not use Angular or Vue
  - Do not overengineer; no auth, API, persistence, AI, RAG, Neo4j, Elasticsearch, collaboration
  - Design rendering for future scale (instancing / buffer geometries / avoid per-element React overhead) even though MVP is ~100–300 nodes
  - Desktop-first; tablet OK; mobile basic
  - Visual quality is the success bar for this milestone

## 8. Business Rules
1. App opens directly into the full-screen graph — no login or marketing landing page.
2. Graph rendering must be data-driven from `GraphNode` / `GraphEdge` arrays.
3. Visual identity for node/edge types comes only from centralized config modules.
4. Labels are selective (importance / hover / select / proximity) — not all nodes labeled by default.
5. Unrelated nodes/edges dim on selection; they do not hard-disappear.
6. Auto-rotate must be subtle and user-toggleable; never annoying.
7. Post-processing (bloom, etc.) must stay restrained so the graph remains readable.
8. Search bar is a polished placeholder only — no real search in MVP.

## 9. Out of Scope (MVP)
- Authentication, accounts, permissions
- Backend, database, API, persistence
- Real knowledge ingestion, AI, RAG, semantic search
- Neo4j / Elasticsearch / realtime sync / collaboration
- Advanced analytics, timelines, production clustering algorithms beyond visual layout
- Full mobile polish

## 10. Success Criteria
1. App launches with a full-screen 3D network visible immediately.
2. ≥100 meaningful dummy nodes and hundreds of connections with visible clusters/hierarchy.
3. Distinct node visual identities; subtle readable edges; sense of depth.
4. Smooth camera; beautiful hover; select highlights neighborhood + details panel.
5. Labels readable when shown; Reset View / Toggle Labels / Randomize / Auto Rotate work.
6. Good performance for MVP scale; code clean and extensible.
7. Feels like the start of a real product, not a Three.js demo.

## 11. Notes
- Path B description completed from the user’s full MVP prompt (2026-08-11).
- Future phases (post-MVP) may add real entities, search, AI connections, persistence, and auth via Change Mode — not this initial build’s first packs unless explicitly scoped later.

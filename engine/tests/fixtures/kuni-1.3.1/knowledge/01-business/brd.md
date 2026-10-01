---
document_id: DOC-KUNI-BRD
title: Knowledge Universe business brief
layer: business
schema_version: 2
document_status: in-review
owners: [product-owner]
---

# Business brief

## Problem and opportunity

Knowledge networks are usually shown as flat diagrams or engineering demos. The stakeholder wants to evaluate whether a cinematic, interactive 3D network can feel like a premium product before any real knowledge platform is built.

Visual reference (inspiration, not a literal target): `docs/reference/3d-network-reference.png`.

## Target users and stakeholders

- **Explorer:** evaluates spatial structure, visual quality, and interaction feel.
- **Product stakeholder:** decides whether to invest in a later real-data layer.

## Primary journey and first-view focus

The application opens directly into a full-screen 3D graph. The graph is the product. Chrome is subordinate. The explorer orbits, hovers, selects, reads a small glass panel, and uses a few view controls.

## Sources

- Stakeholder brief dated 20 August 2026, including the first-milestone prompt and visual reference.
- Confirmed stack choice: React, TypeScript, Vite, Three.js, React Three Fiber, Drei, Zustand, Tailwind CSS, Framer Motion.
- Stakeholder permission dated 20 August 2026 to apply recommendations for any unanswered question.

## Assumptions

See `ASM-KUNI-001` through `ASM-KUNI-006` on `CHG-KUNI-001`.

## Constraints

- Do not build the future product in this slice.
- Do not use Angular or Vue.
- Do not introduce unnecessary frameworks.
- Desktop is the priority. Mobile may be basic.
- Avoid excessive neon, bloom, labels, thick edges, and dashboard chrome.
- The renderer must not be hard-coded to specific dummy names.

## Scope

**In scope:** a generic 3D knowledge/network visualization with realistic local dummy data, clustered layout, typed nodes and edges, hover and selection, a glass details panel, selective labels, minimal HUD, and a non-functional search placeholder.

**Out of scope:** authentication, backend, database, API, AI, RAG, real knowledge ingestion, accounts, permissions, collaboration, persistence, Elasticsearch, Neo4j, realtime sync, advanced search, analytics, and any later semantic, timeline, or algorithm product layer.

## Content and data policy

- Graph content is generated locally from a dedicated dummy module.
- Dummy entities may use well-known public knowledge-topic names as fictional seeds.
- No personal data is collected. No live APIs are called.
- Dummy names are data, not product copy that the renderer branches on.

## Glossary

- **Node:** a knowledge entity in the graph.
- **Edge:** a typed relationship between two nodes.
- **Importance:** a 0–1 signal used for size, emphasis, and default labels. See `ASM-KUNI-002`.
- **Neighborhood:** a selected or hovered node plus its directly connected nodes and edges.
- **Dummy graph:** generated local data used only to evaluate visualization.
- **Chrome:** the thin HUD around the canvas (title, controls, legend, search placeholder, details panel).

## Priority and roadmap

1. Cinematic readable graph
2. Alive interaction (camera, hover, select)
3. Meaningful dummy structure
4. Interactive performance of the first graph
5. Minimal chrome
6. Extensible local structure without building the future product
7. Search placeholder only

Later phases, if the visual result is accepted, may add real entities, search, semantic relationships, AI connections, timelines, and clustering. They are not this milestone.

### OUT-KUNI-001 · Evaluate a product-grade 3D knowledge universe

- **Kind:** outcome
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** visual quality and interaction must be proven before real data or platform features are funded.
- **Measure:** an explorer can launch the app and immediately explore a clustered 3D network that feels like the start of a commercial product rather than a rendering demo.
- **Satisfies:** `CAP-KUNI-001`, `CAP-KUNI-002`, `CAP-KUNI-003`, `CAP-KUNI-004`

### CAP-KUNI-001 · Explore the 3D network

- **Kind:** capability
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** the graph is the product of this milestone.
- **Supports:** `OUT-KUNI-001`

### CAP-KUNI-002 · Inspect a node

- **Kind:** capability
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** selection must reveal meaning without leaving the universe.
- **Supports:** `OUT-KUNI-001`

### CAP-KUNI-003 · Control the view

- **Kind:** capability
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** explorers need reset, label, motion, and layout controls without an admin dashboard.
- **Supports:** `OUT-KUNI-001`

### CAP-KUNI-004 · Read the visual language

- **Kind:** capability
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** categories must be distinguishable and explained by a small legend.
- **Supports:** `OUT-KUNI-001`

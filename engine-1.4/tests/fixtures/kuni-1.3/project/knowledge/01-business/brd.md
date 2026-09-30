---
document_id: DOC-KUNI-BRD
title: Knowledge Universe business brief
layer: business
schema_version: 1
document_status: approved
owners: [product-owner]
---

# Business brief

## Problem and opportunity

Knowledge networks are usually shown as flat diagrams or engineering demos. The stakeholder wants to evaluate whether a cinematic, interactive 3D network can feel like a premium product before any real knowledge platform is built.

Visual reference (inspiration, not a literal target): `docs/reference/3d-network-reference.png`.

## Target users

- Explorer evaluating spatial structure, visual quality, and interaction feel.
- Product stakeholder deciding whether to invest in a later real-data layer.

## Sources

- Stakeholder brief dated 20 August 2026, including the first-milestone prompt and visual reference.
- Confirmed stack choice: React, TypeScript, Vite, Three.js, React Three Fiber, Drei, Zustand, Tailwind CSS, Framer Motion.

## Assumptions

- First milestone uses only local dummy data.
- The renderer must not be hard-coded to specific dummy names.
- Search execution, AI, persistence, and identity remain out of scope until a later change.
- Graph algorithms, semantic links, and timelines are now in scope as a second local slice. See `OUT-KUNI-002`.
- Frame-rate is not numerically specified; see `FND-KUNI-001`.
- Randomize means a new dummy graph instance; see `FND-KUNI-002`.

## Constraints

- Do not build the future product in this slice.
- Do not use Angular or Vue.
- Do not introduce unnecessary frameworks.
- Desktop is the priority. Mobile may be basic.
- Avoid excessive neon, bloom, labels, thick edges, and dashboard chrome.

## Scope

In scope: the first visual universe plus local graph algorithms, visible semantic relationships, and a year timeline. Dummy data only.

Out of scope: authentication, backend, database, API, AI, RAG, real knowledge ingestion, accounts, permissions, collaboration, persistence, search engines, graph databases, realtime sync, advanced search, and analytics.

## Glossary

- **Node:** a knowledge entity in the graph.
- **Edge:** a typed relationship between two nodes.
- **Importance:** a 0–1 signal used for size, emphasis, and default labels.
- **Neighborhood:** a selected or hovered node plus its directly connected nodes and edges.
- **Dummy graph:** generated local data used only to evaluate visualization.

### OUT-KUNI-001 · Evaluate a product-grade 3D knowledge universe

- **Kind:** outcome
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** visual quality and interaction must be proven before real data or platform features are funded.
- **Measure:** an explorer can launch the app and immediately explore a clustered 3D network that feels like the start of a commercial product rather than a rendering demo.
- **Satisfies:** `CAP-KUNI-001`, `CAP-KUNI-002`, `CAP-KUNI-003`, `CAP-KUNI-004`

### CAP-KUNI-001 · Explore the 3D network

- **Kind:** capability
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** the graph is the product of this milestone.
- **Supports:** `OUT-KUNI-001`

### CAP-KUNI-002 · Inspect a node

- **Kind:** capability
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** selection must reveal meaning without leaving the universe.
- **Supports:** `OUT-KUNI-001`

### CAP-KUNI-003 · Control the view

- **Kind:** capability
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** explorers need reset, label, motion, and layout controls without an admin dashboard.
- **Supports:** `OUT-KUNI-001`

### CAP-KUNI-004 · Read the visual language

- **Kind:** capability
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** categories must be distinguishable and explained by a small legend.
- **Supports:** `OUT-KUNI-001`

### FND-KUNI-001 · Frame-rate target is unspecified

- **Kind:** finding
- **Knowledge status:** draft
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Source:** gap in stakeholder-brief-2026-08-20
- **Rationale:** "good performance" is required but no numeric frame-rate was given.
- **Working interpretation:** the first-milestone graph stays interactive on a typical desktop GPU, with a verification floor of 30 frames per second while orbiting. This number is an assumption, not a stakeholder measurement.

### FND-KUNI-002 · Randomize semantics

- **Kind:** finding
- **Knowledge status:** draft
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Source:** gap in stakeholder-brief-2026-08-20
- **Rationale:** Randomize was requested without saying whether topology, positions, or both change.
- **Working interpretation:** Randomize creates a new dummy graph instance with a new seed, including new positions and a valid clustered relationship pattern.

### FND-KUNI-003 · Mobile depth is unspecified

- **Kind:** finding
- **Knowledge status:** draft
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** mobile "can be basic" is not a detailed experience.
- **Working interpretation:** the canvas remains usable with touch orbit; chrome may stack; desktop remains the acceptance target.

### OUT-KUNI-002 · Reveal structure, meaning, and time

- **Kind:** outcome
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-request-2026-08-20
- **Rationale:** after the universe looks like a product, the explorer needs to ask why nodes connect and when they appear.
- **Measure:** an explorer can trace a shortest path, read relationship meaning, rank influence, and scrub a year timeline without leaving the canvas.
- **Satisfies:** `CAP-KUNI-005`, `CAP-KUNI-006`, `CAP-KUNI-007`

### CAP-KUNI-005 · Trace structure with algorithms

- **Kind:** capability
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-request-2026-08-20
- **Rationale:** shortest path and influence make the network readable as structure, not only as scenery.
- **Supports:** `OUT-KUNI-002`

### CAP-KUNI-006 · Read semantic links

- **Kind:** capability
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-request-2026-08-20
- **Rationale:** relationship types already exist in data; they must become visible and filterable.
- **Supports:** `OUT-KUNI-002`

### CAP-KUNI-007 · Travel the timeline

- **Kind:** capability
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-request-2026-08-20
- **Rationale:** events and documents need a temporal reading without a separate admin screen.
- **Supports:** `OUT-KUNI-002`

### FND-KUNI-004 · Algorithm set was not specified

- **Kind:** finding
- **Knowledge status:** draft
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Source:** gap in stakeholder-request-2026-08-20
- **Working interpretation:** ship two local algorithms: unweighted shortest path between two nodes, and a PageRank-style influence score. No remote graph database.

### FND-KUNI-005 · Timeline grain was not specified

- **Kind:** finding
- **Knowledge status:** draft
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Source:** gap in stakeholder-request-2026-08-20
- **Working interpretation:** year is the grain. Nodes have a year. A playhead shows entities that have appeared by that year. Future nodes dim rather than vanish.

# Generated Context Pack

> Generated view. Do not edit or treat as canonical.

- Manifest: `CTX-KUNI-TASK-002`
- Role: implementer
- Project hash: `3faa3fc40148320f9e4a5de1120ad3f244c9037c4be58d89da576657b93ca3bb`
- Root IDs: `TASK-KUNI-002`
- Included IDs: `TASK-KUNI-002`, `CON-KUNI-NODE`, `CON-KUNI-EDGE`, `CMP-KUNI-GENERATOR`, `CMP-KUNI-CONFIG`, `CMP-KUNI-STORE`, `REQ-KUNI-002`, `REQ-KUNI-005`, `INV-KUNI-001`, `INV-KUNI-005`
- Overflow policy: fail-and-split

## Document · knowledge/04-design/data/graph-model.md

# In-memory graph

There is no database. The conceptual model is realized as local objects generated at runtime.

## Ownership

`CMP-KUNI-GENERATOR` owns creation of a graph instance. `CMP-KUNI-STORE` owns which instance is current and the explorer's attention flags. Renderers never own source data.

## Node object

| Field | Meaning |
|-------|---------|
| id | stable string in the current instance |
| label | display name |
| type | one of the seven node types |
| description | short explainer |
| importance | number from 0 to 1 |
| position | three-number location after layout |

## Edge object

| Field | Meaning |
|-------|---------|
| id | stable string in the current instance |
| source | node id |
| target | node id |
| type | one of the eight relationship types |
| strength | optional 0–1 weight |

## Generation rules

- Seeded generator so Randomize is a new seed, not hand-edited names.
- Several topical clusters in separated 3D regions.
- Hubs receive more edges than peripherals.
- A minority of edges bridge clusters.
- Output always satisfies 100–300 nodes and 200–800 edges.
- Seed topics may include well-known technology concepts; additional nodes are invented satellites.
- No retention, deletion policy, or migration. Refreshing the page or pressing Randomize replaces the instance.

## Classification

Dummy public-looking names only. No personal data collection.

## Mapping

- `CON-KUNI-NODE`, `CON-KUNI-EDGE`, `CON-KUNI-CLUSTER`, `CON-KUNI-IMPORTANCE`
- Invariants `INV-KUNI-001` and `INV-KUNI-004`
## Artifact · TASK-KUNI-002

_Source: `changes/active/CHG-KUNI-001/execution-plan.md:34`_

### TASK-KUNI-002 · Create generic graph data

- **Kind:** task
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Goal:** types, centralized visual config, and a clustered dummy generator.
- **Preconditions:** `TASK-KUNI-001`
- **Input IDs:** `CON-KUNI-NODE`, `CON-KUNI-EDGE`, `CMP-KUNI-GENERATOR`, `CMP-KUNI-CONFIG`, `REQ-KUNI-002`, `REQ-KUNI-005`, `INV-KUNI-001`, `INV-KUNI-005`
- **Allowed paths:** `src/features/graph/types/`, `src/features/graph/config/`, `src/features/graph/data/`, `src/features/graph/state/graphStore.ts`
- **Forbidden:** hard-coded renderer branches on dummy names; remote data
- **Steps:** define types; write node and edge configs; generate 100–300 nodes and 200–800 edges with clusters; expose regenerate.
- **Outputs:** a default graph instance and a Randomize entry point
- **Checks:** counts and type coverage meet `TEST-KUNI-002`
- **Done:** generator is reusable and configuration is centralized
- **Handoff:** `TASK-KUNI-003`
## Artifact · CON-KUNI-NODE

_Source: `knowledge/03-domain/domain.md:32`_

### CON-KUNI-NODE · Graph node

- **Kind:** concept
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** product-owner
- **Meaning:** an identifiable knowledge entity with a label, type, optional description, importance, and an optional position in the universe.
- **Supports:** `REQ-KUNI-002`, `REQ-KUNI-017`
## Artifact · CON-KUNI-EDGE

_Source: `knowledge/03-domain/domain.md:41`_

### CON-KUNI-EDGE · Graph edge

- **Kind:** concept
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** product-owner
- **Meaning:** a directed or undirected typed link between two node identities, with an optional strength.
- **Supports:** `REQ-KUNI-004`
## Artifact · CMP-KUNI-GENERATOR

_Source: `knowledge/05-implementation/components/components.md:98`_

### CMP-KUNI-GENERATOR · Dummy graph generator

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** create clustered dummy graphs that satisfy count, hierarchy, and relationship pattern rules.
- **Implements:** `REQ-KUNI-002`, `REQ-KUNI-005`, `REQ-KUNI-017`
- **Constrained by:** `INV-KUNI-001`, `INV-KUNI-004`
## Artifact · CMP-KUNI-CONFIG

_Source: `knowledge/05-implementation/components/components.md:108`_

### CMP-KUNI-CONFIG · Visual configuration

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** centralized node type, edge type, camera, and atmosphere constants.
- **Implements:** `REQ-KUNI-003`
- **Constrained by:** `INV-KUNI-005`
## Artifact · CMP-KUNI-STORE

_Source: `knowledge/05-implementation/components/components.md:88`_

### CMP-KUNI-STORE · Graph and view state

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** current graph instance plus hovered, selected, label visibility, auto-rotate, and focus intent. Must not store the rendering scene.
- **Implements:** `REQ-KUNI-008`, `REQ-KUNI-013`
- **Constrained by:** `ADR-KUNI-002`
## Artifact · REQ-KUNI-002

_Source: `knowledge/02-requirements/requirements.md:80`_

### REQ-KUNI-002 · Show a meaningful dummy network

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** visual evaluation needs realistic density, not a handful of sample nodes.
- **Statement:** the first view contains at least 100 meaningful dummy nodes and hundreds of relationships, with multiple categories and varying node sizes.
- **Acceptance:**
  - Node count is between 100 and 300 inclusive.
  - Edge count is between 200 and 800 inclusive.
  - At least five node types are present.
  - Node sizes vary with importance or centrality.
  - Dummy entities include recognizable knowledge topics and invented satellites generated by a dedicated data module.
- **Satisfies:** `CAP-KUNI-001`
- **Constrained by:** `INV-KUNI-001`, `INV-KUNI-004`
- **Verified by:** `TEST-KUNI-002`
## Artifact · REQ-KUNI-005

_Source: `knowledge/02-requirements/requirements.md:137`_

### REQ-KUNI-005 · Distribute nodes as a clustered network

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** uniform random scatter does not resemble a knowledge network.
- **Statement:** nodes occupy 3D space with clusters, hubs, secondary nodes, and peripherals, plus realistic relationship patterns.
- **Acceptance:**
  - Multiple clusters are visibly separated in 3D.
  - Central nodes have more connections than peripherals.
  - Density varies rather than looking uniformly random.
- **Satisfies:** `CAP-KUNI-001`
- **Verified by:** `TEST-KUNI-002`
## Artifact · INV-KUNI-001

_Source: `knowledge/03-domain/domain.md:96`_

### INV-KUNI-001 · Renderer stays generic

- **Kind:** invariant
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** product-owner
- **Rule:** presentation consumes arbitrary node and edge objects. Dummy names are data, never rendering branches.
- **Supports:** `REQ-KUNI-017`
- **Verified by:** `TEST-KUNI-002`
## Artifact · INV-KUNI-005

_Source: `knowledge/03-domain/domain.md:137`_

### INV-KUNI-005 · Visual language is centralized

- **Kind:** invariant
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** product-owner
- **Rule:** type colors, shapes, and default sizes come from one configuration, not from scattered renderer literals.
- **Supports:** `REQ-KUNI-003`
- **Verified by:** `TEST-KUNI-005`

## Manifest source

`contexts/manifests/CTX-KUNI-TASK-002.md`

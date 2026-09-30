---
document_id: DOC-KUNI-DOMAIN
title: Knowledge Universe domain model
layer: domain
schema_version: 1
document_status: approved
owners: [product-owner]
---

# Domain model

Conceptual meaning only. Persistence and framework types are not part of this model.

## Ubiquitous language

- A **graph** is a set of nodes and edges shown as a universe.
- A **node** is a knowledge entity with a type and an importance.
- An **edge** is a typed relationship from a source node to a target node.
- A **cluster** is a spatial and topical grouping, not a stored tenant.
- A **neighborhood** is a node plus its directly connected nodes and edges.
- **Importance** is a 0–1 value that affects size, default labels, and emphasis.
- The **explorer** is the person viewing the universe.

## Node types

Person, organization, concept, technology, place, event, document.

## Edge types

Related to, depends on, created by, located in, part of, influences, works at, studied at.

### CON-KUNI-NODE · Graph node

- **Kind:** concept
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Meaning:** an identifiable knowledge entity with a label, type, optional description, importance, and an optional position in the universe.
- **Supports:** `REQ-KUNI-002`, `REQ-KUNI-017`

### CON-KUNI-EDGE · Graph edge

- **Kind:** concept
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Meaning:** a directed or undirected typed link between two node identities, with an optional strength.
- **Supports:** `REQ-KUNI-004`

### CON-KUNI-TYPE · Category identity

- **Kind:** concept
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Meaning:** a closed set of node or edge categories that carry a shared visual language.
- **Supports:** `REQ-KUNI-003`

### CON-KUNI-IMPORTANCE · Importance

- **Kind:** concept
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Meaning:** a 0–1 ranking used for size, default labels, and which nodes read as hubs.
- **Supports:** `REQ-KUNI-010`
- **Constrained by:** `INV-KUNI-002`

### CON-KUNI-CLUSTER · Cluster

- **Kind:** concept
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Meaning:** a topical grouping placed around a region of 3D space with hubs, secondary members, and peripherals.
- **Supports:** `REQ-KUNI-005`

### CON-KUNI-NEIGHBOR · Neighborhood

- **Kind:** concept
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Meaning:** a focus node plus nodes and edges one step away.
- **Supports:** `REQ-KUNI-007`, `REQ-KUNI-008`

### CON-KUNI-VIEW · View state

- **Kind:** concept
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Meaning:** the presentation mode of the universe: default, hover, selected, focused, and dimmed.
- **Supports:** `WF-KUNI-EXPLORE`, `WF-KUNI-INSPECT`

### INV-KUNI-001 · Renderer stays generic

- **Kind:** invariant
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Rule:** presentation consumes arbitrary node and edge objects. Dummy names are data, never rendering branches.
- **Supports:** `REQ-KUNI-017`
- **Verified by:** `TEST-KUNI-002`

### INV-KUNI-002 · Labels follow importance and attention

- **Kind:** invariant
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Rule:** default labels are reserved for important or nearby nodes. Attention (hover or selection) always earns a label.
- **Supports:** `REQ-KUNI-010`
- **Verified by:** `TEST-KUNI-004`

### INV-KUNI-003 · Unrelated elements dim rather than vanish

- **Kind:** invariant
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Rule:** hover and selection emphasize a neighborhood by dimming the rest. The rest remains present.
- **Supports:** `REQ-KUNI-007`, `REQ-KUNI-008`
- **Verified by:** `TEST-KUNI-003`

### INV-KUNI-004 · First slice stays local and dummy

- **Kind:** invariant
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Rule:** this milestone uses only generated local data. No identity, persistence, or remote knowledge source.
- **Supports:** `REQ-KUNI-015`
- **Constrained by:** `NFR-KUNI-006`
- **Verified by:** `TEST-KUNI-005`

### INV-KUNI-005 · Visual language is centralized

- **Kind:** invariant
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Rule:** type colors, shapes, and default sizes come from one configuration, not from scattered renderer literals.
- **Supports:** `REQ-KUNI-003`
- **Verified by:** `TEST-KUNI-005`

### CON-KUNI-PATH · Shortest path

- **Kind:** concept
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Meaning:** an unweighted walk of fewest hops between two node identities.
- **Supports:** `REQ-KUNI-019`

### CON-KUNI-INFLUENCE · Influence score

- **Kind:** concept
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Meaning:** a local 0–1 ranking derived from the current graph, used to emphasize structurally central nodes.
- **Supports:** `REQ-KUNI-020`

### CON-KUNI-SEMANTIC · Semantic link

- **Kind:** concept
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Meaning:** an edge whose type is part of the explorer-facing language, not only a draw color.
- **Supports:** `REQ-KUNI-021`, `REQ-KUNI-022`

### CON-KUNI-YEAR · Appearance year

- **Kind:** concept
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Meaning:** the year a dummy entity is treated as having entered the universe.
- **Supports:** `REQ-KUNI-023`

### INV-KUNI-006 · Algorithms stay local and generic

- **Kind:** invariant
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Rule:** path and influence run on the current in-memory graph. They do not call a server or branch on dummy labels.
- **Supports:** `REQ-KUNI-019`
- **Constrained by:** `INV-KUNI-001`, `INV-KUNI-004`
- **Verified by:** `TEST-KUNI-006`

### INV-KUNI-007 · Time dims the future

- **Kind:** invariant
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Rule:** a playhead earlier than a node's year dims that node. It does not delete the graph.
- **Supports:** `REQ-KUNI-024`
- **Constrained by:** `INV-KUNI-003`
- **Verified by:** `TEST-KUNI-008`

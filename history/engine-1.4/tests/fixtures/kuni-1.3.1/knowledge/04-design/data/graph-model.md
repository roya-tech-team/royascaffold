---
document_id: DOC-KUNI-DATA
title: Knowledge Universe in-memory graph
layer: design
schema_version: 2
document_status: in-review
owners: [knowledge-universe-team]
---

# In-memory graph

There is no database. The conceptual model is realized as local objects generated at runtime.

## Ownership

`CMP-KUNI-GENERATOR` owns creation of a graph instance. `CMP-KUNI-STORE` owns which instance is current and the explorer’s attention flags. Renderers never own source data.

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

Connection count on the details panel is the number of distinct neighboring nodes (undirected degree). It is derived, not stored.

## Generation rules

- Seeded generator so Randomize is a new seed, not hand-edited names. Default first seed: `universe-0`.
- Exactly 5 topical clusters, centers at least 14 units apart inside a roughly 40-unit radius volume. Place centers on a ring of radius 22 at y in [-4, 4]:
  1. Concepts — Artificial Intelligence, Machine Learning, Neural Networks, Deep Learning, Natural Language Processing, Computer Vision, plus concept satellites
  2. Industry — OpenAI, Google, Microsoft, Apple, plus organization satellites
  3. People — Elon Musk, plus person satellites
  4. Places — Stanford University, MIT, Silicon Valley, plus place satellites
  5. Systems — Computer Science, Robotics, Mathematics, plus technology, event, and document satellites
- Default instance targets 180 nodes and 420 edges, always clamped to 100–300 nodes and 200–800 edges. Split nodes roughly evenly across the five clusters, ±8.
- All seven node types appear. Importance bands: hubs 0.75–1.00, mid 0.36–0.74, peripherals 0.15–0.35. Hubs receive 8–16 edges. Peripherals receive 1–3 edges. Mid nodes receive 3–7 edges.
- About 8–12% of edges are bridges between clusters. Remaining edges stay inside a cluster.
- Edge types from endpoint types, first match:
  - document → person or organization: `CREATED_BY`
  - person → organization: `WORKS_AT`
  - person → place: `STUDIED_AT`
  - organization → place: `LOCATED_IN`
  - technology → technology or concept: `DEPENDS_ON`
  - organization or person → concept: `INFLUENCES`
  - concept → concept in the same cluster: `PART_OF` if the target is a hub, otherwise `RELATED_TO`
  - any other pair: `RELATED_TO`
- Do not branch the renderer on those names. Strength may be omitted.
- Seed hub labels must include: Artificial Intelligence, Machine Learning, Neural Networks, OpenAI, Google, Microsoft, Apple, Elon Musk, Computer Science, Robotics, Mathematics, Deep Learning, Natural Language Processing, Computer Vision, Stanford University, MIT, Silicon Valley.
- Remaining satellite labels are composed from these closed lists. Do not free-write names.
  - person given: Ada, Grace, Alan, Fei, Yoshua, Demis, Ilya, Andrej, Satya, Jensen, Geoff, Yann, Andrew, Daphne
  - person family: Lovelace, Hopper, Turing, Li, Bengio, Hassabis, Sutskever, Karpathy, Nadella, Huang, Ng, Hinton, LeCun, Pearl
  - organization left: Open, Deep, Bright, North, Blue, Prime, Vector, Signal
  - organization right: Labs, Systems, Research, Institute, Foundry, Works
  - concept: Attention Mechanism, Embedding Space, Gradient Descent, Alignment, Abstraction, Causality, Emergence, Compression, Representation, Optimization Principle
  - technology: Transformer, CUDA, PyTorch, TensorFlow, Kubernetes, WebGL, GraphQL, LLVM, WASM, Ray
  - place: North Campus Lab, West Quad, Harbor Lab, Alpine Site, River Station, Desert Observatory
  - event: Annual Alignment Workshop, Systems Symposium, Model Release Day, Vision Keynote, Robotics Summit
  - document: Attention Whitepaper, Systems Handbook, Vision Survey, Graph Spec, Training Notes
- Reuse list items with a numeric suffix when the lists run out, for example `North Labs 2`. Never invent a name outside these lists.
- Description template only: `{label} is a {type} in this universe.`
- Do not use Government, Joe Rogan, Ukraine, Republicans, or Media.
- No retention, deletion policy, or migration. Refreshing the page or pressing Randomize replaces the instance.

## Content credibility

- Source class: generated dummy.
- Curation: recognizable public-topic hub seeds plus closed-list satellites so the graph feels populated.
- Completeness: every node has id, label, type, importance, position, and a description that may be short.
- Freshness: not applicable. Data is not live.
- Placeholder policy: search chrome is a placeholder. Graph entities are not placeholders; they are dummy records.
- Prohibited fabrication: do not present dummy names as live or authoritative knowledge. Do not copy the reference’s political-media entities.

## Classification

Dummy public-looking names only. No personal data collection.

## Mapping

- `CON-KUNI-NODE`, `CON-KUNI-EDGE`, `CON-KUNI-CLUSTER`, `CON-KUNI-IMPORTANCE`, `CON-KUNI-GRAPH`
- Invariants `INV-KUNI-001`, `INV-KUNI-004`, and `INV-KUNI-006`

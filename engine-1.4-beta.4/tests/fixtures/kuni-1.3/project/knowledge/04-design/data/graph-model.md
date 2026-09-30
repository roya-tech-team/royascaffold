---
document_id: DOC-KUNI-DATA
title: Knowledge Universe in-memory graph
layer: design
schema_version: 1
document_status: approved
owners: [knowledge-universe-team]
---

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
| year | appearance year in the timeline span |

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

- `CON-KUNI-NODE`, `CON-KUNI-EDGE`, `CON-KUNI-CLUSTER`, `CON-KUNI-IMPORTANCE`, `CON-KUNI-YEAR`
- Invariants `INV-KUNI-001`, `INV-KUNI-004`, and `INV-KUNI-006`

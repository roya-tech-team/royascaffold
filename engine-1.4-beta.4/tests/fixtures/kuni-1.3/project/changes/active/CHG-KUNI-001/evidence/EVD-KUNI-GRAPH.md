---
document_id: DOC-KUNI-EVD-GRAPH
title: Dummy graph shape evidence
layer: evidence
schema_version: 1
document_status: approved
owners: [knowledge-universe-team]
---

# Graph shape evidence

### EVD-KUNI-002 · Dummy graph meets approved scale

- **Kind:** evidence
- **Knowledge status:** approved
- **Implementation status:** not-applicable
- **Owner:** knowledge-universe-team
- **Command:** `npx tsx -e` import of `generateKnowledgeGraph(20260820)`
- **Environment:** local Node with tsx
- **Time:** 2026-08-20T02:22Z
- **Scope:** generated default instance
- **Result:** PASS
- **Observation:** 183 nodes, 648 edges, seven types present: concept, technology, organization, person, place, event, document. Browser observation shows separated clusters, larger hubs, thinner peripherals, and thin colored edges. Renderer consumes generic objects; dummy names live only in the generator.
- **Covers:** `TEST-KUNI-002`

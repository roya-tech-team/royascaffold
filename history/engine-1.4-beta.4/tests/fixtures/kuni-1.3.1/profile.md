---
document_id: DOC-KUNI-PROFILE
title: Knowledge Universe project profile
layer: profile
schema_version: 2
document_status: in-review
owners: [product-owner]
project_name: Knowledge Universe
project_kind: web
artifact_profile: modular
adoption_mode: strict
adapters: [generic, web-ui]
source_roots: []
source_extensions: [.ts, .tsx]
default_context_tokens: 16000
command_dev: npm run dev
command_build: npm run build
command_typecheck: npm run typecheck
command_preview: npm run preview
generated_paths: [dist, node_modules, contexts/generated, generated]
excluded_paths: [dist, node_modules]
quality_threshold_authorities: [owner, approved-assumption, adapter-recommended]
review_policy: high-judgment visual claims require stakeholder-owner or fresh-context-reviewer; implementer-self-check cannot close material polish
---

# Profile

Knowledge Universe is a browser application whose first milestone is a polished, full-screen 3D knowledge/network visualization driven by local dummy data.

This profile records project identity, adapters, and stakeholder technology constraints. Application source does not yet exist; `source_roots` stays empty until an approved implementation slice creates it.

## Applications and runtimes

- Single-page web client.
- Desktop browsers are the primary runtime. Laptop and tablet must remain usable. Mobile may be basic.

## Stakeholder technology constraints

These are confirmed stakeholder choices, not engine defaults. See `DEC-KUNI-002`.

- React with TypeScript
- Vite
- Three.js rendered through React Three Fiber
- Drei helpers
- Zustand for transient graph and chrome state
- Tailwind CSS for surrounding UI
- Framer Motion for 2D chrome motion
- Angular and Vue are forbidden

## Selected adapters

- `generic` — baseline discovery, criteria, and evidence contracts
- `web-ui` — browser surface, first-view focus, visual evidence, responsive and interaction questions

`web-api` is rejected for this milestone because there is no backend, API, or persistence.

## Ownership

- Knowledge and product direction: `product-owner`
- First-slice implementation: `knowledge-universe-team`

## Reviewer rules

- First milestone is a local visual prototype. No authentication, backend, persistence, or real knowledge ingestion.
- Material visual quality is owner-adjudicated against the brief and `docs/reference/3d-network-reference.png`.
- New public behavior outside the approved first-milestone requirements returns to analysis.

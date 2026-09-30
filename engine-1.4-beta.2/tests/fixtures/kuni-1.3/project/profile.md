---
document_id: DOC-KUNI-PROFILE
title: Knowledge Universe project profile
layer: profile
schema_version: 1
document_status: approved
owners: [product-owner]
project_name: Knowledge Universe
project_kind: web
artifact_profile: compact
adapters: [generic, web-ui]
source_roots: [src]
source_extensions: [.ts, .tsx]
default_context_tokens: 16000
command_dev: npm run dev
command_build: npm run build
command_typecheck: npm run typecheck
command_preview: npm run preview
generated_paths: [dist, node_modules, contexts/generated, generated]
excluded_paths: [dist, node_modules]
---

# Profile

Knowledge Universe is a browser application whose first milestone is a polished, full-screen 3D knowledge/network visualization driven by local dummy data.

## Applications and runtimes

- Single-page web client.
- Desktop browsers are the primary runtime. Laptop and tablet must remain usable. Mobile may be basic.

## Stakeholder technology constraints

These are confirmed stakeholder choices for this product, not engine defaults:

- React with TypeScript
- Vite
- Three.js rendered through React Three Fiber
- Drei helpers
- Zustand for transient graph and chrome state
- Tailwind CSS for surrounding UI
- Framer Motion for 2D chrome motion
- Angular and Vue are forbidden

## Source and quality commands

- Develop: `npm run dev`
- Production build: `npm run build`
- Typecheck: `npm run typecheck`
- Preview build: `npm run preview`

## Ownership

- Knowledge and product direction: `product-owner`
- First-slice implementation: `knowledge-universe-team`

## Reviewer rules

- First milestone is a local visual prototype. No authentication, backend, persistence, or real knowledge ingestion.
- New public behavior outside the approved first-slice requirements returns to analysis.

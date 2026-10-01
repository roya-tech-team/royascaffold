# Generated Context Pack

> Generated view. Do not edit or treat as canonical.

- Manifest: `CTX-KUNI-TASK-001`
- Role: implementer
- Project hash: `3faa3fc40148320f9e4a5de1120ad3f244c9037c4be58d89da576657b93ca3bb`
- Root IDs: `TASK-KUNI-001`
- Included IDs: `TASK-KUNI-001`, `ADR-KUNI-001`, `CMP-KUNI-APP`, `REQ-KUNI-001`, `NFR-KUNI-004`
- Overflow policy: fail-and-split

## Document · profile.md

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
## Artifact · TASK-KUNI-001

_Source: `changes/active/CHG-KUNI-001/execution-plan.md:16`_

### TASK-KUNI-001 · Create the client foundation

- **Kind:** task
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Goal:** a Vite React TypeScript Tailwind application that boots to a full-screen shell.
- **Preconditions:** change approved
- **Input IDs:** `ADR-KUNI-001`, `CMP-KUNI-APP`, `REQ-KUNI-001`, `NFR-KUNI-004`
- **Allowed paths:** `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `src/main.tsx`, `src/vite-env.d.ts`, `src/app/App.tsx`, `src/styles/index.css`
- **Forbidden:** graph rendering, extra frameworks
- **Steps:** initialize the confirmed stack; add strict TypeScript; add Tailwind; render a dark full-screen host.
- **Outputs:** runnable `npm run dev` and `npm run typecheck`
- **Checks:** typecheck passes; the page loads
- **Done:** foundation files exist and the app mounts
- **Recovery:** recreate the Vite app and re-apply Tailwind
- **Handoff:** `TASK-KUNI-002`
## Artifact · ADR-KUNI-001

_Source: `knowledge/04-design/architecture/overview.md:62`_

### ADR-KUNI-001 · Adopt the confirmed client stack

- **Kind:** decision
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Decision:** React, TypeScript, Vite, Three.js, React Three Fiber, Drei, Zustand, Tailwind CSS, and Framer Motion.
- **Because:** stakeholder confirmation. Angular and Vue are out.
- **Consequence:** scene composition is componentized; Three.js primitives stay available for instancing and buffers.
- **Supports:** `NFR-KUNI-004`
## Artifact · CMP-KUNI-APP

_Source: `knowledge/05-implementation/components/components.md:12`_

### CMP-KUNI-APP · Application shell

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** mount the full-screen graph and overlay chrome.
- **Runtime:** web client
- **Depends on:** `CMP-KUNI-CANVAS`, `CMP-KUNI-HUD`, `CMP-KUNI-STORE`
- **Implements:** `REQ-KUNI-001`, `REQ-KUNI-016`
## Artifact · REQ-KUNI-001

_Source: `knowledge/02-requirements/requirements.md:58`_

### REQ-KUNI-001 · Open into a full-screen 3D graph

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** the graph is the product; the explorer must not land on a marketing page or empty shell.
- **Actor:** Explorer
- **Trigger:** application launch
- **Statement:** the application opens directly into a full-screen 3D knowledge network with depth, perspective, and a dark immersive environment.
- **Acceptance:**
  - The first painted view is the 3D network, not a form or dashboard.
  - The canvas occupies the viewport.
  - Background is deep navy or near-black with a subtle gradient or particles, not a flat unvaried black.
  - Chrome does not dominate the graph.
- **Satisfies:** `CAP-KUNI-001`
- **Supports:** `UC-KUNI-001`
- **Constrained by:** `NFR-KUNI-001`
- **Verified by:** `TEST-KUNI-001`
## Artifact · NFR-KUNI-004

_Source: `knowledge/02-requirements/nfr.md:57`_

### NFR-KUNI-004 · Strict typed client

- **Kind:** nfr
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Quality area:** maintainability
- **Source:** stakeholder-brief-2026-08-20
- **Target:** TypeScript strict mode, no `any`, reusable graph types, configuration for visual constants.
- **Scope:** application source
- **Measurement:** `npm run typecheck` exits 0
- **Verified by:** `TEST-KUNI-005`

## Manifest source

`contexts/manifests/CTX-KUNI-TASK-001.md`

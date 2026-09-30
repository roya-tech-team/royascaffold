---
document_id: DOC-KUNI-PLAN
title: First universe execution plan
layer: execution
schema_version: 1
document_status: approved
owners: [knowledge-universe-team]
---

# Execution plan

Change `CHG-KUNI-001`. Risk medium. Baseline `initial`. Reviewer `product-owner`.

Forbidden inventions: authentication, backend, real search, new node types beyond the approved seven, Angular, Vue, or extra product modules.

### TASK-KUNI-001 · Create the client foundation

- **Kind:** task
- **Knowledge status:** approved
- **Implementation status:** verified
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

### TASK-KUNI-002 · Create generic graph data

- **Kind:** task
- **Knowledge status:** approved
- **Implementation status:** verified
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

### TASK-KUNI-003 · Render the 3D universe

- **Kind:** task
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Goal:** a cinematic scene with instanced or shared-geometry nodes, buffer edges, atmosphere, and camera controls.
- **Preconditions:** `TASK-KUNI-002`
- **Input IDs:** `CMP-KUNI-CANVAS`, `CMP-KUNI-NODES`, `CMP-KUNI-EDGES`, `ADR-KUNI-003`, `ADR-KUNI-004`, `REQ-KUNI-003`, `REQ-KUNI-004`, `REQ-KUNI-006`, `NFR-KUNI-001`, `NFR-KUNI-002`
- **Allowed paths:** `src/features/graph/components/`, `src/features/graph/hooks/useGraphCamera.ts`, `src/lib/three/`
- **Forbidden:** excessive bloom; per-edge React objects; storing the scene in Zustand
- **Steps:** canvas, scene, nodes, edges, ambient space, orbit camera, modest post-process.
- **Outputs:** visible clustered universe
- **Checks:** `TEST-KUNI-001` graph presence and `TEST-KUNI-002` visual shape
- **Done:** the explorer sees a polished 3D network immediately
- **Handoff:** `TASK-KUNI-004`

### TASK-KUNI-004 · Add interaction and chrome

- **Kind:** task
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Goal:** hover, selection, labels, details, HUD controls, and search placeholder.
- **Preconditions:** `TASK-KUNI-003`
- **Input IDs:** `CMP-KUNI-HUD`, `CMP-KUNI-DETAILS`, `CMP-KUNI-LABELS`, `ACT-KUNI-HOVER`, `ACT-KUNI-SELECT`, `ACT-KUNI-RESET`, `REQ-KUNI-007`, `REQ-KUNI-008`, `REQ-KUNI-009`, `REQ-KUNI-016`
- **Allowed paths:** `src/features/graph/components/`, `src/features/graph/hooks/`, `src/components/layout/`, `src/app/App.tsx`
- **Forbidden:** real search, extra admin modules
- **Steps:** wire hover and select; dim unrelated; details panel; labels policy; overlay chrome; focus camera.
- **Outputs:** complete first milestone experience
- **Checks:** `TEST-KUNI-003`, `TEST-KUNI-004`, `TEST-KUNI-005`
- **Done:** all first-slice acceptance criteria are implementable and exercised
- **Handoff:** verify-change

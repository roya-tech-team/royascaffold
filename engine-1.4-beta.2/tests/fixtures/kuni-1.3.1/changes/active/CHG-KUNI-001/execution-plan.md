---
document_id: DOC-CHG-KUNI-001-PLAN
title: Execution plan — first visual universe
layer: change-execution
schema_version: 2
document_status: in-review
owners: [knowledge-universe-team]
change_id: CHG-KUNI-001
---

# Execution plan

Change `CHG-KUNI-001`. Baseline `empty-main`. Consequence medium. Uncertainty medium. Judgment high.

Current SQR: `REV-KUNI-SQR-001` pass-with-conditions. Fingerprint `8fc2fb9fe970631b5a5e3de9f24d52d19a01d8ea37113a1c7905ff0a906de4d6`. Do not edit reviewed input records without re-review.

Carried conditions: owner visual adjudication of `CRIT-KUNI-016`; 30 fps assumption review of `ASM-KUNI-001`.

Foundation before optional:

```text
TASK-KUNI-001 → TASK-KUNI-002 → TASK-KUNI-003 → TASK-KUNI-004 → TASK-KUNI-005 → TASK-KUNI-006
                                                                                 ↓
                                                                          TASK-KUNI-007 (optional)
```

No rollout, migration, or rollback. Local prototype only. If a material decision is missing, stop and return to its owner. Do not invent it in a step.

### TASK-KUNI-001 · Create the client foundation

- **Kind:** execution-task
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Goal:** A Vite React TypeScript Tailwind app opens into a full-screen dark canvas host with no backend.
- **Task class:** foundation
- **Context tier:** standard
- **Escalation:** Stop and return to design when a material decision is missing.
- **Depends on:** []
- **Preconditions:** empty application source; SQR still current
- **Inputs:** `DEC-KUNI-002`, `PAT-KUNI-001`, `profile.md`, `knowledge/04-design/architecture/overview.md`
- **Allowed paths:** `src`, `index.html`, `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `public`
- **Forbidden inventions:** Angular, Vue, backend, auth, extra routes, admin dashboard, putting a scene into Zustand
- **Outputs:** runnable Vite client, `CMP-KUNI-APP` shell, full-bleed canvas host
- **Checks:** `npm run typecheck` exits 0; first painted view is a full-bleed dark canvas not a form
- **Done when:** `CRIT-KUNI-001` host exists; `CRIT-KUNI-023` typecheck passes; `CRIT-KUNI-020` no server or identity client
- **Recovery:** remove generated app files and recreate from this task only
- **Handoff:** `TASK-KUNI-002` may add types and the generator
- **Implements:** `CRIT-KUNI-001`, `CRIT-KUNI-020`, `CRIT-KUNI-023`, `DEC-KUNI-002`, `PAT-KUNI-001`, `RDR-KUNI-001`, `CMP-KUNI-APP`
- **Verified by:** `TEST-KUNI-001`, `TEST-KUNI-005`

Steps:

1. Initialize React + TypeScript + Vite. Enable strict TypeScript. Add Tailwind. Do not add Angular or Vue.
2. Mount `CMP-KUNI-APP` as a full-viewport shell. No router and no marketing page.
3. Reserve a full-bleed canvas host. Background tokens `#070B14` to `#10182A`.
4. Confirm there is no API client, auth, or persistence dependency.
5. Run `npm run typecheck`.

### TASK-KUNI-002 · Create types config and dummy graph

- **Kind:** execution-task
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Goal:** A seeded generator produces a clustered dummy graph that the renderer can consume as generic objects.
- **Task class:** foundation
- **Context tier:** standard
- **Escalation:** Stop and return to design when a material decision is missing.
- **Depends on:** `TASK-KUNI-001`
- **Preconditions:** `TASK-KUNI-001` done
- **Inputs:** `knowledge/04-design/data/graph-model.md`, `PAT-KUNI-005`, `PAT-KUNI-006`, `INV-KUNI-006`
- **Allowed paths:** `src/features/graph/types`, `src/features/graph/data`, `src/features/graph/config`, `src/features/graph/state`
- **Forbidden inventions:** hardcoded reference entities, renderer branches on dummy names, years timelines path scores, a database
- **Outputs:** `CMP-KUNI-CONFIG`, `CMP-KUNI-GENERATOR`, `CMP-KUNI-STORE` graph value, first valid instance
- **Checks:** generated graph has 100-300 nodes, 200-800 edges, at least five types, more than one cluster
- **Done when:** `CRIT-KUNI-002` `CRIT-KUNI-003` `CRIT-KUNI-018` are structurally satisfied by data even if drawing is still a stub
- **Recovery:** replace the generator; do not hand-edit a one-off graph
- **Handoff:** `TASK-KUNI-003` may draw the current graph value
- **Implements:** `CRIT-KUNI-002`, `CRIT-KUNI-003`, `CRIT-KUNI-018`, `DEC-KUNI-003`, `DEC-KUNI-005`, `DEC-KUNI-008`, `DEC-KUNI-013`, `PAT-KUNI-002`, `PAT-KUNI-005`, `PAT-KUNI-006`, `RDR-KUNI-004`, `RDR-KUNI-014`, `CMP-KUNI-CONFIG`, `CMP-KUNI-GENERATOR`, `CMP-KUNI-STORE`
- **Verified by:** `TEST-KUNI-002`

Steps:

1. Add generic node and edge types from the data design. Importance is 0-1.
2. Put type forms hues sizes rings and edge defaults in `CMP-KUNI-CONFIG`. Copy the experience hex table and radius formula. No reference pictograms.
3. Implement a seeded clustered generator using the data-design rules exactly: the five named clusters on a radius-22 ring, default 180 nodes and 420 edges, listed hub seeds, closed satellite lists, importance bands, degree bands, and the edge-type table.
4. Compose satellite labels only from the closed lists in the data design. Use the description template. Do not copy the reference entity set.
5. Store the current graph value in Zustand. Do not store meshes.
6. Randomize must be a new seed that still satisfies `INV-KUNI-006`. The control can wait for `TASK-KUNI-006` but the function must exist.

### TASK-KUNI-003 · Render the universe

- **Kind:** execution-task
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Goal:** The explorer sees a cinematic clustered 3D network with distinct types, thin edges, and depth.
- **Task class:** foundation
- **Context tier:** standard
- **Escalation:** Stop and return to design when a material decision is missing.
- **Depends on:** `TASK-KUNI-002`
- **Preconditions:** `TASK-KUNI-002` done
- **Inputs:** `knowledge/04-design/experience/experience.md`, `docs/reference/3d-network-reference.png`, `PAT-KUNI-003`, `PAT-KUNI-008`
- **Allowed paths:** `src/features/graph/components`, `src/lib/three`
- **Forbidden inventions:** flat black clear color, heavy bloom, thick tubes, one React mesh per edge, pictograms, eight neon edge colors, persistent RELATED_TO labels, copying the reference scene
- **Outputs:** `CMP-KUNI-CANVAS` `CMP-KUNI-NODES` `CMP-KUNI-EDGES` drawing the current graph
- **Checks:** types are distinguishable; edges are thin; background is navy with subtle stars not flat black; orbit 10 seconds remains interactive
- **Done when:** `CRIT-KUNI-004` `CRIT-KUNI-005` `CRIT-KUNI-006` `CRIT-KUNI-017` hold. `CRIT-KUNI-016` is prepared for owner review not self-closed
- **Recovery:** reduce bloom and label-less default; switch to shared or instanced drawing if fps is poor
- **Handoff:** `TASK-KUNI-004` may add orbit controls
- **Implements:** `CRIT-KUNI-004`, `CRIT-KUNI-005`, `CRIT-KUNI-006`, `CRIT-KUNI-016`, `CRIT-KUNI-017`, `NFR-KUNI-001`, `NFR-KUNI-002`, `PAT-KUNI-003`, `PAT-KUNI-008`, `RDR-KUNI-003`, `RDR-KUNI-005`, `RDR-KUNI-006`, `RDR-KUNI-007`, `RDR-KUNI-008`, `RDR-KUNI-009`, `RDR-KUNI-010`, `RDR-KUNI-015`, `CMP-KUNI-CANVAS`, `CMP-KUNI-NODES`, `CMP-KUNI-EDGES`
- **Verified by:** `TEST-KUNI-002`, `TEST-KUNI-006`

Steps:

1. Create the R3F canvas on the host. Clear color and gradient follow space tokens.
2. Add sparse star particles, light fog, modest bloom, subtle vignette. Bloom stays subordinate to the graph.
3. Draw nodes from generic objects with shared or instanced geometry. Copy experience hues, base radii, and the importance radius formula into `CMP-KUNI-CONFIG`. Do not invent other colors.
4. Draw thin buffer-backed edges in `#C8D0DC` at opacity 0.18. Use experience bloom fog and star constants. Do not raise bloom above 0.22.
5. Do not add HUD labels or selection yet unless needed to debug.
6. Carry SQR condition: record a 10-second orbit note for `ASM-KUNI-001`. Do not award `CRIT-KUNI-016`.

### TASK-KUNI-004 · Add damped camera exploration

- **Kind:** execution-task
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Goal:** The explorer can orbit zoom and pan smoothly and recover later via a stored home pose.
- **Task class:** foundation
- **Context tier:** standard
- **Escalation:** Stop and return to design when a material decision is missing.
- **Depends on:** `TASK-KUNI-003`
- **Preconditions:** `TASK-KUNI-003` done
- **Inputs:** `PAT-KUNI-010`, architecture camera constants
- **Allowed paths:** `src/features/graph/components`, `src/features/graph/hooks`
- **Forbidden inventions:** default auto-spin, free-fly camera, instant snaps, infinite zoom
- **Outputs:** orbit controls with home framing; auto-rotate off and interruptible
- **Checks:** rotate zoom pan are damped; min distance 8; max distance 80; auto-rotate is off at launch
- **Done when:** `CRIT-KUNI-007` and `CRIT-KUNI-015` behavior exist. The HUD toggle may arrive in `TASK-KUNI-006`
- **Recovery:** reset home to `(0, 12, 42)` looking at origin
- **Handoff:** `TASK-KUNI-005` may pick nodes
- **Implements:** `CRIT-KUNI-007`, `CRIT-KUNI-015`, `DEC-KUNI-015`, `PAT-KUNI-010`, `RDR-KUNI-016`, `ACT-KUNI-ORBIT`, `ACT-KUNI-ROTATE`
- **Verified by:** `TEST-KUNI-003`

Steps:

1. Add OrbitControls with damping about 0.08, min 8, max 80, home about `(0, 12, 42)`.
2. Store home framing for Reset View.
3. Keep auto-rotate off. If enabled later, yield to pointer input and use `autoRotateSpeed` 0.4.
4. Support mouse and basic touch orbit.

### TASK-KUNI-005 · Add hover selection and details

- **Kind:** execution-task
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Goal:** Hover and select emphasize a first-degree neighborhood and a glass panel shows required facts.
- **Task class:** foundation
- **Context tier:** standard
- **Escalation:** Stop and return to design when a material decision is missing.
- **Depends on:** `TASK-KUNI-004`
- **Preconditions:** `TASK-KUNI-004` done
- **Inputs:** `WF-KUNI-INSPECT`, `PAT-KUNI-007`, `knowledge/04-design/experience/experience.md`
- **Allowed paths:** `src/features/graph/components`, `src/features/graph/state`, `src/features/graph/hooks`, `src/components/ui`
- **Forbidden inventions:** hiding unrelated nodes, two-hop neighborhoods, admin forms, stored adjacency that goes stale
- **Outputs:** `ACT-KUNI-HOVER` `ACT-KUNI-SELECT` `ACT-KUNI-CLEAR` `CMP-KUNI-DETAILS`
- **Checks:** hover scales and lights a neighborhood; select is distinct and dims the rest; panel shows name type description and undirected degree; empty canvas clears
- **Done when:** `CRIT-KUNI-008` `CRIT-KUNI-009` `CRIT-KUNI-010` hold
- **Recovery:** derive neighborhood from the current graph plus one id
- **Handoff:** `TASK-KUNI-006` may add labels and chrome
- **Implements:** `CRIT-KUNI-008`, `CRIT-KUNI-009`, `CRIT-KUNI-010`, `DEC-KUNI-011`, `DEC-KUNI-014`, `PAT-KUNI-004`, `PAT-KUNI-007`, `RDR-KUNI-013`, `CMP-KUNI-DETAILS`, `INV-KUNI-003`, `INV-KUNI-007`
- **Verified by:** `TEST-KUNI-003`

Steps:

1. Keep hoveredNodeId and selectedNodeId in the store. Derive neighbors either direction one hop.
2. Hover: scale 1.12, ring 1.35x, hit area 1.8x, emphasized edges and neighbors, pointer cursor, smooth transition. Dim unrelated by 0.28.
3. Select: scale 1.18, ring 1.35x, dim unrelated elements, keep them visible.
4. Show a bottom-right glass panel, 300px wide, 24px from bottom and right, with name, type, description, and undirected degree.
5. Empty-canvas click clears hover selection focus and the panel.
6. Do not implement search filtering.

### TASK-KUNI-006 · Add labels chrome and view controls

- **Kind:** execution-task
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Goal:** Selective glass labels and the specified HUD let the explorer control the view without a dashboard.
- **Task class:** foundation
- **Context tier:** standard
- **Escalation:** Stop and return to design when a material decision is missing.
- **Depends on:** `TASK-KUNI-005`
- **Preconditions:** `TASK-KUNI-005` done
- **Inputs:** `PAT-KUNI-009`, `DEC-KUNI-009`, `DEC-KUNI-012`, `knowledge/04-design/experience/experience.md`
- **Allowed paths:** `src/features/graph/components`, `src/components/layout`, `src/components/ui`
- **Forbidden inventions:** labels on every node, persistent edge captions, Reddit chrome, extra settings modules, search execution
- **Outputs:** `CMP-KUNI-LABELS` `CMP-KUNI-HUD` and working Reset Labels AutoRotate Randomize controls
- **Checks:** title and subtitle match; four controls work; legend lists seven types; search field is visible and does not filter; 1440x900 and 1024x768 remain usable
- **Done when:** `CRIT-KUNI-011` `CRIT-KUNI-012` `CRIT-KUNI-013` `CRIT-KUNI-014` `CRIT-KUNI-019` `CRIT-KUNI-022` hold. Search presence holds; polish may wait for `TASK-KUNI-007`
- **Recovery:** hide default labels if the view is noisy; keep hover and selection labels
- **Handoff:** `TASK-KUNI-007` may polish search and select-to-focus
- **Implements:** `CRIT-KUNI-011`, `CRIT-KUNI-012`, `CRIT-KUNI-013`, `CRIT-KUNI-014`, `CRIT-KUNI-019`, `CRIT-KUNI-022`, `DEC-KUNI-004`, `DEC-KUNI-007`, `DEC-KUNI-009`, `DEC-KUNI-012`, `PAT-KUNI-004`, `PAT-KUNI-009`, `RDR-KUNI-002`, `RDR-KUNI-011`, `RDR-KUNI-012`, `RDR-KUNI-017`, `CMP-KUNI-LABELS`, `CMP-KUNI-HUD`, `INV-KUNI-002`, `INV-KUNI-008`, `INV-KUNI-009`
- **Verified by:** `TEST-KUNI-001`, `TEST-KUNI-004`

Steps:

1. Add Drei HTML glass labels for important nearby hovered and selected nodes. Default labels: importance ≥ 0.72 or the 12 highest-importance nodes, whichever is fewer. Nearby labels when camera distance < 14. Upright. Not every node.
2. Place HUD: top-left title Knowledge Universe 13px weight 500 `#D7DCE6` and subtitle Interactive 3D Network 11px `#8B93A7`; top-center search field; top-right Reset View Randomize Toggle Labels Toggle Auto Rotate; bottom-left type legend.
3. Reset View restores home camera and clears attention and the panel.
4. Toggle Labels changes default importance labels only.
5. Toggle Auto Rotate enables interruptible motion at `autoRotateSpeed` 0.4 from `TASK-KUNI-004`.
6. Randomize calls the new-seed generator and clears attention.
7. Search field placeholder is Search knowledge... Typing does not filter. Polish may be basic here.
8. If generation fails, show Could not create the universe.

### TASK-KUNI-007 · Polish optional search focus and scale

- **Kind:** execution-task
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Goal:** Optional finish: polished inert search, smooth select-to-focus, and a rendering structure that can grow.
- **Task class:** optional
- **Context tier:** standard
- **Escalation:** Stop and return to design when a material decision is missing.
- **Depends on:** `TASK-KUNI-006`
- **Preconditions:** `TASK-KUNI-006` done
- **Inputs:** `CRIT-KUNI-021`, `CRIT-KUNI-024`, `CRIT-KUNI-025`, `DEC-KUNI-016`, `PAT-KUNI-003`
- **Allowed paths:** `src/features/graph`, `src/components/ui`
- **Forbidden inventions:** real search, backend, new chrome regions, weakening foundation quality to chase effects
- **Outputs:** polished search placeholder, `ACT-KUNI-FOCUS`, instancing or shared-geometry review note
- **Checks:** search looks finished and still does not filter; select eases camera; node forms remain shared or instanced
- **Done when:** `CRIT-KUNI-021` `CRIT-KUNI-024` `CRIT-KUNI-025` hold or are explicitly deferred with owner note
- **Recovery:** leave foundation behavior in place; do not add dashboard chrome
- **Handoff:** verification against the QDC
- **Implements:** `CRIT-KUNI-021`, `CRIT-KUNI-024`, `CRIT-KUNI-025`, `DEC-KUNI-016`, `PAT-KUNI-003`, `ACT-KUNI-FOCUS`
- **Verified by:** `TEST-KUNI-003`, `TEST-KUNI-005`

Steps:

1. Finish the search field visually. Keep it inert.
2. On select, lerp the camera toward the node without a snap.
3. Review node and edge drawing. If per-element meshes remain, convert repeated forms to instanced or shared geometry.
4. Do not start the next product layer.

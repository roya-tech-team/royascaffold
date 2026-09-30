# Generated Context Pack

> Generated view. Do not edit or treat as canonical.

- Manifest: `CTX-KUNI-TASK-003`
- Role: implementer
- Project hash: `3faa3fc40148320f9e4a5de1120ad3f244c9037c4be58d89da576657b93ca3bb`
- Root IDs: `TASK-KUNI-003`
- Included IDs: `TASK-KUNI-003`, `CMP-KUNI-CANVAS`, `CMP-KUNI-NODES`, `CMP-KUNI-EDGES`, `ADR-KUNI-003`, `ADR-KUNI-004`, `REQ-KUNI-003`, `REQ-KUNI-004`, `REQ-KUNI-006`, `NFR-KUNI-001`, `NFR-KUNI-002`
- Overflow policy: fail-and-split

## Document · knowledge/04-design/experience/experience.md

# Experience

Inspiration file: `docs/reference/3d-network-reference.png`. Do not copy it. Produce a cleaner, more cinematic result: glowing but restrained nodes, thin edges, fewer labels, deeper space, and quieter chrome.

## Journey

1. Explorer lands in a dark universe of clustered nodes.
2. They orbit and notice hubs, colors, and faint stars.
3. Hover brightens a neighborhood and reveals a glass label.
4. Click opens a glass details panel and dims the rest.
5. Controls reset, relabel, rotate, or generate another universe.
6. Search field is visible and does nothing.

## Information

- Title: Knowledge Universe
- Subtitle: Interactive 3D Network
- Search placeholder: Search knowledge...
- Details: name, type, description, connection count
- Legend: one mark per node type

## Screens

One screen. Full-bleed canvas. Overlay chrome.

| Region | Content |
|--------|---------|
| Top left | Title and subtitle |
| Top center | Search placeholder |
| Top right | Reset View, Randomize, Toggle Labels, Toggle Auto Rotate |
| Bottom left | Type legend |
| Trailing side | Details panel when selected |

## Interaction states

| State | Canvas | Chrome |
|-------|--------|--------|
| Default | All visible, important labels only | Search inert, no details |
| Hover | Focus node scaled and brighter, neighbors lit, others slightly dim | Cursor indicates a target |
| Selected | Neighborhood emphasized, others dimmed | Details panel open |
| Focused | Camera eases toward the selected node | Details remain |
| Labels off | Importance labels hidden | Hover and selection labels remain |

## Interface states

- Loading: brief, if any; generation is local.
- Empty: not expected after generation. If generation failed, show a quiet error in chrome.
- Success: graph visible.
- Unauthorized: not applicable.

## Motion

- Camera damping on orbit.
- Smooth intensity and scale changes on hover and selection.
- Details panel eases in with Framer Motion.
- Auto-rotate is slow.

## Accessibility and responsive

- Desktop is the visual target.
- Tablet keeps full-bleed canvas and reachable controls.
- Contrast on labels and chrome must stay readable on the dark scene.
- Node picking needs a generous hit area relative to the visible sphere.

## Visual rules

- Deep navy space, radial falloff, sparse stars.
- Nodes are dimensional, not flat discs.
- Edges stay thin; bloom stays modest.
- No dashboard cards, no thick neon webs, no label forest.
## Artifact · TASK-KUNI-003

_Source: `changes/active/CHG-KUNI-001/execution-plan.md:51`_

### TASK-KUNI-003 · Render the 3D universe

- **Kind:** task
- **Knowledge status:** approved
- **Implementation status:** planned
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
## Artifact · CMP-KUNI-CANVAS

_Source: `knowledge/05-implementation/components/components.md:23`_

### CMP-KUNI-CANVAS · Graph canvas

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** host the WebGL scene, camera, lights, fog, and post-process at a restrained level.
- **Runtime:** web client
- **Depends on:** `CMP-KUNI-NODES`, `CMP-KUNI-EDGES`, `CMP-KUNI-LABELS`
- **Implements:** `REQ-KUNI-001`, `REQ-KUNI-006`
- **Constrained by:** `NFR-KUNI-001`, `NFR-KUNI-002`
## Artifact · CMP-KUNI-NODES

_Source: `knowledge/05-implementation/components/components.md:35`_

### CMP-KUNI-NODES · Node renderer

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** draw nodes from generic objects using centralized type configuration and shared or instanced geometry. Handle pointer hit testing.
- **Depends on:** `CMP-KUNI-CONFIG`, `CMP-KUNI-STORE`
- **Implements:** `REQ-KUNI-003`, `REQ-KUNI-007`, `REQ-KUNI-008`, `REQ-KUNI-017`
- **Constrained by:** `INV-KUNI-001`, `INV-KUNI-005`, `ADR-KUNI-003`
## Artifact · CMP-KUNI-EDGES

_Source: `knowledge/05-implementation/components/components.md:46`_

### CMP-KUNI-EDGES · Edge renderer

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** draw thin glowing connections from generic edges using buffer-backed lines and type configuration.
- **Depends on:** `CMP-KUNI-CONFIG`, `CMP-KUNI-STORE`
- **Implements:** `REQ-KUNI-004`
- **Constrained by:** `ADR-KUNI-003`
## Artifact · ADR-KUNI-003

_Source: `knowledge/04-design/architecture/overview.md:84`_

### ADR-KUNI-003 · Shared geometry over per-node scenes

- **Kind:** decision
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Decision:** repeated node forms use instancing or shared geometries. Edges use a small number of buffer-backed line objects. Hover and selection update attributes or instance state rather than remounting the scene.
- **Because:** `NFR-KUNI-002` and `NFR-KUNI-003`.
- **Consequence:** later growth to thousands of nodes has a path; first slice still targets 100–300 nodes.
## Artifact · ADR-KUNI-004

_Source: `knowledge/04-design/architecture/overview.md:94`_

### ADR-KUNI-004 · HTML overlays for chrome and labels

- **Kind:** decision
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Decision:** product chrome, details, legend, and node labels use HTML and CSS, including Drei HTML anchors where a label must track a node.
- **Because:** readable type and glass styling are easier and sharper in HTML than in glyph textures.
- **Supports:** `REQ-KUNI-009`, `REQ-KUNI-010`
## Artifact · REQ-KUNI-003

_Source: `knowledge/02-requirements/requirements.md:100`_

### REQ-KUNI-003 · Give node types distinct identities

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** categories must be readable without opening every node.
- **Statement:** person, organization, concept, technology, place, event, and document types have centralized, distinguishable visual identities. Important nodes are larger. Some important nodes may use a subtle outer ring.
- **Acceptance:**
  - All seven types are visually distinguishable by color and or form.
  - Colors and sizes are not scattered as ad-hoc literals in unrelated rendering branches.
  - A legend lists the types.
  - Important or central nodes read as larger than peripheral nodes.
- **Satisfies:** `CAP-KUNI-004`
- **Constrained by:** `INV-KUNI-005`
- **Verified by:** `TEST-KUNI-002`
## Artifact · REQ-KUNI-004

_Source: `knowledge/02-requirements/requirements.md:119`_

### REQ-KUNI-004 · Render subtle visible edges

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** relationships must be present without turning the scene into noise.
- **Statement:** edges connect source and target nodes, stay thin and slightly glowing, remain visible, and may vary by relationship type.
- **Acceptance:**
  - Edges are thin and readable against the dark scene.
  - Relationship types may differ in color or opacity.
  - Edges do not appear as thick tubes or a solid scribble.
- **Satisfies:** `CAP-KUNI-001`
- **Constrained by:** `NFR-KUNI-001`
- **Verified by:** `TEST-KUNI-002`
## Artifact · REQ-KUNI-006

_Source: `knowledge/02-requirements/requirements.md:154`_

### REQ-KUNI-006 · Provide smooth camera exploration

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** the explorer must move through the universe naturally.
- **Statement:** the explorer can rotate, zoom, and pan with damping, sensible distance limits, and a good initial camera. Selection may smoothly focus the camera on the chosen node. Idle auto-rotation, when enabled, stays subtle.
- **Acceptance:**
  - Mouse and touch can orbit, zoom, and pan.
  - Motion is damped, not snappy or slippery.
  - Zoom cannot enter the graph or fly infinitely far.
  - A selected node can receive a smooth camera approach.
  - Auto-rotate is off until enabled and is not aggressive.
- **Satisfies:** `CAP-KUNI-003`
- **Supports:** `UC-KUNI-001`
- **Verified by:** `TEST-KUNI-003`
## Artifact · NFR-KUNI-001

_Source: `knowledge/02-requirements/nfr.md:12`_

### NFR-KUNI-001 · Cinematic readable polish

- **Kind:** nfr
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Quality area:** usability / visual quality
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** a technically correct graph that looks like a demo fails the milestone.
- **Target:** dark futuristic presentation with depth, restrained glow, readable hierarchy, and no excessive neon, bloom, huge labels, or thick edges. The reference image is inspiration only; the result must look cleaner and more cinematic.
- **Scope:** canvas, nodes, edges, labels, HUD
- **Measurement:** visual review against `REQ-KUNI-001`, `REQ-KUNI-004`, `REQ-KUNI-016` and the reference file `docs/reference/3d-network-reference.png`
- **Verified by:** `TEST-KUNI-001`
## Artifact · NFR-KUNI-002

_Source: `knowledge/02-requirements/nfr.md:27`_

### NFR-KUNI-002 · Interactive performance on the first-milestone graph

- **Kind:** nfr
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Quality area:** performance
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** later graphs may grow; the first graph must already feel fluid.
- **Target:** 100–300 nodes and 200–800 edges remain interactive while orbiting on a typical desktop GPU. Numeric floor used for verification is 30 frames per second; see `FND-KUNI-001`.
- **Scope:** graph rendering and camera motion
- **Measurement:** orbit the default graph for at least 10 seconds and observe sustained interactivity
- **Verified by:** `TEST-KUNI-002`

## Manifest source

`contexts/manifests/CTX-KUNI-TASK-003.md`

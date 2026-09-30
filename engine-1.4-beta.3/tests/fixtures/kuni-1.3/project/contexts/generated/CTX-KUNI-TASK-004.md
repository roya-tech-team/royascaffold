# Generated Context Pack

> Generated view. Do not edit or treat as canonical.

- Manifest: `CTX-KUNI-TASK-004`
- Role: implementer
- Project hash: `3faa3fc40148320f9e4a5de1120ad3f244c9037c4be58d89da576657b93ca3bb`
- Root IDs: `TASK-KUNI-004`
- Included IDs: `TASK-KUNI-004`, `CMP-KUNI-HUD`, `CMP-KUNI-DETAILS`, `CMP-KUNI-LABELS`, `ACT-KUNI-HOVER`, `ACT-KUNI-SELECT`, `ACT-KUNI-RESET`, `REQ-KUNI-007`, `REQ-KUNI-008`, `REQ-KUNI-009`, `REQ-KUNI-016`
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
## Artifact · TASK-KUNI-004

_Source: `changes/active/CHG-KUNI-001/execution-plan.md:68`_

### TASK-KUNI-004 · Add interaction and chrome

- **Kind:** task
- **Knowledge status:** approved
- **Implementation status:** planned
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
## Artifact · CMP-KUNI-HUD

_Source: `knowledge/05-implementation/components/components.md:68`_

### CMP-KUNI-HUD · Overlay chrome

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** title, search placeholder, view controls, and legend. Must stay visually quiet.
- **Depends on:** `CMP-KUNI-STORE`, `CMP-KUNI-DETAILS`
- **Implements:** `REQ-KUNI-011`, `REQ-KUNI-012`, `REQ-KUNI-013`, `REQ-KUNI-014`, `REQ-KUNI-015`, `REQ-KUNI-016`
## Artifact · CMP-KUNI-DETAILS

_Source: `knowledge/05-implementation/components/components.md:78`_

### CMP-KUNI-DETAILS · Node details panel

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** glass panel for the selected node: name, type, description, connection count.
- **Depends on:** `CMP-KUNI-STORE`
- **Implements:** `REQ-KUNI-009`
## Artifact · CMP-KUNI-LABELS

_Source: `knowledge/05-implementation/components/components.md:57`_

### CMP-KUNI-LABELS · Node labels

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** show readable glass labels for important, nearby, hovered, and selected nodes.
- **Depends on:** `CMP-KUNI-STORE`
- **Implements:** `REQ-KUNI-010`
- **Constrained by:** `INV-KUNI-002`
## Artifact · ACT-KUNI-HOVER

_Source: `knowledge/05-implementation/actions/actions.md:12`_

### ACT-KUNI-HOVER · Hover a node

- **Kind:** action
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Trigger:** pointer enters or leaves a node
- **Actor:** Explorer
- **Input:** node id or none
- **Output:** hover view state
- **Called components:** `CMP-KUNI-NODES`, `CMP-KUNI-EDGES`, `CMP-KUNI-LABELS`, `CMP-KUNI-STORE`
- **Success:** neighborhood emphasizes; pointer changes
- **Implements:** `REQ-KUNI-007`
- **Verified by:** `TEST-KUNI-003`
## Artifact · ACT-KUNI-SELECT

_Source: `knowledge/05-implementation/actions/actions.md:27`_

### ACT-KUNI-SELECT · Select a node

- **Kind:** action
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Trigger:** click a node or empty space
- **Actor:** Explorer
- **Input:** node id or none
- **Output:** selection, dimmed background, details visibility
- **Called components:** `CMP-KUNI-STORE`, `CMP-KUNI-DETAILS`, `CMP-KUNI-NODES`, `CMP-KUNI-EDGES`
- **Success:** selected neighborhood is clear; empty click clears
- **Implements:** `REQ-KUNI-008`, `REQ-KUNI-009`
- **Verified by:** `TEST-KUNI-003`
## Artifact · ACT-KUNI-RESET

_Source: `knowledge/05-implementation/actions/actions.md:56`_

### ACT-KUNI-RESET · Reset view

- **Kind:** action
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Trigger:** Reset View control
- **Actor:** Explorer
- **Output:** initial camera, cleared attention
- **Called components:** `CMP-KUNI-CANVAS`, `CMP-KUNI-STORE`, `CMP-KUNI-HUD`
- **Implements:** `REQ-KUNI-011`
- **Verified by:** `TEST-KUNI-004`
## Artifact · REQ-KUNI-007

_Source: `knowledge/02-requirements/requirements.md:174`_

### REQ-KUNI-007 · Emphasize a hovered node

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** hover is the first conversation with the graph.
- **Statement:** hovering a node increases its intensity, slightly scales it, highlights its edges and direct neighbors, shows its label, and uses an appropriate pointer.
- **Acceptance:**
  - Hovered node is brighter and slightly larger.
  - Direct edges and neighbor nodes are emphasized.
  - The hovered label is readable.
  - The pointer indicates the node is interactive.
  - Transitions are smooth rather than instant pops.
- **Satisfies:** `CAP-KUNI-002`
- **Constrained by:** `INV-KUNI-003`
- **Verified by:** `TEST-KUNI-003`
## Artifact · REQ-KUNI-008

_Source: `knowledge/02-requirements/requirements.md:194`_

### REQ-KUNI-008 · Select a neighborhood

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** selection must isolate meaning without deleting the rest of the universe.
- **Statement:** clicking a node marks it selected, emphasizes first-degree neighbors and edges, and dims unrelated nodes and edges. Clicking empty space clears selection.
- **Acceptance:**
  - The selected node is clearly distinct from hover.
  - First-degree neighbors and connecting edges stay emphasized.
  - Unrelated elements dim and remain visible.
  - Empty-space click returns to the default view state.
- **Satisfies:** `CAP-KUNI-002`
- **Constrained by:** `INV-KUNI-003`
- **Described by:** `WF-KUNI-INSPECT`
- **Verified by:** `TEST-KUNI-003`
## Artifact · REQ-KUNI-009

_Source: `knowledge/02-requirements/requirements.md:214`_

### REQ-KUNI-009 · Show a glass details panel

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** the explorer needs readable facts without leaving the canvas.
- **Statement:** a selected node opens a small glass panel showing name, type, description, and connection count.
- **Acceptance:**
  - Panel appears only when a node is selected.
  - Name, type, description, and number of connections are visible.
  - Styling is glass-like: translucent, blurred, restrained.
  - The panel does not become an admin form.
- **Satisfies:** `CAP-KUNI-002`
- **Verified by:** `TEST-KUNI-003`
## Artifact · REQ-KUNI-016

_Source: `knowledge/02-requirements/requirements.md:335`_

### REQ-KUNI-016 · Keep chrome minimal

- **Kind:** requirement
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** the HUD includes a top-left title "Knowledge Universe" with subtitle "Interactive 3D Network", top-right view controls, a bottom-left type legend, the search placeholder, and the details panel. It is not an admin dashboard.
- **Acceptance:**
  - Title and subtitle match the approved wording.
  - Controls include Reset View, Randomize, Toggle Labels, and Toggle Auto Rotate.
  - Legend shows the node types with color marks.
  - No extra management tables or settings modules ship in this slice.
- **Satisfies:** `CAP-KUNI-003`, `CAP-KUNI-004`
- **Constrained by:** `NFR-KUNI-001`
- **Verified by:** `TEST-KUNI-001`

## Manifest source

`contexts/manifests/CTX-KUNI-TASK-004.md`

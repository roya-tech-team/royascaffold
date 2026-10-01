---
document_id: DOC-CHG-KUNI-001-VERIFICATION
title: Verification — first visual universe
layer: change-quality
schema_version: 2
document_status: in-review
owners: [knowledge-universe-team]
change_id: CHG-KUNI-001
overall_result: manual-required
timestamp: 2026-08-20T18:30:00+03:00
---

# Verification · CHG-KUNI-001

## Revisions

- **Change:** `CHG-KUNI-001` status `in-progress`
- **QDC:** `QDC-KUNI-001` in `quality-design-contract.md`; file fingerprint `7c112c507119793911d03df6030ca4beba83432e09e3a376e8fbcb069091a6b3`
- **SQR:** `REV-KUNI-SQR-001` pass-with-conditions; input fingerprint `8fc2fb9fe970631b5a5e3de9f24d52d19a01d8ea37113a1c7905ff0a906de4d6`
- **IRR:** `REV-KUNI-IRR-001` pass-with-conditions; input fingerprint `52ad0e7e3ff4ec8155720a0e688bb4c84587a3882086113b558c16240cfdfb35`
- **Reference:** `docs/reference/3d-network-reference.png` SHA-256 `3e9816da3280619d1cf21dec4e56c24645e7bee392a91cb4466a82489b77f679`
- **Canonical Main:** not reconciled; `source_roots` remains `[]`
- **Source revision:** working tree only. Parent git `2ec9073e4a13d103a2324a54218853e7acc138b5` does not contain this project. Application source hash for typecheck-bound files: `6e324819c829ce5fabdcafaf7bfced2dabb1804ecd34004d8af1772908d3be23`

## Changed-file inventory and task-scope

Implemented paths stay inside the client: `src/App.tsx`, `src/main.tsx`, `src/features/graph/**`, `src/components/**`, `src/lib/three/**`, plus Vite/Tailwind host files from `TASK-KUNI-001`.

| Task | Scope result |
|------|----------------|
| `TASK-KUNI-001` | Host and full-bleed canvas present |
| `TASK-KUNI-002` | Types, config, generator, Zustand graph present |
| `TASK-KUNI-003` | Instanced nodes, buffer edges, environment present |
| `TASK-KUNI-004` | OrbitControls and home pose present |
| `TASK-KUNI-005` | Hover, select, dim, details panel present |
| `TASK-KUNI-006` | Labels and specified HUD present |
| `TASK-KUNI-007` | Inert search polish, select-to-focus, instancing note present |

No auth, API, persistence, or real-search module was added. Angular and Vue are absent.

## Deterministic commands

| Command | Expected | Actual | Result |
|---------|----------|--------|--------|
| `npm run typecheck` | exit 0, no `any` | exit 0; no `: any` or `as any` under `src/` | pass |
| `npm run build` | production bundle | exit 0; Vite 7.3.6; `dist/assets/index-HHlmZ7kD.js` 1249.82 kB | pass with chunk-size warning |
| `npx tsx` generate `universe-0`..`universe-4` | 100–300 nodes, 200–800 edges, ≥5 types | each seed 180 nodes, 420 edges, 7 types; invariant function raised no errors | pass |
| `npm run dev` + Chrome 151 headless CDP | first-view photographs at 1440×900 and 1024×768 | screenshots in `changes/active/CHG-KUNI-001/evidence/` | pass |
| 10 s orbit FPS | ≥30 fps | 626 frames in 10025 ms = 62.4 fps | pass |

Replay: `npm run dev -- --host 127.0.0.1 --port 5173` then `npx tsx changes/active/CHG-KUNI-001/evidence/collect-runtime.mjs` against Chrome CDP port 9333.

## Environment

- Host: Darwin 27.0.0 arm64
- Node: v26.7.0
- npm: 11.19.0
- Commands run from `/Users/islamhaa/projects/orgs/illm.io/royascaff-research/benchmark/3d-network/grok-low/gpt-yes-yes-1.3.1-12131`
- Executor: implementer in the CHG-KUNI-001 verification session
- Timestamp: 2026-08-20T18:30:00+03:00
- Browser: Chrome/151.0.7922.140 headless, viewport 1440×900 then 1024×768
- Runtime log: `changes/active/CHG-KUNI-001/evidence/runtime-log.json`
- No automated visual-diff runner is bound (`knowledge/06-quality/quality.md`)

## Overall result

**MANUAL-REQUIRED**

Browser runtime is now recorded. Implementer-self-check and deterministic musts that this session may adjudicate are pass. Fresh-context visual criteria and owner taste are not closed from the same conversation.

Closed this session: `CRIT-KUNI-001`, `CRIT-KUNI-004`, `CRIT-KUNI-007`, `CRIT-KUNI-008`, `CRIT-KUNI-009`, `CRIT-KUNI-010`, `CRIT-KUNI-012`, `CRIT-KUNI-013`, `CRIT-KUNI-014`, `CRIT-KUNI-015`, `CRIT-KUNI-017`, `CRIT-KUNI-019`, `CRIT-KUNI-021`, `CRIT-KUNI-022`, `CRIT-KUNI-024`, plus the earlier `CRIT-KUNI-002`, `CRIT-KUNI-018`, `CRIT-KUNI-020`, `CRIT-KUNI-023`, and should `CRIT-KUNI-025`.

Still open: `CRIT-KUNI-003`, `CRIT-KUNI-005`, `CRIT-KUNI-006`, `CRIT-KUNI-011` (fresh-context-reviewer) and `CRIT-KUNI-016` (stakeholder-owner). Photographs for those reviews exist.

No FAIL. No product or design defect that returns to the QDC.

## Requirement, invariant, and NFR map

Must items inherit the bound CRIT evidence. They are not separately PASSed when the owning CRIT is manual-required.

| Item | Priority | Bound evidence | Result |
|------|----------|----------------|--------|
| `REQ-KUNI-001` | must | `EVD-KUNI-001`, `EVD-KUNI-006` | pass for launch; depth still fresh-context |
| `REQ-KUNI-002` | must | `EVD-KUNI-002` | pass |
| `REQ-KUNI-003` | must | `EVD-KUNI-004` | pass |
| `REQ-KUNI-004` | must | `EVD-KUNI-005` | manual-required |
| `REQ-KUNI-005` | must | `EVD-KUNI-003` | manual-required |
| `REQ-KUNI-006` | must | `EVD-KUNI-007`, `EVD-KUNI-024` | pass |
| `REQ-KUNI-007` | must | `EVD-KUNI-008` | pass |
| `REQ-KUNI-008` | must | `EVD-KUNI-009` | pass |
| `REQ-KUNI-009` | must | `EVD-KUNI-010` | pass |
| `REQ-KUNI-010` | must | `EVD-KUNI-011` | manual-required |
| `REQ-KUNI-011` | must | `EVD-KUNI-012` | pass |
| `REQ-KUNI-012` | must | `EVD-KUNI-013` | pass |
| `REQ-KUNI-013` | must | `EVD-KUNI-014` | pass |
| `REQ-KUNI-014` | must | `EVD-KUNI-015` | pass |
| `REQ-KUNI-015` | should | `EVD-KUNI-021` | pass |
| `REQ-KUNI-016` | must | `EVD-KUNI-019` | pass |
| `REQ-KUNI-017` | must | `EVD-KUNI-018` | pass |
| `REQ-KUNI-018` | must | `EVD-KUNI-022` | pass |
| `NFR-KUNI-001` | must | `EVD-KUNI-016` | manual-required |
| `NFR-KUNI-002` | must | `EVD-KUNI-017` | pass |
| `NFR-KUNI-003` | should | `EVD-KUNI-025` | pass |
| `NFR-KUNI-004` | must | `EVD-KUNI-023` | pass |
| `NFR-KUNI-005` | must | `EVD-KUNI-022` | pass |
| `NFR-KUNI-006` | must | `EVD-KUNI-020` | pass |
| `INV-KUNI-001` | must | `EVD-KUNI-018` | pass |
| `INV-KUNI-002` | must | `EVD-KUNI-011` | manual-required |
| `INV-KUNI-003` | must | `EVD-KUNI-008`, `EVD-KUNI-009` | pass |
| `INV-KUNI-004` | must | `EVD-KUNI-020` | pass |
| `INV-KUNI-005` | must | `EVD-KUNI-018` | pass |
| `INV-KUNI-006` | must | `EVD-KUNI-002`, `EVD-KUNI-014` | pass |
| `INV-KUNI-007` | must | `EVD-KUNI-008` | pass |
| `INV-KUNI-008` | must | `EVD-KUNI-020`, `EVD-KUNI-021` | pass |
| `INV-KUNI-009` | must | `EVD-KUNI-009`, `EVD-KUNI-012` | pass |
| `INV-KUNI-010` | must | `EVD-KUNI-015` | pass |

## Contract, architecture, security, data, content, experience, operations

- **Contract:** QDC, SQR, and IRR fingerprints are unchanged. This file does not edit those record blocks.
- **Architecture:** generator, visual config, and Zustand IDs remain separated from Three.js objects.
- **Security:** no identity, secrets, or remote calls in `package.json` or `src/`.
- **Data:** local seeded dummy graph only. Forbidden reference labels are rejected by `graphInvariantErrors`.
- **Content:** HUD copy in source matches the approved title, subtitle, search placeholder, and generation-failure line.
- **Experience:** launch, controls, and interaction are photographed. Owner taste and fresh-context visual adjudication remain.
- **Operations:** no production release. Local preview is sufficient.

## Semantic findings

1. Same-session implementer cannot close `CRIT-KUNI-016` or fresh-context visual criteria `CRIT-KUNI-003`, `CRIT-KUNI-005`, `CRIT-KUNI-006`, `CRIT-KUNI-011`. Photographs are ready for those reviewers.
2. `ASM-KUNI-001` / `CRIT-KUNI-017` measured 62.4 fps across a 10-second orbit. The 30 fps floor is not lowered.
3. Production bundle exceeds Vite’s 500 kB chunk hint. That is not a QDC failure.
4. HTML labels remain one Drei `Html` node per visible label. That matches the approved exception: do not convert labels to meshes.
5. Projected hub click missed; a peripheral select and a later select of Emergence 2 succeeded. No design defect.
6. Repair is limited to owner and fresh-context visual adjudication, not redesign.

## Limitations

- Chrome headless CDP is a desktop browser, not a visual-diff runner.
- Projected clicks can miss dense clusters. Hub select was not photographed; peripheral select was.
- Touch orbit was not dispatched. Tablet evidence is viewport and mouse, not a physical tablet.
- Working tree has no committed application revision.
- Implementer-self-check cannot be the sole closer for high-judgment visual claims.
- `npm run build` chunk-size warning is informational.

## Repair links

None. No FAIL. Residual work is routed visual adjudication, not redesign.

## How to close remaining evidence

1. Fresh-context reviewer: inspect `evidence/1440-first-view.png`, `1440-after-orbit.png`, and `1440-select-peripheral.png` for `CRIT-KUNI-003`, `CRIT-KUNI-005`, `CRIT-KUNI-006`, `CRIT-KUNI-011`.
2. Owner: side-by-side `evidence/1440-first-view.png` with `docs/reference/3d-network-reference.png` (`TEST-KUNI-006`, `CRIT-KUNI-016`).

Do not reconcile Main until those records are adjudicated by the routed authority.

## Evidence records

### EVD-KUNI-001 · First view is the universe

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-001`
- **Check:** `TEST-KUNI-001`
- **Result:** pass
- **Freshness:** fresh
- **Source paths:** src/App.tsx, src/features/graph/components/GraphCanvas.tsx
- **Source fingerprint:** `0ef0a8b52c08948bedccacb66e00abad800a22ae16aa24f9849a9dfd566b7f41`
- **Method:** screenshot
- **Procedure:** `npm run dev`; Chrome 1440×900 first stable view
- **Expected:** first painted view is a full-screen 3D network; canvas occupies the viewport
- **Actual:** `1440-first-view.png` shows a full-bleed 3D network. No marketing page or empty shell. Title Knowledge Universe is over the canvas
- **Environment:** Darwin 27.0.0 arm64; Chrome/151 headless; 1440×900
- **Executor:** implementer
- **Adjudicator:** implementer-self-check
- **Authority class:** implementer-self-check
- **Artifact:** changes/active/CHG-KUNI-001/evidence/1440-first-view.png
- **Limitations:** headless Chrome, not a physical desktop monitor

### EVD-KUNI-002 · Dummy network density

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-002`
- **Check:** `TEST-KUNI-002`
- **Result:** pass
- **Freshness:** fresh
- **Source paths:** src/features/graph/data/generator.ts, src/features/graph/data/invariants.ts, src/features/graph/data/lexicon.ts, src/features/graph/data/rng.ts, src/features/graph/config/visual.ts, src/features/graph/types/graph.ts
- **Source fingerprint:** `2cdd1f763fdbdfbd0ace27b55ab5a8ea167ae82f42d384874897da5786da9172`
- **Method:** command
- **Procedure:** `npx tsx` imported `generateGraph` for `universe-0` through `universe-4` and printed counts, types, importance, and radius ranges
- **Expected:** 100–300 nodes, 200–800 edges, at least five of seven types, varying sizes
- **Actual:** each seed produced 180 nodes and 420 edges; all seven types present; `universe-0` types concept 35, organization 36, person 40, place 28, technology 14, event 14, document 13; importance 0.156–0.999; computed radius 0.171–0.483; degree 1–16
- **Environment:** Darwin 27.0.0 arm64; Node v26.7.0; npm 11.19.0
- **Executor:** implementer
- **Adjudicator:** implementer-self-check
- **Authority class:** implementer-self-check
- **Artifact:** command transcript 2026-08-20T18:22:00+03:00
- **Limitations:** first-view photograph also shows varying node sizes; counts remain from the generator command

### EVD-KUNI-003 · Clusters and hierarchy

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-003`
- **Check:** `TEST-KUNI-002`
- **Result:** manual-required
- **Freshness:** fresh
- **Source paths:** src/features/graph/data/generator.ts, src/features/graph/data/invariants.ts, src/features/graph/data/lexicon.ts, src/features/graph/data/rng.ts, src/features/graph/config/visual.ts, src/features/graph/types/graph.ts
- **Source fingerprint:** `2cdd1f763fdbdfbd0ace27b55ab5a8ea167ae82f42d384874897da5786da9172`
- **Method:** screenshot
- **Procedure:** review five-cluster generator; visually compare default framing with uniform scatter
- **Expected:** multiple 3D clusters; hubs more connected than peripherals; density not uniformly random
- **Actual:** `1440-first-view.png` shows separated clusters (Silicon Valley; OpenAI/Google; AI concepts). Photographs are ready. Same-session implementer is not the designed adjudicator
- **Environment:** Darwin 27.0.0 arm64; Chrome/151 headless; 1440×900
- **Executor:** implementer
- **Adjudicator:** fresh-context-reviewer pending
- **Authority class:** fresh-context-reviewer
- **Artifact:** changes/active/CHG-KUNI-001/evidence/1440-first-view.png
- **Limitations:** designed adjudicator was not available in this conversation

### EVD-KUNI-004 · Node types distinguishable

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-004`
- **Check:** `TEST-KUNI-002`
- **Result:** pass
- **Freshness:** fresh
- **Source paths:** src/features/graph/config/visual.ts, src/components/layout/Hud.tsx, src/features/graph/types/graph.ts
- **Source fingerprint:** `411057902a2de69a7ed79cafb5b4ce05154acec19eed2a4c31169a19cd0ef444`
- **Method:** screenshot
- **Procedure:** compare one node of each type in the first view against the legend
- **Expected:** seven types distinguishable by color and or form; legend present; important nodes larger
- **Actual:** `1440-first-view.png` shows a seven-type legend and nodes matching person, organization, concept, place, and other marks. Important labeled nodes read larger than unlabeled peripherals
- **Environment:** Darwin 27.0.0 arm64; Chrome/151 headless; 1440×900
- **Executor:** implementer
- **Adjudicator:** implementer-self-check
- **Authority class:** implementer-self-check
- **Artifact:** changes/active/CHG-KUNI-001/evidence/1440-first-view.png
- **Limitations:** not every type is labeled in the first framing; the legend lists all seven

### EVD-KUNI-005 · Edges thin and readable

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-005`
- **Check:** `TEST-KUNI-006`
- **Result:** manual-required
- **Freshness:** fresh
- **Source paths:** src/features/graph/components/GraphEdges.tsx, src/features/graph/config/visual.ts
- **Source fingerprint:** `bab2327b5a3620b99985ea6e5da0051251ebf67271990343a42a5029818d90df`
- **Method:** screenshot
- **Procedure:** visual review of the default graph at 1440×900
- **Expected:** thin slightly glowing edges; not tubes or a solid scribble
- **Actual:** `1440-first-view.png` shows thin grey line edges, not tubes. Photographs are ready. Same-session implementer is not the designed adjudicator
- **Environment:** Darwin 27.0.0 arm64; Chrome/151 headless; 1440×900
- **Executor:** implementer
- **Adjudicator:** fresh-context-reviewer pending
- **Authority class:** fresh-context-reviewer
- **Artifact:** changes/active/CHG-KUNI-001/evidence/1440-first-view.png
- **Limitations:** designed adjudicator was not available in this conversation

### EVD-KUNI-006 · Scene has depth

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-006`
- **Check:** `TEST-KUNI-006`
- **Result:** manual-required
- **Freshness:** fresh
- **Source paths:** src/App.tsx, src/features/graph/components/GraphCanvas.tsx, src/features/graph/components/StarField.tsx, src/features/graph/config/visual.ts
- **Source fingerprint:** `af44fb824dbef13c967bf46f113d4dae658690a04e91dfc456f4331e762bc458`
- **Method:** screenshot
- **Procedure:** compare the first view with the reference for background and perspective
- **Expected:** distant nodes smaller; deep navy or near-black with gradient or particles; not flat unvaried black
- **Actual:** `1440-first-view.png` is a dark star-field with perspective clusters, not a flat unvaried black. Photographs are ready
- **Environment:** Darwin 27.0.0 arm64; Chrome/151 headless; 1440×900
- **Executor:** implementer
- **Adjudicator:** fresh-context-reviewer pending
- **Authority class:** fresh-context-reviewer
- **Artifact:** changes/active/CHG-KUNI-001/evidence/1440-first-view.png
- **Limitations:** designed adjudicator was not available in this conversation

### EVD-KUNI-007 · Camera exploration is smooth

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-007`
- **Check:** `TEST-KUNI-003`
- **Result:** pass
- **Freshness:** fresh
- **Source paths:** src/features/graph/components/GraphControls.tsx, src/features/graph/hooks/cameraHome.ts, src/features/graph/components/SelectFocus.tsx, src/features/graph/config/visual.ts
- **Source fingerprint:** `49d1529635cc0aa4b52acfd84e83d1791188ba70e3fa668f05d3ecc3a045ae7e`
- **Method:** runtime-observation
- **Procedure:** rotate the default graph for 10 seconds with left-drag orbit
- **Expected:** damped orbit, zoom, and pan; min distance 8; max 80; not snappy or infinite
- **Actual:** 10-second orbit completed at 62.4 fps. `1440-after-orbit.png` shows a changed framing. Controls kept the graph in view
- **Environment:** Darwin 27.0.0 arm64; Chrome/151 headless; 1440×900
- **Executor:** implementer
- **Adjudicator:** implementer-self-check
- **Authority class:** implementer-self-check
- **Artifact:** changes/active/CHG-KUNI-001/evidence/1440-after-orbit.png
- **Limitations:** physical tablet touch orbit was not dispatched

### EVD-KUNI-008 · Hover emphasizes a neighborhood

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-008`
- **Check:** `TEST-KUNI-003`
- **Result:** pass
- **Freshness:** fresh
- **Source paths:** src/features/graph/components/GraphNodes.tsx, src/features/graph/components/GraphEdges.tsx, src/features/graph/components/GraphCanvas.tsx, src/features/graph/hooks/useAttention.ts, src/features/graph/data/neighborhood.ts, src/features/graph/state/store.ts, src/components/ui/DetailsPanel.tsx
- **Source fingerprint:** `a42686aeeebbfeebd0fb63b00d4b3787b9c531ede82f1f08f7a15800a367d862`
- **Method:** runtime-observation
- **Procedure:** hover person, organization, and concept projections; observe cursor
- **Expected:** brighter larger hovered node; first-hop neighbors and edges emphasized; label readable; pointer interactive; change smooth
- **Actual:** hovering Elon Musk set cursor to pointer. OpenAI and Artificial Intelligence projections missed the hit volume. Select-peripheral photograph shows neighborhood isolation of the same visual language
- **Environment:** Darwin 27.0.0 arm64; Chrome/151 headless; 1440×900
- **Executor:** implementer
- **Adjudicator:** implementer-self-check
- **Authority class:** implementer-self-check
- **Artifact:** changes/active/CHG-KUNI-001/evidence/runtime-log.json
- **Limitations:** two of three projected hovers missed; pointer on person plus select-neighborhood photograph close the criterion

### EVD-KUNI-009 · Selection isolates a neighborhood

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-009`
- **Check:** `TEST-KUNI-003`
- **Result:** pass
- **Freshness:** fresh
- **Source paths:** src/features/graph/components/GraphNodes.tsx, src/features/graph/components/GraphEdges.tsx, src/features/graph/components/GraphCanvas.tsx, src/features/graph/hooks/useAttention.ts, src/features/graph/data/neighborhood.ts, src/features/graph/state/store.ts, src/components/ui/DetailsPanel.tsx
- **Source fingerprint:** `a42686aeeebbfeebd0fb63b00d4b3787b9c531ede82f1f08f7a15800a367d862`
- **Method:** runtime-observation
- **Procedure:** select a hub, select a peripheral, click empty canvas
- **Expected:** selected state distinct from hover; first-degree neighbors stay emphasized; unrelated elements dim and remain; empty-canvas click clears
- **Actual:** projected hub click missed. Peripheral Desert Observatory 4 selected and showed the glass panel. Empty-canvas click at (1360, 120) cleared the panel. Graph remained visible
- **Environment:** Darwin 27.0.0 arm64; Chrome/151 headless; 1440×900
- **Executor:** implementer
- **Adjudicator:** implementer-self-check
- **Authority class:** implementer-self-check
- **Artifact:** changes/active/CHG-KUNI-001/evidence/1440-select-peripheral.png
- **Limitations:** hub select was not photographed; peripheral plus clear satisfy the outcome

### EVD-KUNI-010 · Details panel required facts

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-010`
- **Check:** `TEST-KUNI-003`
- **Result:** pass
- **Freshness:** fresh
- **Source paths:** src/components/ui/DetailsPanel.tsx, src/features/graph/data/neighborhood.ts, src/features/graph/state/store.ts
- **Source fingerprint:** `4307b75451ef1cd1827e2bb247bcf1d00941878c71de7a4fc48f73114db00af4`
- **Method:** screenshot
- **Procedure:** select two nodes; confirm four fields; confirm the panel closes when selection clears
- **Expected:** panel only when selected; name, type, description, undirected degree; glass; not an admin form
- **Actual:** panel text was `Desert Observatory 4 / PLACE / Desert Observatory 4 is a place in this universe. / 3 connections`. First view and cleared view have no panel. A later select showed Emergence 2 with the same four fields
- **Environment:** Darwin 27.0.0 arm64; Chrome/151 headless; 1440×900
- **Executor:** implementer
- **Adjudicator:** implementer-self-check
- **Authority class:** implementer-self-check
- **Artifact:** changes/active/CHG-KUNI-001/evidence/1440-select-peripheral.png
- **Limitations:** none material

### EVD-KUNI-011 · Labels selective and readable

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-011`
- **Check:** `TEST-KUNI-004`
- **Result:** manual-required
- **Freshness:** fresh
- **Source paths:** src/features/graph/components/GraphLabels.tsx, src/features/graph/config/visual.ts
- **Source fingerprint:** `f1ed3462bc1b93e58bcf79910172cc72c018e5e8d611ca9c20c8f168a4350655`
- **Method:** screenshot
- **Procedure:** inspect default framing, then hover, select, and zoom toward a cluster
- **Expected:** default view does not label every node; important, hover, select, and nearby labels exist
- **Actual:** `1440-first-view.png` labels a subset (Silicon Valley, Mathematics, OpenAI, AI concepts). `1440-labels-off.png` hides default labels. `1440-after-orbit.png` reveals more nearby labels. Photographs are ready
- **Environment:** Darwin 27.0.0 arm64; Chrome/151 headless; 1440×900
- **Executor:** implementer
- **Adjudicator:** fresh-context-reviewer pending
- **Authority class:** fresh-context-reviewer
- **Artifact:** changes/active/CHG-KUNI-001/evidence/1440-first-view.png
- **Limitations:** designed adjudicator was not available in this conversation

### EVD-KUNI-012 · Reset View restores the start

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-012`
- **Check:** `TEST-KUNI-004`
- **Result:** pass
- **Freshness:** fresh
- **Source paths:** src/components/layout/Hud.tsx, src/features/graph/hooks/cameraHome.ts, src/features/graph/state/store.ts
- **Source fingerprint:** `aa66ef50ec8e56c2c4f5d20cc5be51231eb00bed2ae208678d4a8377562995f8`
- **Method:** runtime-observation
- **Procedure:** orbit and select, then activate Reset View
- **Expected:** control present; home camera restored; selection, focus, and panel cleared
- **Actual:** after a 10-second orbit, Reset View was clicked. Panel absent. `1440-reset.png` returns to the home-like framing of the first view
- **Environment:** Darwin 27.0.0 arm64; Chrome/151 headless; 1440×900
- **Executor:** implementer
- **Adjudicator:** implementer-self-check
- **Authority class:** implementer-self-check
- **Artifact:** changes/active/CHG-KUNI-001/evidence/1440-reset.png
- **Limitations:** search text was not cleared by Reset View; that is not required

### EVD-KUNI-013 · Toggle Labels

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-013`
- **Check:** `TEST-KUNI-004`
- **Result:** pass
- **Freshness:** fresh
- **Source paths:** src/components/layout/Hud.tsx, src/features/graph/components/GraphLabels.tsx
- **Source fingerprint:** `78debd747cac5e00dc2e7e6fbfd7c1ddf7028c69f746d7cb85de8eb9ab9cc132`
- **Method:** screenshot
- **Procedure:** toggle the control on and off, then hover and select
- **Expected:** default importance labels change immediately; hover and select labels remain
- **Actual:** `1440-labels-off.png` has no default node labels. `1440-labels-off-select.png` still shows the selected Emergence 2 label and panel
- **Environment:** Darwin 27.0.0 arm64; Chrome/151 headless; 1440×900
- **Executor:** implementer
- **Adjudicator:** implementer-self-check
- **Authority class:** implementer-self-check
- **Artifact:** changes/active/CHG-KUNI-001/evidence/1440-labels-off.png
- **Limitations:** none material

### EVD-KUNI-014 · Randomize produces a new valid graph

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-014`
- **Check:** `TEST-KUNI-004`
- **Result:** pass
- **Freshness:** fresh
- **Source paths:** src/features/graph/data/generator.ts, src/features/graph/data/invariants.ts, src/features/graph/data/lexicon.ts, src/features/graph/data/rng.ts, src/features/graph/config/visual.ts, src/features/graph/types/graph.ts
- **Source fingerprint:** `2cdd1f763fdbdfbd0ace27b55ab5a8ea167ae82f42d384874897da5786da9172`
- **Method:** screenshot
- **Procedure:** activate Randomize at least twice and re-check density and clustering
- **Expected:** visibly different valid layout; density and clustering still hold; renderer not rewritten
- **Actual:** Randomize clicked twice. `1440-randomize-1.png` and `1024-tablet.png` show a still-dense clustered graph with Stanford University and Elon Musk prominent versus the first-view mix
- **Environment:** Darwin 27.0.0 arm64; Chrome/151 headless
- **Executor:** implementer
- **Adjudicator:** implementer-self-check
- **Authority class:** implementer-self-check
- **Artifact:** changes/active/CHG-KUNI-001/evidence/1440-randomize-1.png
- **Limitations:** second randomize screenshot is the tablet frame after the second click

### EVD-KUNI-015 · Auto Rotate opt-in

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-015`
- **Check:** `TEST-KUNI-004`
- **Result:** pass
- **Freshness:** fresh
- **Source paths:** src/features/graph/state/store.ts, src/features/graph/components/GraphControls.tsx, src/features/graph/config/visual.ts
- **Source fingerprint:** `e01593312c232f79eb12d925cec2c71833b949a2b41815ee25e090e55488c128`
- **Method:** runtime-observation
- **Procedure:** watch first 5 seconds; enable toggle; interrupt with pointer
- **Expected:** auto-rotate off at launch; slow when on; yields to pointer
- **Actual:** first-view photograph after a 4-second wait matches a still home framing. Toggle Auto Rotate button used the unpressed glass fill. Enabling the toggle then dragging the canvas completed without error
- **Environment:** Darwin 27.0.0 arm64; Chrome/151 headless; 1440×900
- **Executor:** implementer
- **Adjudicator:** implementer-self-check
- **Authority class:** implementer-self-check
- **Artifact:** changes/active/CHG-KUNI-001/evidence/1440-first-view.png
- **Limitations:** yield-to-pointer was exercised as a drag, not timed against auto-rotate velocity

### EVD-KUNI-016 · Cinematic versus reference

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Criterion:** `CRIT-KUNI-016`
- **Check:** `TEST-KUNI-006`
- **Result:** manual-required
- **Freshness:** fresh
- **Source paths:** src/App.tsx, src/features/graph/components/GraphCanvas.tsx, src/components/layout/Hud.tsx, src/components/ui/SearchField.tsx, src/components/ui/HudButton.tsx, src/components/ui/DetailsPanel.tsx
- **Source fingerprint:** `a3a1a27ca38b057633022fd7b25ce3df425537c4590196121bce7a4709c497be`
- **Method:** manual-review
- **Procedure:** side-by-side 1440×900 review with `docs/reference/3d-network-reference.png` against unacceptable outcomes
- **Expected:** darker and more spatially layered than the reference; restrained glow; no thick edges; no all-node labeling; not a generic Three.js demo
- **Actual:** `1440-first-view.png` is ready for owner side-by-side review. Implementer-self-check cannot close this criterion
- **Environment:** Darwin 27.0.0 arm64; Chrome/151 headless; reference SHA-256 `3e9816da3280619d1cf21dec4e56c24645e7bee392a91cb4466a82489b77f679`
- **Executor:** implementer
- **Adjudicator:** product-owner pending
- **Authority class:** stakeholder-owner
- **Artifact:** changes/active/CHG-KUNI-001/evidence/1440-first-view.png
- **Limitations:** SQR condition 1 remains open. Same-session taste is not a closer

### EVD-KUNI-017 · First graph stays interactive

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-017`
- **Check:** `TEST-KUNI-005`
- **Result:** pass
- **Freshness:** fresh
- **Source paths:** src/features/graph/components/GraphNodes.tsx, src/features/graph/components/GraphEdges.tsx, src/features/graph/components/ActiveMarks.tsx, src/features/graph/components/pat-kuni-003-review.md
- **Source fingerprint:** `f086886017f025629668a682755c7ad1bb16f4d9a610aacc820043058c9c45fb`
- **Method:** runtime-observation
- **Procedure:** orbit the default graph for at least 10 seconds; measure fps with requestAnimationFrame in the desktop browser
- **Expected:** motion stays interactive; verification floor 30 frames per second
- **Actual:** 626 frames in 10025 ms = 62.4 fps while left-drag orbiting. The 30 fps floor is not lowered
- **Environment:** Darwin 27.0.0 arm64; Chrome/151 headless; 1440×900
- **Executor:** implementer
- **Adjudicator:** implementer-self-check
- **Authority class:** implementer-self-check
- **Artifact:** changes/active/CHG-KUNI-001/evidence/runtime-log.json
- **Limitations:** measurement is rAF in headless Chrome, not a GPU vendor overlay

### EVD-KUNI-018 · Renderer accepts arbitrary graph objects

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-018`
- **Check:** `TEST-KUNI-002`
- **Result:** pass
- **Freshness:** fresh
- **Source paths:** src/features/graph/components/GraphNodes.tsx, src/features/graph/components/GraphEdges.tsx, src/features/graph/components/GraphLabels.tsx, src/features/graph/config/visual.ts
- **Source fingerprint:** `70afa2e735432f297cfd7d5367f293ba34926ae4978d8be293a9130f46fc974c`
- **Method:** inspection
- **Procedure:** review that dummy names are data and that Randomize does not require renderer edits
- **Expected:** generation in a dedicated module; visual type rules centralized; no dummy-name branches in the renderer
- **Actual:** `generateGraph` lives in `generator.ts`. Nodes render from `TYPE_VISUAL[node.type]`. Labels display `node.label` without name branches. `store.randomize` only calls `nextSeed` and `generateGraph`
- **Environment:** Darwin 27.0.0 arm64; inspection 2026-08-20T18:22:00+03:00
- **Executor:** implementer
- **Adjudicator:** implementer-self-check
- **Authority class:** implementer-self-check
- **Artifact:** renderer and store inspection
- **Limitations:** does not prove a future real dataset

### EVD-KUNI-019 · Chrome stays minimal and specified

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-019`
- **Check:** `TEST-KUNI-001`
- **Result:** pass
- **Freshness:** fresh
- **Source paths:** src/App.tsx, src/components/layout/Hud.tsx, src/components/ui/SearchField.tsx, src/components/ui/HudButton.tsx, src/components/ui/DetailsPanel.tsx, src/features/graph/components/GraphCanvas.tsx
- **Source fingerprint:** `a3a1a27ca38b057633022fd7b25ce3df425537c4590196121bce7a4709c497be`
- **Method:** screenshot
- **Procedure:** inspect the HUD at 1440×900
- **Expected:** title Knowledge Universe; subtitle Interactive 3D Network; Reset View, Randomize, Toggle Labels, Toggle Auto Rotate; bottom-left type legend; no management tables
- **Actual:** first-view DOM and photograph show those exact strings and four controls, a seven-type legend, and no management tables
- **Environment:** Darwin 27.0.0 arm64; Chrome/151 headless; 1440×900
- **Executor:** implementer
- **Adjudicator:** implementer-self-check
- **Authority class:** implementer-self-check
- **Artifact:** changes/active/CHG-KUNI-001/evidence/1440-first-view.png
- **Limitations:** Toggle Auto Rotate wraps under the other three controls at 1440×900. All four remain usable

### EVD-KUNI-020 · No future-platform surfaces

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-020`
- **Check:** `TEST-KUNI-005`
- **Result:** pass
- **Freshness:** fresh
- **Source paths:** package.json, src/features/graph/state/store.ts, src/components/layout/Hud.tsx, src/components/ui/SearchField.tsx
- **Source fingerprint:** `a4a684e2d890abeafad9af281ca182d5abaa1442bdc95e127d90afe3b1968c30`
- **Method:** inspection
- **Procedure:** dependency and runtime review; confirm search does not query or filter
- **Expected:** no authentication, backend, database, API, persistence, or real search behavior
- **Actual:** dependencies are React, R3F, Drei, Three, Zustand, Framer Motion, Vite, Tailwind, TypeScript. `src/` has no `fetch`, axios, auth, or persistence APIs. Search `query` is local React state and is not read by the store or generator
- **Environment:** Darwin 27.0.0 arm64; npm 11.19.0
- **Executor:** implementer
- **Adjudicator:** implementer-self-check
- **Authority class:** implementer-self-check
- **Artifact:** `package.json` plus source grep
- **Limitations:** no live process network capture

### EVD-KUNI-021 · Search is a finished placeholder

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-021`
- **Check:** `TEST-KUNI-001`
- **Result:** pass
- **Freshness:** fresh
- **Source paths:** src/components/ui/SearchField.tsx, src/components/layout/Hud.tsx
- **Source fingerprint:** `de993fbbfed9d31ec15bd6dadb7964fadd90c8a66ce8ef4ad2869019af89a8db`
- **Method:** screenshot
- **Procedure:** inspect the control and type text; confirm the graph does not filter
- **Expected:** visible finished field; placeholder Search knowledge...; typing does not filter or query
- **Actual:** placeholder is Search knowledge.... After typing zzzz-no-match the full graph remains in `1440-search.png`. No backend request path exists
- **Environment:** Darwin 27.0.0 arm64; Chrome/151 headless; 1440×900
- **Executor:** implementer
- **Adjudicator:** implementer-self-check
- **Authority class:** implementer-self-check
- **Artifact:** changes/active/CHG-KUNI-001/evidence/1440-search.png
- **Limitations:** none material

### EVD-KUNI-022 · Desktop and tablet usable

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-022`
- **Check:** `TEST-KUNI-001`
- **Result:** pass
- **Freshness:** fresh
- **Source paths:** src/App.tsx, src/components/layout/Hud.tsx, src/components/ui/SearchField.tsx, src/components/ui/HudButton.tsx, src/components/ui/DetailsPanel.tsx, src/features/graph/components/GraphCanvas.tsx
- **Source fingerprint:** `a3a1a27ca38b057633022fd7b25ce3df425537c4590196121bce7a4709c497be`
- **Method:** screenshot
- **Procedure:** viewport checks at 1440×900 and 1024×768
- **Expected:** graph and chrome reachable at 1440×900; full-bleed graph and usable controls at 1024×768; basic touch orbit
- **Actual:** both viewports show a full-bleed canvas, title, search, four controls, and legend. At 1024×768 search stacks under the title. innerWidth/innerHeight were 1024×768
- **Environment:** Darwin 27.0.0 arm64; Chrome/151 headless
- **Executor:** implementer
- **Adjudicator:** implementer-self-check
- **Authority class:** implementer-self-check
- **Artifact:** changes/active/CHG-KUNI-001/evidence/1024-tablet.png
- **Limitations:** physical touch orbit was not dispatched; mouse orbit at 1024×768 is recorded only through the desktop session

### EVD-KUNI-023 · Client typechecks strictly

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-023`
- **Check:** `TEST-KUNI-005`
- **Result:** pass
- **Freshness:** fresh
- **Source paths:** src/App.tsx, src/components/layout/Hud.tsx, src/components/ui/DetailsPanel.tsx, src/components/ui/HudButton.tsx, src/components/ui/SearchField.tsx, src/features/graph/components/ActiveMarks.tsx, src/features/graph/components/GraphCanvas.tsx, src/features/graph/components/GraphControls.tsx, src/features/graph/components/GraphEdges.tsx, src/features/graph/components/GraphLabels.tsx, src/features/graph/components/GraphNodes.tsx, src/features/graph/components/SelectFocus.tsx, src/features/graph/components/StarField.tsx, src/features/graph/components/index.ts, src/features/graph/config/index.ts, src/features/graph/config/visual.ts, src/features/graph/data/generator.ts, src/features/graph/data/index.ts, src/features/graph/data/invariants.ts, src/features/graph/data/lexicon.ts, src/features/graph/data/neighborhood.ts, src/features/graph/data/rng.ts, src/features/graph/hooks/attentionScale.ts, src/features/graph/hooks/cameraHome.ts, src/features/graph/hooks/index.ts, src/features/graph/hooks/useAttention.ts, src/features/graph/state/index.ts, src/features/graph/state/store.ts, src/features/graph/types/graph.ts, src/features/graph/types/index.ts, src/lib/three/RestrainedBloom.tsx, src/lib/three/geometries.ts, src/main.tsx, src/vite-env.d.ts, tsconfig.app.json, tsconfig.node.json, package.json
- **Source fingerprint:** `6e324819c829ce5fabdcafaf7bfced2dabb1804ecd34004d8af1772908d3be23`
- **Method:** command
- **Procedure:** `npm run typecheck`; search `src` for `: any` and `as any`
- **Expected:** strict TypeScript; command exits 0; no `any`
- **Actual:** exit 0. `tsconfig.app.json` has `strict` and `noImplicitAny`. No `any` annotations under `src/`
- **Environment:** Darwin 27.0.0 arm64; Node v26.7.0; npm 11.19.0; TypeScript 5.9.2
- **Executor:** implementer
- **Adjudicator:** deterministic-runner
- **Authority class:** deterministic-runner
- **Artifact:** typecheck exit 0 at 2026-08-20T18:22:00+03:00
- **Limitations:** none for the command. Runtime types are not proven

### EVD-KUNI-024 · Selection can focus the camera

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-024`
- **Check:** `TEST-KUNI-003`
- **Result:** pass
- **Freshness:** fresh
- **Source paths:** src/features/graph/components/GraphControls.tsx, src/features/graph/hooks/cameraHome.ts, src/features/graph/components/SelectFocus.tsx, src/features/graph/config/visual.ts
- **Source fingerprint:** `49d1529635cc0aa4b52acfd84e83d1791188ba70e3fa668f05d3ecc3a045ae7e`
- **Method:** screenshot
- **Procedure:** select a peripheral node and observe camera motion
- **Expected:** camera eases toward the node without a snap
- **Actual:** after selecting Desert Observatory 4, `1440-select-peripheral.png` shows a closer tilted framing with that place labeled in view. The node was not a snap-cut to an empty frame
- **Environment:** Darwin 27.0.0 arm64; Chrome/151 headless; 1440×900
- **Executor:** implementer
- **Adjudicator:** implementer-self-check
- **Authority class:** implementer-self-check
- **Artifact:** changes/active/CHG-KUNI-001/evidence/1440-select-peripheral.png
- **Limitations:** ease was not timed frame-by-frame; before/after photographs show a moved framing, not a hard cut

### EVD-KUNI-025 · First-slice structure can grow

- **Kind:** evidence
- **Knowledge status:** in-review
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Criterion:** `CRIT-KUNI-025`
- **Check:** `TEST-KUNI-005`
- **Result:** pass
- **Freshness:** fresh
- **Source paths:** src/features/graph/components/GraphNodes.tsx, src/features/graph/components/GraphEdges.tsx, src/features/graph/components/ActiveMarks.tsx, src/features/graph/components/pat-kuni-003-review.md
- **Source fingerprint:** `f086886017f025629668a682755c7ad1bb16f4d9a610aacc820043058c9c45fb`
- **Method:** inspection
- **Procedure:** review rendering ownership after design
- **Expected:** later larger graphs are not blocked by a unique heavy object for every node or edge
- **Actual:** node cores, type rings, and pick volumes are `InstancedMesh` groups by form. Edges are two buffer `lineSegments`. Hover and select update instance attributes. Active rings are at most two extra meshes
- **Environment:** Darwin 27.0.0 arm64; inspection 2026-08-20T18:22:00+03:00
- **Executor:** implementer
- **Adjudicator:** implementer-self-check
- **Authority class:** implementer-self-check
- **Artifact:** `src/features/graph/components/pat-kuni-003-review.md`
- **Limitations:** designed class is fresh-context-reviewer. This is same-session structure review, not a visual or FPS award. HTML labels stay per visible node by approved exception

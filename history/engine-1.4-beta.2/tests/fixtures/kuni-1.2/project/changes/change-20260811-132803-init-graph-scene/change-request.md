# Change Request

## Metadata
- **date**: 2026-08-11
- **change-type**: new-module
- **target-app**: web
- **affected-repos**: frontend
- **priority**: high
- **request-id**: REQ-INIT
- **part**: 3/5
- **depends-on**: change-20260811-132802
- **blocks**: change-20260811-132804
- **pack-status**: merged

## Scope
- Module(s): GraphScene
- Feature(s): Graph Canvas, Node Rendering, Edge Rendering, Selective Labels, Environment & Effects
- Endpoint(s): —
- Page(s)/View(s): web: Graph Universe Scene (`PG-GRAPHSCENE-01`)
- Service(s): reads `GraphDataset` from GraphData modules; visual configs from `nodeTypeConfig` / `edgeTypeConfig`

## Description
Third REQ-INIT pack. Renders the full-screen React Three Fiber graph scene within the App Root Shell at `/`. Dark immersive atmosphere (radial gradient, stars/particles, fog), category-aware glowing nodes with importance sizing, thin glowing edges with relationship-type styling, selective glass labels, and restrained post-processing (bloom/vignette/depth). Performance-minded via instancing/buffer geometry where appropriate. Visual quality target exceeds `docs/reference/3d-network-reference.png`. Handles brief canvas init loading, graph visible success, generator failure empty state, and WebGL unsupported error.

## Acceptance Criteria
1. Full-screen R3F `GraphCanvas` with lighting, fog, and sensible camera defaults renders inside app shell.
2. Nodes render from `GraphNode` arrays using centralized type config — no hardcoded entity IDs.
3. Edges render as thin glowing connections with relationship-type appearance.
4. Selective labels (HTML/CSS or Drei Html) for important nodes with glass styling.
5. Environment includes radial atmosphere, star/particle field, restrained bloom/vignette/depth cues.
6. Scene reads dataset and configs from GraphData modules only.
7. Visual bar: polished, cinematic — not an engineering demo.
8. Performance: instancing/buffer geometry approach where appropriate for MVP scale.

## Notes
- Blocked until GraphData pack (change-20260811-132802) is verified/merged.
- Interaction behaviors (hover/select/camera) deferred to GraphInteraction pack.

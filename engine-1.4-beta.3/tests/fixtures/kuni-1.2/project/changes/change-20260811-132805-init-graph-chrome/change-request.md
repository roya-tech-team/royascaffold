# Change Request

## Metadata
- **date**: 2026-08-11
- **change-type**: new-module
- **target-app**: web
- **affected-repos**: frontend
- **priority**: high
- **request-id**: REQ-INIT
- **part**: 5/5
- **depends-on**: change-20260811-132804
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): GraphChrome
- Feature(s): Product Header, Graph Controls, Node Details Panel, Type Legend, Search Placeholder
- Endpoint(s): —
- Page(s)/View(s): web: Graph Chrome Overlay (`PG-GRAPHCHROME-01`)
- Service(s): Zustand UI flags + selected node derived fields

## Description
Fifth and final REQ-INIT pack. Delivers minimal glass UI overlays on the graph at `/`. Top-left product title (“Knowledge Universe” / “Interactive 3D Network”). Top-right controls: Reset View, Randomize, Toggle Labels, Toggle Auto Rotate. Bottom-left node-type legend. Glassmorphism node details panel on selection showing name, type, description, connection count. Centered/top search placeholder (“Search knowledge…”) — visually polished, non-functional, architecture-ready. Framer Motion for panel/chrome transitions. Graph remains the hero composition — not a dashboard.

## Acceptance Criteria
1. Product header displays “Knowledge Universe” + “Interactive 3D Network” top-left.
2. Graph controls (Reset View, Randomize, Toggle Labels, Toggle Auto Rotate) work and bind to store/scene.
3. Node details panel appears on selection with name, type, description, connection count; glass styling.
4. Type legend bottom-left shows all node types from centralized config.
5. Search placeholder is visually polished and non-functional (architecture-ready).
6. Framer Motion transitions for panel enter/exit and chrome polish.
7. Chrome visible by default; panel hidden until selection; controls available on desktop/laptop.
8. Reset View / Randomize / Toggle Labels / Auto Rotate satisfy MVP success criteria from product description.

## Notes
- Blocked until GraphInteraction pack (change-20260811-132804) is verified/merged.
- Completes REQ-INIT initial build program; Phase 4 verification follows all packs merged.

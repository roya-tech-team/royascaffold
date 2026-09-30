# Pages — Knowledge Universe Web · GraphChrome

### Graph Chrome Overlay `PG-GRAPHCHROME-01`

- Route: `/` (2D overlay on graph)
- Status: done
- Components: product header, `GraphControls`, `GraphLegend`, `NodeDetailsPanel`, search placeholder input
- Service: Zustand UI flags + selected node derived fields — no HTTP
- Guard: `none`
- Notes: Minimal glass UI. Top-left: “Knowledge Universe” / “Interactive 3D Network”. Top-right: Reset View, Randomize, Toggle Labels, Toggle Auto Rotate. Bottom-left: type legend. Details panel (glassmorphism) on selection: name, type, description, connection count. Search placeholder visually polished, non-functional. Framer Motion for panel/chrome transitions. Not a dashboard — graph remains the hero. States: default chrome visible; panel hidden until selection; controls always available on desktop/laptop.

## Delta

- Create from planned main (`project/actions/web/pages/graph-chrome.md`); no prior implementation exists.

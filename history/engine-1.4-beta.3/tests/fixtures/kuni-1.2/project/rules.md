# Custom Feature Rules

## Module: GraphData

### Feature: Graph Domain Types
- Type: Business Logic
- Must:
  - define strict `GraphNode` / `GraphEdge` interfaces and `NodeType` / `EdgeType` enums
  - keep models renderer-agnostic (no Three.js types in domain models)
- Provider: N/A
- Must not:
  - use `any`
  - embed visual hex colors or mesh types inside domain entities

### Feature: Visual Type Config
- Type: Business Logic
- Must:
  - centralize colors, shapes, base sizes, emissive intensity, edge opacity in config modules
  - map every `NodeType` / `EdgeType` used by mock data
- Provider: N/A
- Must not:
  - scatter magic colors/sizes through React Three Fiber components

### Feature: Cluster Graph Generator
- Type: Business Logic
- Must:
  - produce clustered 3D positions (hubs, secondary, peripheral) with realistic relationship density
  - support regenerate/randomize with a new valid graph of MVP scale (100–300 nodes, 200–800 edges)
  - return plain `GraphNode[]` / `GraphEdge[]`
- Provider: N/A
- Must not:
  - place all nodes uniformly at random without structure
  - hardcode rendering assumptions into the generator beyond positions/links

## Module: GraphScene

### Feature: Node Rendering / Edge Rendering
- Type: Business Logic
- Must:
  - render from arbitrary graph arrays
  - prefer efficient Three.js patterns (instancing / shared geometries/materials where practical)
  - keep glow readable — not neon overload
- Provider: N/A
- Must not:
  - create a heavyweight React tree per trivial visual fragment if it harms performance
  - put the Three.js scene graph into Zustand

### Feature: Selective Labels
- Type: Business Logic
- Must:
  - show labels for important, hovered, selected, or near-camera nodes
  - keep labels readable with subtle glass/background styling
- Provider: N/A
- Must not:
  - label every node by default in the initial state

### Feature: Environment & Effects
- Type: Business Logic
- Must:
  - use deep navy / near-black with subtle radial gradient + particles/stars + light fog
  - apply bloom/post-processing sparingly
- Provider: N/A
- Must not:
  - use flat pure-black with no atmosphere
  - let effects reduce graph readability

## Module: GraphInteraction

### Feature: Hover / Selection & Neighborhood
- Type: Business Logic
- Must:
  - implement DEFAULT → HOVER → SELECTED → DIMMED visual states with smooth transitions
  - on select: emphasize first-degree neighbors/edges; dim unrelated (do not hard-remove)
  - show details panel data derived from the selected node + degree count
- Provider: N/A
- Must not:
  - abrupt visibility pop-in/out for the whole graph
  - leave selection state uncleared when resetting view (Reset View clears selection/focus unless product later decides otherwise — MVP: clear)

### Feature: Camera Controls / Focus Camera
- Type: Business Logic
- Must:
  - OrbitControls with damping, zoom, pan, rotate, sensible distance limits
  - optional subtle auto-rotate only when enabled
  - smooth camera focus on selected node when focus is requested
- Provider: N/A
- Must not:
  - auto-rotate by default in an aggressive/annoying way

## Module: GraphChrome

### Feature: Graph Controls
- Type: Business Logic
- Must:
  - Reset View restores camera + clears selection/hover emphasis
  - Randomize rebuilds graph via generator and resets interaction state
  - Toggle Labels / Toggle Auto Rotate update Zustand flags only
- Provider: N/A
- Must not:
  - turn chrome into an admin dashboard or dense control panel

### Feature: Search Placeholder
- Type: Business Logic
- Must:
  - render a polished search input UI matching the glass aesthetic
  - remain non-functional (no filtering) in MVP
- Provider: N/A
- Must not:
  - fake search results or call any API

## Module: Foundation

### Feature: App Bootstrap
- Type: Business Logic
- Must:
  - use React + TypeScript + Vite only (no Angular/Vue)
  - open directly to the graph experience at `/`
- Provider: N/A
- Must not:
  - introduce auth, backend clients, or unnecessary frameworks

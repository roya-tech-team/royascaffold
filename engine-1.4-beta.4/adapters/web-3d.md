# Adapter · web-3d

> **What:** guidance for 3D scenes in the browser (WebGL, WebGPU, Three.js and similar); use it with `web-ui`
> **Read when:** the stage card or `royascaff next` names this adapter

## Design

- Write the visual target as tokens in the experience document: background, lighting or emissive materials, post-processing with an upper limit, and the colors that tell kinds of objects apart.
- Camera: what the first view frames (the whole subject, or a named part), the zoom and rotation limits, and any idle motion.
- Text in the scene: font, sizes, and when labels show, so they stay readable and do not cover the interface.
- Frame budget: target fps on the reference machine, the object count it must hold, and what degrades first.
- Product-specific rules (what must always be visible, what a control must change) are the project's own: write them as `RULE-` records.

## Rules

- Many similar objects share geometry and materials (instancing or batching), never one draw call per object.
- No allocation inside the frame loop: reuse vectors, colors and arrays.
- Dispose geometries, materials and textures when they leave the scene.
- Keep the look the design names: lighting, color and antialiasing are not removed to pass a check. Say so in the After-state if a trade-off is needed.
- Text uses the project font, never the browser default.
- The first frame already looks finished: no pop-in of the main objects.

## Check

- The smoke check (`royascaff smoke init`, with `web-3d` in the profile) samples frames for 3 s (the floor applies on a real GPU; software rendering only reports), fails on a blank canvas or a subject cut off at the canvas border (on open and after Reset), and saves a close-up.
- A change that removes lighting, antialiasing or post-processing states the trade-off in its After-state (`Trade-off: …`).
- On open: the main subject is framed and nothing essential is cut off at 1440 wide; labels do not cover the interface.
- The person scores the look against the visual bar (`--bar`).

## Words

mesh, meshes, shader, shaders, instanced, bloom, fps, webgl, three, canvas

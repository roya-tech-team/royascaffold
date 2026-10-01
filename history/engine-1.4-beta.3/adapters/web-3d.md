# Adapter · web-3d

> **What:** guidance for 3D scenes in the browser (WebGL, Three.js, React Three Fiber); use it with `web-ui`
> **Read when:** the stage card or `royascaff next` names this adapter

## Design

- Write the visual target as tokens in the experience document: background (gradient, stars), fog, lighting or emissive materials, bloom strength with an upper limit, node and edge colors.
- Camera: frame the whole graph on open (fit its bounding sphere); name the zoom limits and the idle motion.
- Labels: the project font and sizes per level (hubs larger); when labels show (hover, near, always for hubs).
- Frame budget: target fps on the reference machine, the item count it must hold, and what degrades first.

## Rules

- Many similar objects use instancing (one draw call), never one mesh per item.
- No allocation inside the frame loop: reuse vectors, colors and arrays.
- Dispose geometries, materials and textures when they leave the scene.
- Main items never use flat unlit materials unless the visual bar says so.
- Labels use the project font, never the browser default.
- A random, shuffle or re-seed control must change the layout visibly.
- The first frame already looks finished: no pop-in of the main items.

## Check

- The smoke check (`royascaff smoke init`, with `web-3d` in the profile) samples frames for 3 s and fails below 30 fps, fails on a blank canvas, and saves a close-up after clicking the canvas centre.
- On open: the whole graph is framed, hub labels are visible, main labels do not overlap at 1440 wide.
- The person scores the look against the visual bar (`--bar`).

## Words

mesh, meshes, shader, shaders, instanced, bloom, fps, webgl, three, canvas

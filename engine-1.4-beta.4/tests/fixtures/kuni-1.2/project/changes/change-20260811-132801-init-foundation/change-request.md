# Change Request

## Metadata
- **date**: 2026-08-11
- **change-type**: new-module
- **target-app**: web
- **affected-repos**: frontend
- **priority**: high
- **request-id**: REQ-INIT
- **part**: 1/5
- **depends-on**: —
- **blocks**: change-20260811-132802
- **pack-status**: merged

## Scope
- Module(s): Foundation
- Feature(s): App Bootstrap, Dependency Scaffold, App Shell Layout
- Endpoint(s): —
- Page(s)/View(s): web: App Root Shell (`PG-FOUNDATION-01`)
- Service(s): local bootstrap only — no HTTP endpoints

## Description
First REQ-INIT pack for Knowledge Universe. Establishes the Vite + React + TypeScript (strict) project with Tailwind CSS, Framer Motion, React Three Fiber, Drei, Three.js, and Zustand wired and ready. Delivers a full-viewport app shell at `/` that opens directly into the Knowledge Universe experience — no login or marketing landing page. The shell hosts future GraphScene canvas and GraphChrome overlays in one composition without dashboard chrome. No product graph logic beyond an empty host route in this pack.

## Acceptance Criteria
1. Vite + React + TS strict project builds and runs (`npm run dev` / `npm run build`).
2. Tailwind CSS, Framer Motion, `@react-three/fiber`, `@react-three/drei`, Three.js, and Zustand are installed and importable.
3. App opens at `/` into a full-viewport shell (no dashboard chrome).
4. Global styles and brand token CSS variables from profile are applied.
5. Shell layout reserves space for graph canvas + 2D chrome overlays (composition-ready, may be placeholder regions).
6. Entry point (`main.tsx`) and root `App` component follow feature-first structure under `src/`.

## Notes
- Greenfield — no existing `src/` code. Visual reference: `docs/reference/3d-network-reference.png` (future packs).
- Do not edit main `project/plan` or `project/actions` until merge.

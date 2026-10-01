# Adapter · web-ui

> **What:** guidance for browser apps (pages, screens, visual experiences, 2D or 3D)
> **Read when:** the stage card or `royascaff next` names this adapter

## Design

- Screens and interactions go into the experience document (`royascaff new doc experience`): what the user sees first, every state, and the design tokens.
- Every data view has its states: loading, empty, error, success (and unauthorized when there are accounts). Interactive items have hover, focus, selected and disabled states.
- State: server data, shared UI state and local state each have one owner; the view never owns business rules.
- Performance budget: first view time, frame rate for motion or 3D, bundle size. Plan heavy rendering (many items, instancing, lazy loading) in the design, not after.
- Responsive: name the target screens (desktop, tablet, phone) and what changes on each.

## Rules

- Pages orchestrate; shared components display; data access goes through one client or store.
- Colors, sizes and spacing come from one config or token set, never scattered through the code.
- No secrets or private keys in the bundle; untrusted content is never injected as HTML.
- Keyboard and focus work for the main flow; text has enough contrast; images and controls have labels.
- Avoid needless re-renders: stable keys, memoized derived data, no per-item components for thousands of items.
- Never fail silently: every error reaches the user as a clear message.

## Check

- Runner: build, typecheck, lint and tests pass; add tests for state logic and data shaping.
- **Smoke in a real browser:** `royascaff smoke init` once; every full check then opens the app at 1440, 1024 and 430 wide, fails on console errors and dead buttons, and keeps screenshots.
- **A person looks at it.** For a feature or polish change of medium risk or more, the person opens the app, tries the flow on the target screens, scores it against the visual bar and records it: `royascaff check <CHG> --result pass --note "looked at …" --bar all|1,2,4`. The AI cannot record this for them.
- Note what was looked at (screen size, browser, the states tried).

## Words

component, components, props, css, hook, hooks, render, state, store, route, dom

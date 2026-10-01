---
adapter_id: web-ui
adapter_version: 1.3.1
axes: [surface:ui, technology:browser]
requires: [generic]
incompatible_with: []
precedence: 20
---

# Web UI Compatibility Adapter

Optional adapter for browser applications.

- Entry points: application bootstrap and route table.
- Components: layouts, pages/screens, shared components, feature data services/stores, guards, client adapters.
- Contracts: routes, form/input models, API models, view models, accessibility/interaction behavior.
- Required interface states when applicable: loading, empty, validation, error, success, unauthorized.
- Checks: route coverage, API isolation, responsive/accessibility scenarios, no secret embedding, visual evidence metadata.
- Framework, CSS/UI library, token storage, route structure, and build commands belong to the project profile/design.

## Quality-by-design contributions

- **Discovery:** primary journey, first-view focus, visual priority, reference authority,
  responsive targets, input modes, accessibility, content realism, and unacceptable
  experience outcomes.
- **Reference dimensions:** composition, hierarchy, density, scale, color, typography,
  motion, interaction feedback, responsive behavior, and retain/adapt/reject choices.
- **Pattern candidates:** information hierarchy, state ownership, responsive layout,
  interaction feedback, rendering/performance, accessibility, and error recovery. Exact
  framework patterns remain project decisions.
- **Criteria:** user-observable hierarchy, completeness, legibility, interaction,
  responsiveness, accessibility, content credibility, and routed performance outcomes.
- **Evidence:** screenshots/visual review need viewport, state, source revision,
  reference, expected outcome, reviewer, and limitations.

This adapter does not require WebGL, React, a CSS framework, or a specific visual
style. More specialized adapters may add guidance through the composition contract.

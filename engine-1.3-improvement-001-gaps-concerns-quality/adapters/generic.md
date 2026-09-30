---
adapter_id: generic
adapter_version: 1.3.1
axes: [surface:generic]
requires: []
incompatible_with: []
precedence: 0
---

# Generic / Manual Adapter

Use when no technology-specific adapter is available.

- Project profile declares source roots, source extensions, commands, generated paths, and exclusions.
- Inventory identifies entry points, contracts, components, actions, tests, configuration, and operational files manually.
- Unsupported automated checks are `not-supported`, never PASS.
- Manual evidence records exact scope and reviewer.
- No project is required to invent services, endpoints, pages, databases, or deployment artifacts that do not apply.

## Contributions

- **Discovery:** outcome, audience, priorities, unacceptable outcomes, constraints,
  affected boundaries, content/data credibility, and quality authority.
- **Patterns:** require an explicit decision for material choices; contribute no
  technology choice by default.
- **Criteria:** outcomes must be observable and use a declared proof method.
- **Evidence:** optional runners may be bound by the project; missing runners yield
  `manual-required` or `not-supported`, never PASS.

Every other adapter composes with this baseline. A specialized contribution retains
its adapter provenance and cannot weaken an approved core/project `must`.

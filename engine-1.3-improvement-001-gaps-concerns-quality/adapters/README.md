# Adapter Composition Contract

Adapters specialize the generic lifecycle without changing it. The project profile
selects adapters explicitly; `generic` is always the baseline.

## Required manifest fields

- `adapter_id` and `adapter_version`;
- `axes`, such as `surface:ui`, `archetype:visualization`, or `technology:http`;
- `requires` and `incompatible_with` adapter IDs;
- integer `precedence` used only for deterministic contribution order.

## Composition procedure

1. Route work and discover candidate adapters from project kind, sources, and affected
   boundaries.
2. Record selected and rejected candidates with rationale in the Change.
3. Resolve all prerequisites and version expectations.
4. Reject named incompatibilities before design.
5. Merge low-to-high precedence while retaining adapter provenance.
6. If two contributions conflict, stop for an explicit project decision. Precedence
   orders compatible contributions; it never authorizes silent override.
7. Trace selected required contributions into QDC, patterns, tasks, and Context Packs.

Adapters may contribute questions, risk triggers, patterns, criteria, examples,
anti-patterns, and optional runner hooks. They cannot reduce a core/project `must`,
declare product truth, or award PASS. Project decisions own concrete thresholds and
technology choices.

## External adapters and runners

External adapters use the same manifest. Optional runner hooks identify a project
command/procedure and normalized evidence fields; the engine does not execute arbitrary
commands during `validate` or `index`. An unavailable runner yields `manual-required`
or `not-supported` according to project policy.
